const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// CREATE notification for task assignment
router.post('/create', auth, async (req, res) => {
    try {
        const { recipientId, taskName, assignedBy, projectName, dueDate } = req.body;
        const currentUserId = req.user.userId;

        if (!recipientId || !taskName || !assignedBy) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Ensure notification is only created for the recipient, not the sender
        if (recipientId === currentUserId) {
            return res.status(400).json({ message: 'Cannot create notification for yourself' });
        }

        console.log('Creating notification - Sender:', currentUserId, 'Recipient:', recipientId, 'Task:', taskName);

        const notification = new Notification({
            recipient: recipientId,
            type: 'TASK_ASSIGNED',
            message: `${assignedBy} assigned you a new task: ${taskName}`,
            read: false,
            metadata: {
                assignedBy: assignedBy,
                taskName: taskName,
                projectName: projectName,
                dueDate: dueDate
            }
        });
        
        await notification.save();
        console.log('Notification created successfully:', notification._id, 'for recipient:', recipientId);

        res.status(201).json({
            message: 'Notification created successfully',
            notification: notification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Failed to create notification', error: error.message });
    }
});

// GET all notifications for the logged-in user
// This endpoint returns notifications with the most recent ones first

router.get('/', auth, async (req, res) => {
    try {
        // Find all notifications for this user, sorted by newest first
        const notifications = await Notification.find({
            recipient: req.user.userId
        })
            .sort({ createdAt: -1 }) // -1 means descending order (newest first)
            .limit(50); // Limit to 50 most recent to avoid overwhelming the client

        // Count how many are unread (for the badge number)
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.userId,
            read: false
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

// Mark all notifications as read
// This is called when user clicks "Mark all as read"
// IMPORTANT: This must come BEFORE the /:notificationId routes
router.put('/mark-all-read', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            {
                recipient: req.user.userId,
                read: false
            },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Failed to update notifications' });
    }
});

// Mark a specific notification as read
// This is called when user clicks on a notification
router.put('/:notificationId/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.notificationId,
                recipient: req.user.userId // Ensure user can only mark their own notifications
            },
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
});

// Delete a notification
// This is called when user dismisses a notification
router.delete('/:notificationId', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.notificationId,
            recipient: req.user.userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
});

module.exports = router;