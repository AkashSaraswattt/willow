import { useState, useEffect, useRef } from "react";
import { groupsAPI } from "../lib/groupsAPI";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import Avatar from "./Avatar";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck, X } from "lucide-react";

const GroupChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMember, setIsMember] = useState(true);
  const { selectedUser } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages();
      
      // Join group room
      if (socket) {
        socket.emit('group:join', { groupId: selectedUser._id, userId: authUser._id });
        
        // Listen for new group messages
        socket.on('group:newMessage', (newMessage) => {
          setMessages(prev => [...prev, newMessage]);
        });
        
        // Listen for read status updates
        socket.on('group:messages_read', ({ userId }) => {
          setMessages(prev => prev.map(msg => {
            if (msg.senderId._id === authUser._id && !msg.readBy?.some(r => r.userId === userId)) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), { userId, readAt: new Date() }]
              };
            }
            return msg;
          }));
        });
        
        // Mark messages as read when entering group
        socket.emit('group:mark_as_read', { groupId: selectedUser._id, userId: authUser._id });
        
        return () => {
          socket.off('group:newMessage');
          socket.off('group:messages_read');
          socket.emit('group:leave', { groupId: selectedUser._id });
        };
      }
    }
  }, [selectedUser?._id, socket, authUser._id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const groupMessages = await groupsAPI.getGroupMessages(selectedUser._id);
      setMessages(groupMessages);
      setIsMember(true);
    } catch (error) {
      console.error('Failed to fetch group messages:', error);
      if (error.response?.status === 403) {
        setIsMember(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        {!isMember && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center p-6 bg-base-200 rounded-lg max-w-md">
              <div className="text-error mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">No Longer a Member</h3>
              <p className="text-sm text-base-content/70">
                You are no longer part of this group
              </p>
            </div>
          </div>
        )}
        
        {isMember && messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs sm:text-sm opacity-60 px-4">
            No messages yet. Start the conversation!
          </div>
        )}
        
        {isMember && Array.isArray(messages) && messages.map((message) => {
          const isUserMessage = message.senderId._id === authUser._id;
          return (
          <div
            key={message._id}
            className={`chat ${isUserMessage ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <Avatar user={isUserMessage ? authUser : message.senderId} size="sm" />
            </div>
            <div className="chat-header mb-1">
              <span className="text-xs opacity-70 mr-1 sm:mr-2">
                {isUserMessage ? "You" : message.senderId.username}
              </span>
              <time className="text-xs opacity-50">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col max-w-xs sm:max-w-sm lg:max-w-md">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="max-w-full sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(message.image)}
                />
              )}
              {message.text && <p className="text-sm sm:text-base break-words">{message.text}</p>}
              
              {/* Message status for sender */}
              {isUserMessage && (
                <div className="flex justify-end mt-1">
                  {message.status === 'sent' && (
                    <Check className="w-4 h-4 opacity-50" />
                  )}
                  {message.status === 'delivered' && (
                    <CheckCheck className="w-4 h-4 opacity-50" />
                  )}
                  {message.readBy?.length > 0 && (
                    <CheckCheck className={`w-4 h-4 ${
                      theme === 'light' || theme === 'cupcake' || theme === 'bumblebee' || theme === 'emerald' || theme === 'corporate' || theme === 'retro' || theme === 'cyberpunk' || theme === 'valentine' || theme === 'garden' || theme === 'aqua' || theme === 'lofi' || theme === 'pastel' || theme === 'fantasy' || theme === 'wireframe' || theme === 'cmyk' || theme === 'autumn' || theme === 'acid' || theme === 'lemonade' || theme === 'winter'
                        ? 'text-green-500'
                        : 'text-blue-500'
                    }`} />
                  )}
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {isMember && <MessageInput />}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedImage(null)}>
          <button
            className="absolute top-4 right-4 btn btn-circle btn-sm"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default GroupChatContainer;