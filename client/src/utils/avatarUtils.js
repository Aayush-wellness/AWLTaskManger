// Generate initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  // Take first letter of first name and first letter of last name
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Generate different colors based on name
const getAvatarColor = (name) => {
  if (!name) return '#6366f1';
  
  const colors = [
    '#6366f1', // Blue
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#f97316', // Orange
    '#6b7280'  // Gray
  ];
  
  // Use first character to determine color
  const charCode = name.charAt(0).toUpperCase().charCodeAt(0);
  const colorIndex = charCode % colors.length;
  return colors[colorIndex];
};

// Generate a data URL for a simple colored avatar with initials
const generateDefaultAvatar = (size = 120, name = '') => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);
  
  // Background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);
  
  return canvas.toDataURL();
};

// Utility function to get full avatar URL
export const getAvatarUrl = (avatarPath, userName = '') => {
  if (!avatarPath) {
    return generateDefaultAvatar(120, userName);
  }
  
  // If it's already a full URL (http/https) or data URL, return as is
  if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
    return avatarPath;
  }
  
  // Construct full URL for relative paths
  const baseURL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL || window.location.origin
    : 'http://localhost:5002';
    
  return `${baseURL}${avatarPath}`;
};

// Utility function for small avatars (32px)
export const getSmallAvatarUrl = (avatarPath, userName = '') => {
  if (!avatarPath) {
    return generateDefaultAvatar(32, userName);
  }
  
  return getAvatarUrl(avatarPath, userName);
};

// Utility function for table avatars (30px)
export const getTableAvatarUrl = (avatarPath, userName = '') => {
  if (!avatarPath) {
    return generateDefaultAvatar(30, userName);
  }
  
  return getAvatarUrl(avatarPath, userName);
};