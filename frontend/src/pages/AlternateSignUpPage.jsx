import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const AlternateSignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: otp
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="h-screen w-full flex overflow-x-hidden">
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex items-center justify-center bg-green-950 text-white relative overflow-hidden w-1/2 fixed left-0 top-0 h-screen">
        <div className="text-center z-10 px-8">
          <h1 className="text-8xl text-white" style={{fontFamily: 'DM Sans', fontWeight: 'bold'}}>
            Willow.
          </h1>
        </div>
      </div>

      {/* Right Side - Auth Form Panel */}
      <div className="flex items-center justify-center bg-base-100 p-4 sm:p-6 xl:p-12 w-full lg:w-1/2 lg:ml-auto overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Logo for mobile */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Willow</h1>
            </div>
          </div>

          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold mb-2">{step === 1 ? "Create Account" : "Verify Email"}</h2>
            <p className="text-base-content/60">{step === 1 ? "Get started with your free account" : "Enter the OTP sent to your email"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10 rounded-full"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type="email"
                      className="input input-bordered w-full pl-10 rounded-full"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Password</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input input-bordered w-full pl-10 rounded-full"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5 text-base-content/40" />
                      ) : (
                        <Eye className="size-5 text-base-content/40" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Enter OTP</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-center text-2xl tracking-widest rounded-full"
                  placeholder="000000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <div className="label">
                  <span className="label-text-alt text-center w-full">Check your email for the 6-digit code</span>
                </div>
                <div className="text-center mt-2">
                  <button 
                    type="button" 
                    className="link link-primary text-sm"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const response = await axiosInstance.post("/auth/send-otp", { email: formData.email });
                        if (response.data.success) {
                          toast.success("OTP resent to your email");
                        } else {
                          toast.error("Failed to resend OTP");
                        }
                      } catch (error) {
                        toast.error("Failed to resend OTP");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </div>

              </div>
            )}

            <button type="submit" className="btn bg-green-800 hover:bg-green-900 text-white w-full rounded-full border-none" disabled={isSigningUp || isLoading}>
              {(isSigningUp || isLoading) ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                step === 1 ? "Send OTP" : "Create Account"
              )}
            </button>


          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link text-green-800 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AlternateSignUpPage;