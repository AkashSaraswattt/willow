import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import DiscoverPage from "./pages/DiscoverPage";
import GroupsPage from "./pages/GroupsPage";
import LandingPage from "./pages/LandingPage";
import AlternateLandingPage from "./pages/AlternateLandingPage";
import AdminDashboard from "./pages/AdminDashboard";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect, useState } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  console.log({ onlineUsers });

  useEffect(() => {
    if (
      location.pathname !== "/signup" &&
      location.pathname !== "/verify-otp"
    ) {
      checkAuth();
    }
  }, [location.pathname, checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      {authUser && !authUser.isAdmin && <Navbar />}

      <Routes>
        <Route path="/" element={authUser ? (authUser.isAdmin ? <Navigate to="/admin" /> : <HomePage />) : (isMobile ? <AlternateLandingPage /> : <LandingPage />)} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/discover" element={authUser ? <DiscoverPage /> : <Navigate to="/login" />} />
        <Route path="/groups" element={authUser ? <GroupsPage /> : <Navigate to="/login" />} />
        <Route path="/admin" element={authUser?.isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/alt-landing" element={<AlternateLandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
