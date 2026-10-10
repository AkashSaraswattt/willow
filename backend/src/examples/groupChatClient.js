// Example client-side socket usage for Group Chat
// Add this to your existing socket setup in frontend

import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  query: { userId: currentUser._id }
});

// GROUP CHAT CLIENT EVENTS

// Join group room when opening group chat
const joinGroupRoom = (groupId, userId) => {
  socket.emit('group:join', { groupId, userId });
};

// Leave group room when closing group chat
const leaveGroupRoom = (groupId) => {
  socket.emit('group:leave', { groupId });
};

// Send group message
const sendGroupMessage = (messageData) => {
  // messageData: { groupId, senderId, text?, image? }
  socket.emit('group:message:send', messageData);
};

// Listen for new group messages
socket.on('group:newMessage', (message) => {
  // Update group chat UI with new message
  console.log('New group message:', message);
  // Add to messages state/store
});

// Listen for blocked messages
socket.on('group:message:blocked', (data) => {
  // Show user their message was blocked
  console.log('Message blocked:', data.reason);
  // Show toast/alert with reason
});

// Listen for rephrased messages
socket.on('group:message:rephrased', (data) => {
  // Show user their message was rephrased
  console.log('Message rephrased:', data.original, '->', data.rephrased);
  // Show toast with original and rephrased text
});

// Listen for message errors
socket.on('group:message:error', (data) => {
  console.error('Group message error:', data.error);
  // Show error toast
});

// Listen for member events
socket.on('group:member_joined', (data) => {
  console.log('Member joined:', data.member.username);
  // Update member list UI
});

socket.on('group:member_left', (data) => {
  console.log('Member left:', data.member.username);
  // Update member list UI
});

socket.on('group:member_removed', (data) => {
  console.log('Member removed:', data.member.username);
  // Update member list UI
});

socket.on('group:removed', (data) => {
  console.log('You were removed from group:', data.groupId);
  // Redirect user away from group chat
  // Remove group from user's group list
});

// EXAMPLE REACT HOOK FOR GROUP CHAT
/*
import { useEffect, useState } from 'react';
import { useSocketContext } from '../context/SocketContext';

export const useGroupChat = (groupId, userId) => {
  const { socket } = useSocketContext();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket || !groupId) return;

    // Join group room
    socket.emit('group:join', { groupId, userId });
    setIsConnected(true);

    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleMessageBlocked = (data) => {
      toast.error(`Message blocked: ${data.reason}`);
    };

    const handleMessageRephrased = (data) => {
      toast.info(`Message rephrased from "${data.original}" to "${data.rephrased}"`);
    };

    socket.on('group:newMessage', handleNewMessage);
    socket.on('group:message:blocked', handleMessageBlocked);
    socket.on('group:message:rephrased', handleMessageRephrased);

    // Cleanup
    return () => {
      socket.emit('group:leave', { groupId });
      socket.off('group:newMessage', handleNewMessage);
      socket.off('group:message:blocked', handleMessageBlocked);
      socket.off('group:message:rephrased', handleMessageRephrased);
      setIsConnected(false);
    };
  }, [socket, groupId, userId]);

  const sendMessage = (text, image = null) => {
    if (!socket || !isConnected) return;
    
    socket.emit('group:message:send', {
      groupId,
      senderId: userId,
      text,
      image
    });
  };

  return { messages, sendMessage, isConnected };
};
*/

// EXAMPLE API CALLS
/*
// Create group
const createGroup = async (name, avatar) => {
  const response = await fetch('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, avatar }),
    credentials: 'include'
  });
  return response.json();
};

// Join group
const joinGroup = async (joinCode) => {
  const response = await fetch('/api/groups/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ joinCode }),
    credentials: 'include'
  });
  return response.json();
};

// Get user's groups
const getUserGroups = async () => {
  const response = await fetch('/api/groups/me', {
    credentials: 'include'
  });
  return response.json();
};

// Get group messages
const getGroupMessages = async (groupId, page = 1) => {
  const response = await fetch(`/api/groups/${groupId}/messages?page=${page}`, {
    credentials: 'include'
  });
  return response.json();
};

// Get group QR code
const getGroupQR = async (groupId) => {
  const response = await fetch(`/api/groups/${groupId}/qr`, {
    credentials: 'include'
  });
  return response.json();
};

// Leave group
const leaveGroup = async (groupId) => {
  const response = await fetch(`/api/groups/${groupId}/leave`, {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
};
*/

export {
  joinGroupRoom,
  leaveGroupRoom,
  sendGroupMessage
};