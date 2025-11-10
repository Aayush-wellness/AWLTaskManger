const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { auth, adminAuth } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// Get tasks (employee: own tasks, admin: all tasks with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { department, employee, startDate, endDate } = req.query;
    
    let query = {};

    if (req.user.role === 'employee') {
      query.employee = req.user.userId;
    } else {
      if (employee) query.employee = employee;
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
    }

    let tasks = await Task.find(query)
      .populate('employee', 'name email department')
      .populate('project', 'name')
      .sort({ date: -1 });

    if (department && req.user.role === 'admin') {
      tasks = tasks.filter(task => task.employee.department?.toString() === department);
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create task (employee)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, project } = req.body;

    const task = new Task({
      title,
      description,
      project,
      employee: req.user.userId,
      status: 'pending'
    });

    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('employee', 'name email')
      .populate('project', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task status and remark
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, remark } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'employee' && task.employee.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status || task.status;
    task.remark = remark || task.remark;

    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate('employee', 'name email')
      .populate('project', 'name');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download Excel (employees can download their own, admins can download all)
router.get('/export/excel', auth, async (req, res) => {
  try {
    const { department, employee, startDate, endDate } = req.query;
    
    let query = {};

    // Employees can only download their own tasks
    if (req.user.role === 'employee') {
      query.employee = req.user.userId;
    } else {
      // Admins can filter by employee
      if (employee) query.employee = employee;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.date.$lte = endDateTime;
      }
    }

    let tasks = await Task.find(query)
      .populate('employee', 'name email department')
      .populate('project', 'name')
      .sort({ date: -1 });

    if (department && req.user.role === 'admin') {
      tasks = tasks.filter(task => task.employee.department?.toString() === department);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Employee', key: 'employee', width: 20 },
      { header: 'Task Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Project', key: 'project', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Remark', key: 'remark', width: 30 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    tasks.forEach(task => {
      worksheet.addRow({
        date: new Date(task.date).toLocaleDateString(),
        employee: task.employee.name,
        title: task.title,
        description: task.description,
        project: task.project.name,
        status: task.status,
        remark: task.remark || ''
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
