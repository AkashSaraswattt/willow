import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
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

          <h2 className="text-xl sm:text-2xl lg:text-2xl font-semibold mb-3">Welcome Back</h2>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white mb-2 font-medium text-sm">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors text-sm"
                  style={{backgroundColor: '#141C2F', border: '1px solid rgba(255,255,255,0.08)'}}
                  placeholder="you@example.com"
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
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors text-sm"
                  style={{backgroundColor: '#141C2F', border: '1px solid rgba(255,255,255,0.08)'}}
                  placeholder="••••••••"
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
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-base disabled:opacity-50 transition-all duration-200 shadow-lg"
              style={{background: 'linear-gradient(135deg, #E6651A 0%, #D84315 100%)'}}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-4 animate-spin inline mr-2" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center mt-5 text-gray-300 text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
              Create account
            </Link>
          </p>
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
export default LoginPage;
