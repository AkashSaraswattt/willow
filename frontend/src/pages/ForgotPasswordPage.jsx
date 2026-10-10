import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, Lock, Eye, EyeOff, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp + password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      if (response.data.success) {
        toast.success("Password reset OTP sent to your email");
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      if (response.data.success) {
        toast.success("OTP resent successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Password is required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });
      toast.success("Password reset successfully!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex" style={{backgroundColor: '#0B1220'}}>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* LEFT SIDE - Form */}
        <div className="flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-4">
          <Link 
            to="/login" 
            className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors w-fit"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Login
          </Link>

          <h2 className="text-xl sm:text-2xl lg:text-2xl font-semibold mb-3">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h2>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">
            {step === 1 ? "Enter your email to receive a reset code" : "Enter OTP and your new password"}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-white mb-2 font-medium text-sm">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors text-sm"
                    style={{backgroundColor: '#141C2F', border: '1px solid rgba(255,255,255,0.08)'}}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-base disabled:opacity-50 transition-all duration-200 shadow-lg"
                style={{background: 'linear-gradient(135deg, #E6651A 0%, #D84315 100%)'}}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin inline mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-white mb-2 font-medium text-sm">Enter OTP</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl text-white text-center text-xl tracking-widest placeholder-gray-400 focus:outline-none transition-colors"
                  style={{backgroundColor: '#141C2F', border: '1px solid rgba(255,255,255,0.08)'}}
                  placeholder="000000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-300 text-xs">Check your email for the 6-digit code</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="flex items-center text-orange-400 hover:text-orange-300 text-xs transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className={`size-3 mr-1 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? "Resending..." : "Resend OTP"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 font-medium text-sm">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors text-sm"
                    style={{backgroundColor: '#141C2F', border: '1px solid rgba(255,255,255,0.08)'}}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-base disabled:opacity-50 transition-all duration-200 shadow-lg"
                style={{background: 'linear-gradient(135deg, #E6651A 0%, #D84315 100%)'}}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin inline mr-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="text-center mt-5 text-gray-300 text-sm">
              Remember your password?{" "}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </div>

        {/* RIGHT SIDE - Full Image */}
        <div className="hidden lg:block">
          <img 
            src="/SignUpRight.png" 
            alt="Willow Chat Illustration" 
            className="w-full h-screen object-cover"
          />
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;