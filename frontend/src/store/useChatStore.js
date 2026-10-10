import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { blockAPI } from "../lib/blockAPI";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  isSendingGroupMessage: false,
  aiUsers: [],
  showAiPanel: false,
  activeAi: null,
  chatMode: 'human', // 'human' or 'ai'
  blockStatus: null, // { iBlockedThem, theyBlockedMe, canCommunicate }

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      // Get friends list instead of all users
      const res = await axiosInstance.get("/friends/list");
      set({ users: res.data.friends || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load friends');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/groups/me");
      set({ groups: res.data || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load groups');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      
      // Emit mark as read via socket
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit('mark_as_read', {
          senderId: userId,
          receiverId: useAuthStore.getState().authUser._id
        });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ messages: res.data });
      
      // Mark group messages as read
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit('group:mark_as_read', {
          groupId,
          userId: useAuthStore.getState().authUser._id
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  getSuggestion: async (text) => {
    try {
      const res = await axiosInstance.post('/moderation/suggest', { text });
      console.log('Suggestion response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error getting suggestion:', error);
      return null;
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    
    set({ isSendingMessage: true });
    
    try {
      // Send to backend first for moderation
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      
      // Only add to UI after backend approves
      set({ messages: [...messages, res.data] });
    } catch (error) {
      if (error.response?.status === 400) {
        // Message was blocked - show error
        toast.error(error.response.data.error);
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      set({ isSendingMessage: false });
    }
  },

  sendGroupMessage: async (messageData) => {
    set({ isSendingGroupMessage: true });
    
    try {
      console.log('Sending group message:', messageData);
      // Send to backend first for moderation (same as private messages)
      const res = await axiosInstance.post(`/groups/${messageData.groupId}/messages`, {
        text: messageData.text,
        image: messageData.image,
        bypassModeration: messageData.bypassModeration
      });
      
      console.log('Group message sent successfully:', res.data);
      // Message will be broadcasted via socket from backend
      // No need to add to UI here as socket will handle it
    } catch (error) {
      console.error('Group message send error:', error);
      if (error.response?.status === 400) {
        // Message was blocked - show error
        toast.error(error.response.data.error);
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      set({ isSendingGroupMessage: false });
    }
  },

  deleteMessage: async (messageId, deleteType) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`, {
        data: { deleteType }
      });
      
      if (deleteType === 'me') {
        set({ messages: get().messages.filter(m => m._id !== messageId) });
      } else {
        set({
          messages: get().messages.map(msg => 
            msg._id === messageId
              ? { ...msg, deletedForEveryone: true, text: 'This message was deleted', image: null }
              : msg
          )
        });
      }
      toast.success('Message deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete message');
      throw error;
    }
  },

  deleteGroupMessage: async (groupId, messageId, deleteType) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}/messages/${messageId}`, {
        data: { deleteType }
      });
      
      if (deleteType === 'me') {
        set({ messages: get().messages.filter(m => m._id !== messageId) });
      } else {
        set({
          messages: get().messages.map(msg => 
            msg._id === messageId
              ? { ...msg, deletedForEveryone: true, text: 'This message was deleted', image: null }
              : msg
          )
        });
      }
      toast.success('Message deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete message');
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Check if it's a group or individual chat
    if (selectedUser.memberCount) {
      // Group chat subscription
      socket.emit('group:join', { groupId: selectedUser._id, userId: useAuthStore.getState().authUser._id });
      
      socket.on('group:newMessage', (newMessage) => {
        console.log('Received group message:', newMessage);
        const currentSelectedGroup = get().selectedUser;
        const isCurrentGroup = currentSelectedGroup?._id === newMessage.groupId;
        
        if (isCurrentGroup) {
          const existingMessage = get().messages.find(m => m._id === newMessage._id);
          if (!existingMessage) {
            console.log('Adding message to current group chat');
            set({ messages: [...get().messages, newMessage] });
          }
        } else {
          console.log('Message for different group, updating unread count');
        }
        
        // Update groups list
        set({
          groups: get().groups.map(group => {
            if (group._id === newMessage.groupId) {
              return {
                ...group,
                unreadCount: isCurrentGroup ? 0 : (group.unreadCount || 0) + 1,
                lastActivity: new Date().toISOString()
              };
            }
            return group;
          })
        });
      });
      
      // Handle blocked group messages
      socket.on('group:message:blocked', ({ original, reason }) => {
        const { toast } = require('react-hot-toast');
        toast.error(reason || 'Message was blocked due to inappropriate content');
      });
      
      // Handle rephrased group messages
      socket.on('group:message:rephrased', ({ original, rephrased }) => {
        const { toast } = require('react-hot-toast');
        toast.success('Message was automatically improved for better communication');
      });
      
      socket.on('group:unread_update', ({ groupId, increment, reset }) => {
        const currentSelectedGroup = get().selectedUser;
        const isCurrentGroup = currentSelectedGroup?._id === groupId;
        
        set({
          groups: get().groups.map(group => {
            if (group._id === groupId) {
              return {
                ...group,
                unreadCount: reset || isCurrentGroup ? 0 : (group.unreadCount || 0) + (increment || 0),
                lastActivity: new Date().toISOString()
              };
            }
            return group;
          })
        });
      });
      
      socket.on('group:messages_read', ({ userId }) => {
        set({
          messages: get().messages.map(msg => {
            if (msg.senderId._id === useAuthStore.getState().authUser._id && !msg.readBy?.some(r => r.userId === userId)) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), { userId, readAt: new Date() }]
              };
            }
            return msg;
          })
        });
      });
      
      socket.on('group:message_deleted', ({ messageId, deleteType }) => {
        if (deleteType === 'everyone') {
          set({
            messages: get().messages.map(msg => 
              msg._id === messageId
                ? { ...msg, deletedForEveryone: true, text: 'This message was deleted', image: null }
                : msg
            )
          });
        }
      });
    } else {
      // Individual chat subscription
      socket.on("new_message", (newMessage) => {
        const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
        if (!isMessageSentFromSelectedUser) return;

        set({ messages: [...get().messages, newMessage] });
        
        // Mark as read immediately
        socket.emit('mark_as_read', {
          senderId: selectedUser._id,
          receiverId: useAuthStore.getState().authUser._id
        });
      });
      
      socket.on('messages_read', ({ userId }) => {
        if (userId === selectedUser._id) {
          set({
            messages: get().messages.map(msg => 
              msg.senderId === useAuthStore.getState().authUser._id && msg.receiverId === userId
                ? { ...msg, status: 'read' }
                : msg
            )
          });
        }
      });
      
      socket.on('message_deleted', ({ messageId, deleteType }) => {
        if (deleteType === 'everyone') {
          set({
            messages: get().messages.map(msg => 
              msg._id === messageId
                ? { ...msg, deletedForEveryone: true, text: 'This message was deleted', image: null }
                : msg
            )
          });
        }
      });
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    
    if (selectedUser?.memberCount) {
      socket.off('group:newMessage');
      socket.off('group:messages_read');
      socket.off('group:message:blocked');
      socket.off('group:message:rephrased');
      socket.off('group:message_deleted');
      socket.emit('group:leave', { groupId: selectedUser._id });
    } else {
      socket.off("new_message");
      socket.off("messages_read");
      socket.off("message_deleted");
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser, blockStatus: null });
    // Clear unread count immediately for this user/group
    if (selectedUser && selectedUser._id) {
      if (selectedUser.memberCount) {
        // Update groups
        set({
          groups: get().groups.map(group => 
            group._id === selectedUser._id ? { ...group, unreadCount: 0 } : group
          )
        });
      } else {
        // Update users
        set({
          users: get().users.map(user => 
            user._id === selectedUser._id ? { ...user, unreadCount: 0 } : user
          )
        });
      }
    }
    
    // Get block status for private chats
    if (selectedUser && !selectedUser.memberCount && selectedUser.type !== 'ai') {
      get().getBlockStatus(selectedUser._id);
    }
  },

  getBlockStatus: async (userId) => {
    try {
      const res = await blockAPI.getBlockStatus(userId);
      set({ blockStatus: res.data });
      return res.data;
    } catch (error) {
      console.error('Error getting block status:', error);
      return null;
    }
  },

  blockUser: async (userId) => {
    try {
      await blockAPI.blockUser(userId);
      set({ blockStatus: { iBlockedThem: true, theyBlockedMe: get().blockStatus?.theyBlockedMe || false, canCommunicate: false } });
      toast.success('User blocked successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to block user');
    }
  },

  unblockUser: async (userId) => {
    try {
      await blockAPI.unblockUser(userId);
      set({ blockStatus: { iBlockedThem: false, theyBlockedMe: get().blockStatus?.theyBlockedMe || false, canCommunicate: !get().blockStatus?.theyBlockedMe } });
      toast.success('User unblocked successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to unblock user');
    }
  },

  // AI functionality
  openAiPanel: () => {
    const aiUsers = [
      { id: 'grok', name: 'WillowAI', fullName: 'WillowAI', type: 'ai', isOnline: true }
    ];
    set({ aiUsers, showAiPanel: true, chatMode: 'ai', selectedUser: null, activeAi: null, messages: [] });
  },

  openHumanChat: () => {
    set({ 
      showAiPanel: false, 
      chatMode: 'human', 
      selectedUser: null, 
      activeAi: null, 
      messages: [],
      aiUsers: []
    });
  },

  setActiveAi: (aiId) => {
    const aiUser = get().aiUsers.find(ai => ai.id === aiId);
    if (aiUser) {
      set({ selectedUser: aiUser, activeAi: aiId, messages: [] });
    }
  },

  sendAiMessage: async (message) => {
    const { activeAi, messages } = get();
    if (!activeAi) return;

    try {
      // Add user message immediately
      const userMessage = {
        _id: Date.now().toString(),
        text: message,
        senderId: useAuthStore.getState().authUser._id,
        createdAt: new Date().toISOString()
      };
      set({ messages: [...messages, userMessage] });

      // Call AI API
      const res = await axiosInstance.post('/ai/chat', {
        model: activeAi,
        message: message
      });

      // Add AI response
      const aiMessage = {
        _id: (Date.now() + 1).toString(),
        text: res.data.reply,
        senderId: activeAi,
        createdAt: new Date().toISOString()
      };
      set({ messages: [...get().messages, aiMessage] });
    } catch (error) {
      toast.error('AI service unavailable. Please try again.');
    }
  },
}));
