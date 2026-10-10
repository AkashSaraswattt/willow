import { Shield, Zap, Users, MessageSquare, CheckCircle, Star, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useThemeStore } from "../store/useThemeStore";

const AlternateLandingPage = () => {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}
      <nav className="sticky top-0 bg-base-100 z-50 border-b border-base-300">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-base-content">Willow<span className="text-primary text-3xl">.</span></div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-base-content/70 hover:text-base-content">Features</a>
          <a href="#testimonials" className="text-base-content/70 hover:text-base-content">Testimonials</a>
          <a href="#about" className="text-base-content/70 hover:text-base-content">About</a>
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
              isDark ? 'bg-gray-700' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
              isDark ? 'translate-x-6' : 'translate-x-1'
            }`} />
            <Sun className={`absolute left-1 h-3 w-3 text-yellow-500 transition-opacity duration-300 ${
              isDark ? 'opacity-0' : 'opacity-100'
            }`} />
            <Moon className={`absolute right-1 h-3 w-3 text-gray-400 transition-opacity duration-300 ${
              isDark ? 'opacity-100' : 'opacity-0'
            }`} />
          </button>
          <Link to="/login" className="bg-primary text-primary-content px-6 py-2 rounded-full hover:bg-primary/90">
            Get Started
          </Link>
        </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-16 md:py-20 px-6 max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-base-content mb-6">
          <span className="block">Willow<span className="text-primary text-3xl md:text-4xl lg:text-5xl">.</span></span>
          <span className="block">Safe chat starts here<span className="text-primary text-3xl md:text-4xl lg:text-5xl">.</span></span>
        </h1>
        <p className="text-lg md:text-xl text-base-content/70 mb-8 max-w-3xl mx-auto">
          Real-time AI moderation that detects toxic content and suggests polite alternatives. 
          Keep your conversations safe and professional with intelligent content filtering.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/signup" className="bg-primary text-primary-content px-8 py-3 rounded-full hover:bg-primary/90 flex items-center justify-center min-w-[140px]">
            Try Now →
          </Link>
          <a href="https://willowapi-lj3e.onrender.com/" target="_blank" rel="noopener noreferrer" className="bg-primary text-primary-content px-8 py-3 rounded-full hover:bg-primary/90 min-w-[140px] text-center">
            Get API Key
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 bg-base-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-base-content mb-12">
            Powerful moderation features
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-base-content">Real-time Detection</h3>
              <p className="text-base-content/70">Instantly flags toxic, abusive, and inappropriate content as messages are sent</p>
            </div>
            <div className="text-center p-6">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-base-content">Smart Rephrasing</h3>
              <p className="text-base-content/70">AI suggests polite alternatives that preserve meaning while removing harmful tone</p>
            </div>
            <div className="text-center p-6 sm:col-span-2 lg:col-span-1">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-base-content">Low Latency</h3>
              <p className="text-base-content/70">Ultra-fast processing keeps chat flow smooth and uninterrupted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-base-content mb-4">
            Don't just take our word.
          </h2>
          <p className="text-center text-base-content/70 mb-12">
            Hear what our users say about us. We're always looking for ways to improve.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-300">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-base-content/80 mb-6 italic leading-relaxed">
                "Willow helped us reduce abusive messages drastically within the first week. The real-time AI suggestions keep conversations professional without hurting user experience."
              </p>
              <div className="flex items-center">
                <img src="/ananya.jpeg" alt="Ananya Sharma" className="w-12 h-12 rounded-full mr-4 object-cover" />
                <div>
                  <div className="font-semibold text-base-content">Ananya Sharma</div>
                  <div className="text-base-content/70 text-sm">Community Manager, EdTech Startup (India)</div>
                </div>
              </div>
            </div>
            <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-300">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-base-content/80 mb-6 italic leading-relaxed">
                "The real-time moderation is extremely fast and reliable. We handle thousands of messages daily, and Willow works seamlessly without any noticeable latency or performance drop."
              </p>
              <div className="flex items-center">
                <img src="/rahul.jpeg" alt="Rahul Verma" className="w-12 h-12 rounded-full mr-4 object-cover" />
                <div>
                  <div className="font-semibold text-base-content">Rahul Verma</div>
                  <div className="text-base-content/70 text-sm">Head of Platform Safety, FinTech Company</div>
                </div>
              </div>
            </div>
            <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-300 sm:col-span-2 lg:col-span-1">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-base-content/80 mb-6 italic leading-relaxed">
                "What I love most about Willow is how it improves tone instead of just blocking messages. It helps users communicate better while keeping conversations natural."
              </p>
              <div className="flex items-center">
                <img src="/martha.jpg" alt="Martha Neilsen" className="w-12 h-12 rounded-full mr-4 object-cover" />
                <div>
                  <div className="font-semibold text-base-content">Martha Neilsen</div>
                  <div className="text-base-content/70 text-sm">Product Manager, SaaS Collaboration Platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer id="about" />
    </div>
  );
};

export default AlternateLandingPage;