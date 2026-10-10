import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    // Restore from localStorage first
    const savedAuthUser = localStorage.getItem("auth-user");
    if (savedAuthUser) {
      try {
        set({ authUser: JSON.parse(savedAuthUser) });
      } catch (e) {
        localStorage.removeItem("auth-user");
      }
    }

    // Fallback timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      set({ isCheckingAuth: false });
    }, 5000);
    
    try {
      const res = await axiosInstance.get("/auth/check");
      clearTimeout(timeoutId);
      set({ authUser: res.data });
      localStorage.setItem("auth-user", JSON.stringify(res.data));
      get().connectSocket();
    } catch (error) {
      clearTimeout(timeoutId);
      console.log("Error in checkAuth:", error);
      // Keep the restored user if check fails, don't clear it
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      localStorage.setItem("auth-user", JSON.stringify(res.data));
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      localStorage.setItem("auth-user", JSON.stringify(res.data));
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem("auth-user");
      toast.success("Logged out successfully");
      get().disconnectSocket();
      // Force redirect to login page
      window.location.href = '/login';
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      localStorage.setItem("auth-user", JSON.stringify(res.data));
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Friend request socket events
    socket.on("friend:request_sent", (data) => {
      import('./useFriendStore.js').then(({ useFriendStore }) => {
        useFriendStore.getState().handleNewFriendRequest(data.request);
      });
    });

    socket.on("friend:request_update", (data) => {
      import('./useFriendStore.js').then(({ useFriendStore }) => {
        useFriendStore.getState().handleFriendRequestUpdate(data);
      });
    });

    socket.on("friends:list_updated", (data) => {
      import('./useFriendStore.js').then(({ useFriendStore }) => {
        useFriendStore.getState().handleFriendsListUpdate(data.friends);
      });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
