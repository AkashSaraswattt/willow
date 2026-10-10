const API_BASE = import.meta.env.PROD 
  ? '/api/groups' 
  : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/groups`;

export const groupsAPI = {
  // Create a new group
  createGroup: async (name, avatar = null) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = JSON.parse(text);
      } catch {
        error = { error: `Server error: ${response.status}` };
      }
      throw new Error(error.error || 'Failed to create group');
    }
    
    return response.json();
  },

  // Join a group using join code
  joinGroup: async (joinCode) => {
    const response = await fetch(`${API_BASE}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ joinCode }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = JSON.parse(text);
      } catch {
        error = { error: `Server error: ${response.status}` };
      }
      throw new Error(error.error || 'Failed to join group');
    }
    
    return response.json();
  },

  // Get user's groups
  getUserGroups: async () => {
    const response = await fetch(`${API_BASE}/me`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }
    
    return response.json();
  },

  // Get group messages
  getGroupMessages: async (groupId, page = 1) => {
    const response = await fetch(`${API_BASE}/${groupId}/messages?page=${page}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    
    return response.json();
  },

  // Get group QR code
  getGroupQR: async (groupId) => {
    const response = await fetch(`${API_BASE}/${groupId}/qr`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to get QR code');
    }
    
    return response.json();
  },

  // Leave group
  leaveGroup: async (groupId) => {
    const response = await fetch(`${API_BASE}/${groupId}/leave`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to leave group');
    }
    
    return response.json();
  }
};