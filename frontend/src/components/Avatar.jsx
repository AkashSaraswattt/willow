import UserAvatar from "./UserAvatar";
import { Bot } from "lucide-react";

const Avatar = ({ user, size = "md", className = "", isInChat = false }) => {
  const sizeMap = { sm: 40, md: 48, lg: 56 };
  const pixelSize = sizeMap[size];

  // AI users
  if (user.type === 'ai') {
    console.log('AI Avatar - isInChat:', isInChat, 'user.id:', user.id);
    // WillowAI with different icons for sidebar vs chat
    if (user.id === 'grok') {
      return (
        <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${className}`} 
             style={{ width: pixelSize, height: pixelSize }}>
          {isInChat ? (
            // Custom AI icon for chat messages
            <svg 
              width={pixelSize * 0.6} 
              height={pixelSize * 0.6} 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-white"
            >
              <rect width="16" height="12" x="4" y="6" rx="2" fill="currentColor"/>
              <circle cx="8" cy="10" r="1" fill="#3b82f6"/>
              <circle cx="16" cy="10" r="1" fill="#3b82f6"/>
              <path d="M9 14h6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 20v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            // Smaller Bot icon for sidebar
            <Bot 
              size={pixelSize * 0.5} 
              className="text-white"
            />
          )}
        </div>
      );
    }
    
    // Fallback for other AI users
    return (
      <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${className}`} 
           style={{ width: pixelSize, height: pixelSize }}>
        <Bot 
          size={pixelSize * 0.5} 
          className="text-white"
        />
      </div>
    );
  }

  // Regular users with profile pic
  if (user.profilePic) {
    return (
      <img
        src={user.profilePic}
        alt={user.name || user.fullName}
        className={`object-cover rounded-full ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
      />
    );
  }

  // Fallback: SVG avatar with initials
  return (
    <UserAvatar 
      name={user.name || user.fullName || "Unknown"} 
      size={pixelSize} 
      className={className} 
    />
  );
};

export default Avatar;