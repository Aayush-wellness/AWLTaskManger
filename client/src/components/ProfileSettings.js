import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Download, Edit2, Save, X, Camera } from 'lucide-react';
import axios from '../config/axios';
import { getAvatarUrl } from '../utils/avatarUtils';
import '../styles/ProfileSettings.css';

const ProfileSettings = ({ isOpen, onClose, onProfileUpdate }) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    jobTitle: '',
    startDate: '',
    avatar: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile from backend...');
        // Fetch latest user data from backend
        const response = await axios.get('/api/auth/me');
        const userData = response.data;
        console.log('Fetched user data:', userData);
        
        const profileData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          department: userData.department?.name || userData.department || '',
          jobTitle: userData.jobTitle || '',
          startDate: userData.startDate ? userData.startDate.split('T')[0] : '',
          avatar: userData.avatar || ''
        };
        
        setProfileData(profileData);
        setOriginalData(profileData);
        setAvatarPreview(userData.avatar || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to user from context if API fails
        if (user) {
          console.log('Using fallback user data from context:', user);
          const userData = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            department: user.department?.name || user.department || '',
            jobTitle: user.jobTitle || '',
            startDate: user.startDate ? user.startDate.split('T')[0] : '',
            avatar: user.avatar || ''
          };
          setProfileData(userData);
          setOriginalData(userData);
          setAvatarPreview(user.avatar || '');
        }
      }
    };

    if (isOpen && user) {
      fetchUserProfile();
    }
  }, [user, isOpen]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('Saving profile data:', profileData);
      console.log('Avatar file:', avatarFile);
      
      const formData = new FormData();
      
      // Add profile data (excluding department and avatar)
      Object.keys(profileData).forEach(key => {
        if (key !== 'avatar' && key !== 'department') {
          formData.append(key, profileData[key]);
        }
      });

      // Add avatar file if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      console.log('Making API call to /api/users/profile');
      const response = await axios.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('API response:', response.data);

      console.log('Profile update successful:', response.data);
      
      // Update user context with the response data
      updateUser(response.data.user);
      
      // Update local state
      const updatedProfileData = {
        name: response.data.user.name || '',
        email: response.data.user.email || '',
        phone: response.data.user.phone || '',
        address: response.data.user.address || '',
        department: response.data.user.department?.name || response.data.user.department || '',
        jobTitle: response.data.user.jobTitle || '',
        startDate: response.data.user.startDate ? response.data.user.startDate.split('T')[0] : '',
        avatar: response.data.user.avatar || ''
      };
      
      setProfileData(updatedProfileData);
      setOriginalData(updatedProfileData);
      setAvatarPreview(response.data.user.avatar || '');
      setIsEditing(false);
      setAvatarFile(null);
      
      // Call the callback to refresh any dependent components
      if (onProfileUpdate) {
        onProfileUpdate(response.data.user);
      }
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Failed to update profile';
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setAvatarPreview(originalData.avatar);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleDownloadAvatar = async () => {
    if (!user.avatar) {
      alert('No avatar to download');
      return;
    }

    try {
      // Construct full URL for avatar
      const avatarUrl = getAvatarUrl(user.avatar);
        
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.name}-avatar.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading avatar:', error);
      alert('Failed to download avatar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2>Profile Settings</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="profile-content">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              <img
                src={getAvatarUrl(avatarPreview)}
                alt="Profile Avatar"
                className="profile-avatar"
              />
              {isEditing && (
                <label className="avatar-upload-btn">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <div className="avatar-actions">
              {user.avatar && (
                <button onClick={handleDownloadAvatar} className="download-avatar-btn">
                  <Download size={16} />
                  Download Avatar
                </button>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <User size={16} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="form-value">{profileData.name || 'Not provided'}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="form-value">{profileData.email || 'Not provided'}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="form-value">{profileData.phone || 'Not provided'}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={16} />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="form-value">{profileData.address || 'Not provided'}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <User size={16} />
                  Department
                </label>
                <div className="form-value">
                  {profileData.department || 'Not provided'}
                  {isEditing && (
                    <small style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                      Department changes must be made by an administrator
                    </small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <User size={16} />
                  Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Enter your job title"
                  />
                ) : (
                  <div className="form-value">{profileData.jobTitle || 'Not provided'}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  Start Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profileData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                ) : (
                  <div className="form-value">
                    {profileData.startDate ? new Date(profileData.startDate).toLocaleDateString() : 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="cancel-btn" disabled={isLoading}>
                <X size={16} />
                Cancel
              </button>
              <button onClick={handleSave} className="save-btn" disabled={isLoading}>
                <Save size={16} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              <Edit2 size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;