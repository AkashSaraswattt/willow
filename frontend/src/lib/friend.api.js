import { axiosInstance } from './axios.js';

export const friendAPI = {
  sendRequest: async (recipientId, message = '') => {
    const response = await axiosInstance.post('/friends/request', {
      recipientId,
      message
    });
    return response.data;
  },

  cancelRequest: async (requestId) => {
    const response = await axiosInstance.post('/friends/request/cancel', {
      requestId
    });
    return response.data;
  },

  respondToRequest: async (requestId, action) => {
    const response = await axiosInstance.post('/friends/request/respond', {
      requestId,
      action
    });
    return response.data;
  },

  getSentRequests: async () => {
    const response = await axiosInstance.get('/friends/sent');
    return response.data;
  },

  getReceivedRequests: async () => {
    const response = await axiosInstance.get('/friends/received');
    return response.data;
  },

  getFriendsList: async () => {
    const response = await axiosInstance.get('/friends/list');
    return response.data;
  },

  searchUsers: async (query, limit = 10, offset = 0) => {
    const response = await axiosInstance.get('/friends/search', {
      params: { q: query || '', limit, offset }
    });
    return response.data;
  }
};