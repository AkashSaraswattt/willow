import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User, ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");
    return true;
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await axiosInstance.post("/auth/send-otp", { email: formData.email });
      if (response.data.success) {
        toast.success("OTP resent successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      const success = validateForm();
      if (success === true) {
        setIsLoading(true);
        try {
          const response = await axiosInstance.post("/auth/send-otp", { email: formData.email });
          if (response.data.success) {
            toast.success("OTP sent to your email");
            setStep(2);
          } else {
            toast.error("Failed to send OTP");
          }
        } catch (error) {
          toast.error("Failed to send OTP");
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      if (!otp.trim()) {
        toast.error("Please enter OTP");
        return;
      }
      setIsLoading(true);
      try {
        const response = await axiosInstance.post("/auth/verify-otp", {
          email: formData.email,
          otp: otp,
          fullName: formData.fullName,
          password: formData.password
        });
        if (response.data._id) {
          toast.success("Account created successfully!");
          window.location.href = "/";
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Invalid OTP");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen text-white flex" style={{backgroundColor: '#0B1220'}}>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* LEFT SIDE - Form */}
        <div className="flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-4">
          <Link 
            to="/" 
            className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors w-fit"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Link>

          <h2 className="text-xl sm:text-2xl lg:text-2xl font-semibold mb-3">{step === 1 ? "Create Account" : "Verify Email"}</h2>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">{step === 1 ? "Get started with your free account" : "Enter the OTP sent to your email"}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-white mb-2 font-medium text-sm">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors text-sm"
                      style={{backgroundColor: '#141C2F', border: '1px solid rgba(255,255,255,0.08)'}}
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium text-sm">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors text-sm"
                      style={{backgroundColor: '#141C2F', border: '1px solid rgba(255,255,255,0.08)'}}
                      placeholder="johndoe@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium text-sm">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors text-sm"
                      style={{backgroundColor: '#141C2F', border: '1px solid rgba(255,255,255,0.08)'}}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              </>
            ) : (
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
            )}

            <button 
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-base disabled:opacity-50 transition-all duration-200 shadow-lg"
              style={{background: 'linear-gradient(135deg, #E6651A 0%, #D84315 100%)'}}
              disabled={isLoading || isSigningUp}
            >
              {(isLoading || isSigningUp) ? (
                <>
                  <Loader2 className="size-4 animate-spin inline mr-2" />
                  Loading...
                </>
              ) : (
                step === 1 ? "Send OTP" : "Create Account"
              )}
            </button>
          </form>

          {step === 1 && (
            <p className="text-center mt-5 text-gray-300 text-sm">
              Already have an account?{" "}
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
export default SignUpPage;