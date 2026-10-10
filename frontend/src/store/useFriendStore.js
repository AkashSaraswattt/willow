import { create } from 'zustand';
import { friendAPI } from '../lib/friend.api.js';
import toast from 'react-hot-toast';

export const useFriendStore = create((set, get) => ({
  sentRequests: [],
  receivedRequests: [],
  searchResults: [],
  discoverableUsers: [],
  friends: [],
  isLoading: false,
  isSearching: false,
  isLoadingDiscoverable: false,

  // Search users
  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });
    try {
      const data = await friendAPI.searchUsers(query);
      set({ searchResults: data.users || [] });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search users');
    } finally {
      set({ isSearching: false });
    }
  },

  // Send friend request
  sendFriendRequest: async (recipientId, message = '') => {
    try {
      const data = await friendAPI.sendRequest(recipientId, message);
      
      // Update search results to reflect sent request
      const { searchResults } = get();
      const updatedResults = searchResults.map(user => 
        user._id === recipientId 
          ? { ...user, hasPendingRequest: true }
          : user
      );
      
      set({ searchResults: updatedResults });
      
      // Refresh sent requests
      get().fetchSentRequests();
      
      toast.success('Friend request sent!');
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send friend request';
      toast.error(message);
      throw error;
    }
  },

  // Cancel friend request
  cancelFriendRequest: async (requestId) => {
    try {
      await friendAPI.cancelRequest(requestId);
      
      // Remove from sent requests
      const { sentRequests } = get();
      set({ sentRequests: sentRequests.filter(req => req._id !== requestId) });
      
      toast.success('Friend request cancelled');
    } catch (error) {
      toast.error('Failed to cancel request');
      throw error;
    }
  },

  // Respond to friend request
  respondToFriendRequest: async (requestId, action) => {
    try {
      console.log('Responding to request:', { requestId, action });
      const response = await friendAPI.respondToRequest(requestId, action);
      console.log('Response received:', response);
      
      // Remove from received requests
      const { receivedRequests } = get();
      set({ receivedRequests: receivedRequests.filter(req => req._id !== requestId) });
      
      if (action === 'accept') {
        // Refresh friends list and chat users
        get().fetchFriendsList();
        // Import dynamically to avoid circular dependency
        import('./useChatStore.js').then(({ useChatStore }) => {
          useChatStore.getState().getUsers();
        });
        toast.success('Friend request accepted!');
      } else {
        toast.success('Friend request rejected');
      }
    } catch (error) {
      console.error('Error in respondToFriendRequest:', error);
      toast.error(`Failed to ${action} request: ${error.response?.data?.error || error.message}`);
      throw error;
    }
  },

  // Fetch sent requests
  fetchSentRequests: async () => {
    set({ isLoading: true });
    try {
      const data = await friendAPI.getSentRequests();
      set({ sentRequests: data.requests || [] });
    } catch (error) {
      console.error('Failed to fetch sent requests:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch received requests
  fetchReceivedRequests: async () => {
    set({ isLoading: true });
    try {
      const data = await friendAPI.getReceivedRequests();
      set({ receivedRequests: data.requests || [] });
    } catch (error) {
      console.error('Failed to fetch received requests:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch friends list
  fetchFriendsList: async () => {
    try {
      const data = await friendAPI.getFriendsList();
      set({ friends: data.friends || [] });
    } catch (error) {
      console.error('Failed to fetch friends list:', error);
    }
  },

  // Socket event handlers
  handleNewFriendRequest: (request) => {
    const { receivedRequests } = get();
    set({ receivedRequests: [request, ...receivedRequests] });
  },

  handleFriendRequestUpdate: (update) => {
    const { sentRequests } = get();
    if (update.status === 'accepted' || update.status === 'rejected') {
      set({ sentRequests: sentRequests.filter(req => req._id !== update.requestId) });
      if (update.status === 'accepted') {
        get().fetchFriendsList();
        // Also refresh chat users when request is accepted
        import('./useChatStore.js').then(({ useChatStore }) => {
          useChatStore.getState().getUsers();
        });
      }
    }
  },

  handleFriendsListUpdate: (friends) => {
    set({ friends });
    // Also update chat store users list
    import('./useChatStore.js').then(({ useChatStore }) => {
      useChatStore.getState().getUsers();
    });
  },

  // Fetch discoverable users (default grid)
  fetchDiscoverableUsers: async (limit = 12) => {
    set({ isLoadingDiscoverable: true });
    try {
      // Use search API with empty query to get all users
      const data = await friendAPI.searchUsers('', limit, 0);
      set({ discoverableUsers: data.users || [] });
    } catch (error) {
      console.error('Failed to fetch discoverable users:', error);
      set({ discoverableUsers: [] });
    } finally {
      set({ isLoadingDiscoverable: false });
    }
  },

  // Clear search results
  clearSearch: () => {
    set({ searchResults: [] });
  }
}));