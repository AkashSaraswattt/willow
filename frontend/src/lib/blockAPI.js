import { axiosInstance } from "./axios.js";

export const blockAPI = {
  blockUser: (userId) => axiosInstance.post("/block/block", { userId }),
  unblockUser: (userId) => axiosInstance.post("/block/unblock", { userId }),
  getBlockStatus: (userId) => axiosInstance.get(`/block/status/${userId}`)
};