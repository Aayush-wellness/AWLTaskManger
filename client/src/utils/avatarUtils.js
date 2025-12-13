// Utility function to get full avatar URL
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return 'https://via.placeholder.com/120?text=No+Avatar';
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
export const getSmallAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return 'https://via.placeholder.com/32?text=U';
  }
  
  return getAvatarUrl(avatarPath);
};

// Utility function for table avatars (30px)
export const getTableAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return 'https://via.placeholder.com/30?text=U';
  }
  
  return getAvatarUrl(avatarPath);
};