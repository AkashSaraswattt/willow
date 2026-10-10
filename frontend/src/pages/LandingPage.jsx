import { Shield, Zap, Users, MessageSquare, CheckCircle, Star, ArrowRight, Sparkles, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useThemeStore } from "../store/useThemeStore";

const LandingPage = () => {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-red-50'} relative overflow-hidden`}>
      {/* Background Effects */}
      {isDark && <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5"></div>}
      {/* Navigation */}
      <nav className={`sticky top-0 ${isDark ? 'bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-xl border-b border-orange-500/20' : 'bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-800/95 backdrop-blur-xl border-b border-orange-500/20'} z-50 shadow-2xl`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className={`${isDark ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-orange-600 to-red-600'} p-2 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300`}>
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white hover:text-orange-300' : 'text-white hover:text-orange-300'} transition-colors cursor-pointer`}>Willow</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#features" className={`${isDark ? 'text-gray-300 hover:text-orange-400' : 'text-gray-300 hover:text-orange-400'} transition-all duration-300 relative group`}>
              Features
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isDark ? 'bg-orange-400' : 'bg-orange-400'} transition-all duration-300 group-hover:w-full`}></span>
            </a>
            <a href="#testimonials" className={`${isDark ? 'text-gray-300 hover:text-orange-400' : 'text-gray-300 hover:text-orange-400'} transition-all duration-300 relative group`}>
              Testimonials
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isDark ? 'bg-orange-400' : 'bg-orange-400'} transition-all duration-300 group-hover:w-full`}></span>
            </a>
            <a href="#about" className={`${isDark ? 'text-gray-300 hover:text-orange-400' : 'text-gray-300 hover:text-orange-400'} transition-all duration-300 relative group`}>
              About
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isDark ? 'bg-orange-400' : 'bg-orange-400'} transition-all duration-300 group-hover:w-full`}></span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
              <Sun className={`absolute left-1 h-3 w-3 text-yellow-500 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100'}`} />
              <Moon className={`absolute right-1 h-3 w-3 text-gray-400 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`} />
            </button>
            <Link to="/login" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:from-orange-600 hover:to-red-600 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 font-medium text-sm sm:text-base transform hover:scale-105">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 md:-mt-8 pb-2 sm:pb-4 md:pb-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-left order-2 lg:order-1">
              <div className={`inline-flex items-center space-x-2 ${isDark ? 'bg-gradient-to-r from-orange-900/40 to-red-900/40 backdrop-blur-sm text-orange-300 border border-orange-500/30' : 'bg-orange-100 text-orange-800'} px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 hover:border-orange-400/50 transition-all duration-300`}>
                <Sparkles className={`w-3 sm:w-4 h-3 sm:h-4 ${isDark ? 'animate-pulse' : ''}`} />
                <span>Built for Safe Communication</span>
              </div>
              
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6 leading-tight`}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">AI Chat Platform</span>
                <br />
                <span className={`${isDark ? 'text-gray-100 hover:text-white' : 'text-gray-900'} transition-colors duration-500`}>for Safe Chats</span>
              </h1>
              
              <p className={`text-base sm:text-lg md:text-xl ${isDark ? 'text-gray-300 hover:text-gray-200' : 'text-gray-600'} mb-6 sm:mb-8 max-w-xl leading-relaxed transition-colors duration-300`}>
                Real-time AI moderation that transforms toxic messages into professional communication. 
                Keep conversations safe with intelligent content filtering.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/signup" className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:from-orange-700 hover:to-red-700 hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 flex items-center justify-center font-semibold text-sm sm:text-base transform hover:scale-105">
                  Start Chatting
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <a href="https://willowapi-lj3e.onrender.com/" target="_blank" rel="noopener noreferrer" className={`group border-2 ${isDark ? 'border-gray-600 text-gray-200 hover:border-orange-500/50 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10 backdrop-blur-sm' : 'border-orange-500 text-orange-600 hover:border-orange-600 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/25'} px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 text-center font-semibold text-sm sm:text-base transform hover:scale-105`}>
                  Get API Key
                </a>
              </div>
            </div>

            {/* Floating UI Elements */}
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-[600px] order-1 lg:order-2">
              {/* Chat Bubbles */}
              <div className={`absolute top-12 left-2 sm:top-16 sm:left-4 lg:top-20 lg:left-4 ${isDark ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' : 'bg-white shadow-xl border'} rounded-xl lg:rounded-2xl p-3 lg:p-4 max-w-[200px] sm:max-w-xs transform rotate-3 hover:rotate-1 transition-all duration-500 ${isDark ? 'hover:shadow-blue-500/20' : 'hover:shadow-lg'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full ${isDark ? 'animate-pulse' : ''}`}></div>
                  <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} text-sm sm:text-base`}>Alex</span>
                </div>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-sm`}>Hey team, great work! 🎉</p>
              </div>

              <div className="absolute top-40 right-1 sm:top-48 sm:right-2 lg:top-64 lg:right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl lg:rounded-2xl shadow-2xl shadow-orange-500/25 p-3 lg:p-4 max-w-[180px] sm:max-w-xs transform -rotate-2 hover:rotate-0 transition-all duration-500 hover:shadow-orange-500/40">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className={`w-4 sm:w-5 h-4 sm:h-5 ${isDark ? 'animate-pulse' : ''}`} />
                  <span className="font-medium text-xs sm:text-sm">AI Moderation</span>
                </div>
                <p className="text-xs sm:text-sm opacity-90">Message approved ✓</p>
              </div>

              {/* Toxicity Detection Card */}
              <div className={`absolute top-28 right-28 sm:top-36 sm:right-36 lg:top-44 lg:right-44 ${isDark ? 'bg-gray-800/90 backdrop-blur-sm border border-red-500/30' : 'bg-white shadow-xl border'} rounded-xl lg:rounded-2xl p-3 lg:p-4 transform -rotate-1 hover:rotate-1 transition-all duration-500`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-2 sm:w-3 h-2 sm:h-3 bg-red-400 rounded-full ${isDark ? 'animate-pulse' : 'animate-pulse'}`}></div>
                  <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Toxicity Detected</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Suggesting better phrasing...</p>
              </div>

              {/* Stats Card */}
              <div className={`absolute bottom-16 left-1 sm:bottom-20 sm:left-2 lg:bottom-32 lg:left-4 ${isDark ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' : 'bg-white shadow-xl border'} rounded-xl lg:rounded-2xl p-4 lg:p-6 transform rotate-1 hover:-rotate-1 transition-all duration-500 ${isDark ? 'hover:shadow-orange-500/20' : 'hover:shadow-lg'}`}>
                <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2 lg:mb-4 text-sm sm:text-base`}>Safe Messages</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Today</span>
                    <span className={`font-bold text-orange-600 text-sm sm:text-base ${isDark ? 'animate-pulse' : ''}`}>1,247</span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1.5 sm:h-2 overflow-hidden`}>
                    <div className={`bg-gradient-to-r from-orange-500 to-red-500 h-1.5 sm:h-2 rounded-full w-4/5 ${isDark ? 'animate-pulse' : ''}`}></div>
                  </div>
                </div>
              </div>

              {/* Friend Request Card */}
              <div className={`absolute bottom-4 right-1 sm:bottom-8 sm:right-2 lg:bottom-16 lg:right-4 ${isDark ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' : 'bg-white shadow-xl border'} rounded-xl lg:rounded-2xl p-3 lg:p-4 transform rotate-2 hover:rotate-0 transition-all duration-500 ${isDark ? 'hover:shadow-blue-500/20' : 'hover:shadow-lg'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className={`w-4 sm:w-5 h-4 sm:h-5 text-blue-500 ${isDark ? 'animate-pulse' : ''}`} />
                  <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} text-xs sm:text-sm`}>Friend Request</span>
                </div>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Sarah wants to connect</p>
                <div className="flex space-x-1 sm:space-x-2">
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">Accept</button>
                  <button className={`${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} px-2 sm:px-3 py-1 rounded-full text-xs transition-all duration-300 transform hover:scale-105`}>Decline</button>
                </div>
              </div>

              {/* Smart Filter Card */}
              <div className={`absolute top-28 left-6 sm:top-36 sm:left-8 lg:top-56 lg:left-12 ${isDark ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-sm border border-orange-500/40' : 'bg-gradient-to-br from-yellow-100 to-orange-100 border'} rounded-xl lg:rounded-2xl shadow-2xl p-3 lg:p-4 transform rotate-1 hover:-rotate-1 transition-all duration-500`}>
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className={`w-4 sm:w-5 h-4 sm:h-5 text-orange-600 ${isDark ? 'animate-pulse' : ''}`} />
                  <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} text-xs sm:text-sm`}>Smart Filter</span>
                </div>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>99.2% accuracy</p>
                <div className={`w-full ${isDark ? 'bg-orange-900/50' : 'bg-orange-200'} rounded-full h-1 mt-2 overflow-hidden`}>
                  <div className={`${isDark ? 'bg-gradient-to-r from-orange-400 to-yellow-400' : 'bg-orange-500'} h-1 rounded-full w-full ${isDark ? 'animate-pulse' : ''}`}></div>
                </div>
              </div>

              {/* Performance Metric */}
              <div className={`absolute top-8 right-8 sm:top-12 sm:right-12 lg:top-16 lg:right-16 ${isDark ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' : 'bg-white shadow-xl border'} rounded-xl lg:rounded-2xl p-3 lg:p-4 transform rotate-3 hover:rotate-1 transition-all duration-500 ${isDark ? 'hover:shadow-orange-500/20' : 'hover:shadow-lg'}`}>
                <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'} text-xs sm:text-sm mb-1 sm:mb-2`}>Response Time</h4>
                <div className={`text-lg sm:text-2xl font-bold text-orange-600 ${isDark ? 'animate-pulse' : ''}`}>0.3s</div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Average detection</p>
              </div>

              {/* Feature Icons - Spread Out */}
              <div className={`absolute top-8 right-2 sm:top-12 sm:right-2 lg:top-16 lg:right-2 ${isDark ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' : 'bg-white shadow-lg border'} rounded-full p-2 sm:p-3 lg:p-4 transition-all duration-500 hover:scale-110`}>
                <Zap className={`w-4 sm:w-6 lg:w-8 h-4 sm:h-6 lg:h-8 text-yellow-500 ${isDark ? 'animate-pulse' : ''}`} />
              </div>
              
              <div className={`absolute bottom-1 right-24 sm:bottom-2 sm:right-32 lg:bottom-4 lg:right-40 ${isDark ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' : 'bg-white shadow-lg border'} rounded-full p-2 sm:p-3 lg:p-4 transition-all duration-500 hover:scale-110`}>
                <Users className={`w-4 sm:w-6 lg:w-8 h-4 sm:h-6 lg:h-8 text-blue-500 ${isDark ? 'animate-pulse' : ''}`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-6 sm:py-8 md:py-12 ${isDark ? 'bg-gradient-to-br from-slate-900/40 via-gray-800/30 to-slate-800/40 backdrop-blur-sm' : 'bg-white'} relative`}>
        {isDark && <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-transparent to-purple-900/5"></div>}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isDark ? 'text-white hover:text-orange-300' : 'text-gray-900'} mb-4 sm:mb-6 transition-colors duration-500`}>
              Powerful AI Moderation
            </h2>
            <p className={`text-lg sm:text-xl ${isDark ? 'text-gray-300 hover:text-gray-200' : 'text-gray-600'} max-w-3xl mx-auto transition-colors duration-300`}>
              Transform toxic communication into professional dialogue with our advanced AI system
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className={`group p-6 sm:p-8 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-500/40' : 'bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-xl'} transition-all duration-500 transform hover:scale-105`}>
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-orange-500/25">
                <Shield className={`w-6 sm:w-8 h-6 sm:h-8 text-white ${isDark ? 'group-hover:animate-pulse' : ''}`} />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-white group-hover:text-orange-300' : 'text-gray-900'} transition-colors duration-300`}>Real-time Detection</h3>
              <p className={`leading-relaxed text-sm sm:text-base ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600'} transition-colors duration-300`}>Instantly identifies and flags toxic content as messages are sent, maintaining conversation flow</p>
            </div>

            <div className={`group p-6 sm:p-8 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-500/40' : 'bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl'} transition-all duration-500 transform hover:scale-105`}>
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-amber-500/25">
                <MessageSquare className={`w-6 sm:w-8 h-6 sm:h-8 text-white ${isDark ? 'group-hover:animate-pulse' : ''}`} />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-white group-hover:text-amber-300' : 'text-gray-900'} transition-colors duration-300`}>Smart Rephrasing</h3>
              <p className={`leading-relaxed text-sm sm:text-base ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600'} transition-colors duration-300`}>AI suggests professional alternatives that preserve meaning while removing harmful tone</p>
            </div>

            <div className={`group p-6 sm:p-8 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:shadow-2xl hover:shadow-yellow-500/20 hover:border-yellow-500/40' : 'bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-xl'} transition-all duration-500 transform hover:scale-105 sm:col-span-2 lg:col-span-1`}>
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-yellow-500/25">
                <Zap className={`w-6 sm:w-8 h-6 sm:h-8 text-white ${isDark ? 'group-hover:animate-pulse' : ''}`} />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-white group-hover:text-yellow-300' : 'text-gray-900'} transition-colors duration-300`}>Lightning Fast</h3>
              <p className={`leading-relaxed text-sm sm:text-base ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600'} transition-colors duration-300`}>Ultra-fast processing ensures smooth chat experience without noticeable delays</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-6 sm:py-8 md:py-12 ${isDark ? 'bg-gradient-to-br from-slate-900/30 via-gray-800/20 to-slate-800/30' : 'bg-gradient-to-br from-stone-50 to-orange-50'} relative`}>
        {isDark && <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/5 via-transparent to-slate-900/5"></div>}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
              Trusted by Teams Worldwide
            </h2>
            <p className={`text-lg sm:text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              See how Willow transforms workplace communication
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className={`${isDark ? 'bg-gray-800 border border-gray-700 hover:shadow-orange-500/10 hover:border-orange-500/30' : 'bg-white shadow-lg hover:shadow-xl'} p-6 sm:p-8 rounded-2xl transition-all duration-300`}>
              <div className="flex mb-4 sm:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 sm:mb-6 leading-relaxed italic text-sm sm:text-base`}>
                "Willow reduced toxic messages by 90% in our first month. The AI suggestions help users communicate better naturally."
              </p>
              <div className="flex items-center">
                <img src="/ananya.jpeg" alt="Ananya Joshi" className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full mr-3 sm:mr-4 object-cover ${isDark ? 'border-2 border-gray-600' : ''}`} />
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>Ananya Joshi</div>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm`}>Community Manager</div>
                </div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-gray-800 border border-gray-700 hover:shadow-orange-500/10 hover:border-orange-500/30' : 'bg-white shadow-lg hover:shadow-xl'} p-6 sm:p-8 rounded-2xl transition-all duration-300`}>
              <div className="flex mb-4 sm:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 sm:mb-6 leading-relaxed italic text-sm sm:text-base`}>
                "Handles thousands of daily messages seamlessly. Zero latency issues and incredible accuracy in detection."
              </p>
              <div className="flex items-center">
                <img src="/rahul.jpeg" alt="Rahul Verma" className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full mr-3 sm:mr-4 object-cover ${isDark ? 'border-2 border-gray-600' : ''}`} />
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>Rahul Verma</div>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm`}>Platform Safety Head</div>
                </div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-gray-800 border border-gray-700 hover:shadow-orange-500/10 hover:border-orange-500/30' : 'bg-white shadow-lg hover:shadow-xl'} p-6 sm:p-8 rounded-2xl transition-all duration-300 sm:col-span-2 lg:col-span-1`}>
              <div className="flex mb-4 sm:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 sm:mb-6 leading-relaxed italic text-sm sm:text-base`}>
                "Love how it improves tone instead of just blocking. Keeps conversations natural while maintaining professionalism."
              </p>
              <div className="flex items-center">
                <img src="/martha.jpg" alt="Martha Neilsen" className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full mr-3 sm:mr-4 object-cover ${isDark ? 'border-2 border-gray-600' : ''}`} />
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>Martha Neilsen</div>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm`}>Product Manager</div>
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

export default LandingPage;