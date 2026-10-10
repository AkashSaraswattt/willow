import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, X } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import Avatar from "./Avatar";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useThemeStore } from "../store/useThemeStore";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    getGroupMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    activeAi,
    blockStatus,
    deleteMessage,
    deleteGroupMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const messageEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    if (message.deletedForEveryone || hoveredMessage !== message._id) return;
    const isUserMessage = message.senderId === authUser._id || message.senderId._id === authUser._id;
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message,
      isUserMessage
    });
  };

  const handleDelete = async (deleteType) => {
    if (!contextMenu) return;
    
    try {
      if (selectedUser?.memberCount) {
        await deleteGroupMessage(selectedUser._id, contextMenu.message._id, deleteType);
      } else {
        await deleteMessage(contextMenu.message._id, deleteType);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
    
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const handleSearch = (e) => setSearchQuery(e.detail);
    window.addEventListener('searchMessages', handleSearch);
    return () => window.removeEventListener('searchMessages', handleSearch);
  }, []);

  useEffect(() => {
    if (selectedUser?.type !== 'ai') {
      if (selectedUser?.memberCount) {
        getGroupMessages(selectedUser._id);
      } else {
        getMessages(selectedUser._id);
      }
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser._id, getMessages, getGroupMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && activeAi && (
          <div className="flex h-full items-center justify-center text-sm opacity-60">
            Start a conversation with the AI assistant
          </div>
        )}
        
        {messages.length === 0 && !activeAi && !blockStatus?.canCommunicate && selectedUser?.type !== 'ai' && !selectedUser?.memberCount && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center p-6 bg-base-200 rounded-lg max-w-md">
              <div className="text-error mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Communication Blocked</h3>
              <p className="text-sm text-base-content/70">
                {blockStatus?.iBlockedThem && blockStatus?.theyBlockedMe
                  ? "Both users have blocked each other"
                  : blockStatus?.iBlockedThem
                  ? "You have blocked this user"
                  : "This user has blocked you"}
              </p>
            </div>
          </div>
        )}
        
        {messages.length === 0 && !activeAi && (blockStatus?.canCommunicate || !blockStatus) && (
          <div className="flex h-full items-center justify-center text-xs sm:text-sm opacity-60 px-4">
            No messages yet. Start the conversation!
          </div>
        )}
        
        {Array.isArray(messages) && messages.map((message) => {
          const isUserMessage = message.senderId === authUser._id || message.senderId._id === authUser._id;
          if (message.deletedFor?.includes(authUser._id)) return null;
          
          if (searchQuery && message.text && !message.text.toLowerCase().startsWith(searchQuery.toLowerCase())) {
            return null;
          }
          
          return (
          <div
            key={message._id}
            className={`chat ${isUserMessage ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
            onContextMenu={(e) => handleContextMenu(e, message)}
          >
            <div className="chat-image avatar">
              {isUserMessage ? (
                <Avatar user={authUser} size="sm" isInChat={true} />
              ) : selectedUser?.type === 'ai' ? (
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center" style={{ width: '40px', height: '40px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M12 8V4H8"></path>
                    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                    <path d="M2 14h2"></path>
                    <path d="M20 14h2"></path>
                    <path d="M15 13v2"></path>
                    <path d="M9 13v2"></path>
                  </svg>
                </div>
              ) : (
                <Avatar user={selectedUser?.memberCount ? message.senderId : selectedUser} size="sm" isInChat={true} />
              )}
            </div>
            <div className="chat-header mb-1">
              {selectedUser?.memberCount && !isUserMessage && (
                <span className="text-xs opacity-70 mr-1 sm:mr-2">
                  {message.senderId.username || message.senderId.fullName}
                </span>
              )}
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div 
              className="chat-bubble flex flex-col cursor-pointer"
              onMouseEnter={() => setHoveredMessage(message._id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              {message.deletedForEveryone ? (
                <p className="italic opacity-60">This message was deleted</p>
              ) : (
                <>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(message.image)}
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </>
              )}
              
              {isUserMessage && !message.deletedForEveryone && (
                <div className="flex justify-end mt-1">
                  {selectedUser?.memberCount ? (
                    <CheckCheck className="w-4 h-4 opacity-50" />
                  ) : message.status === 'read' ? (
                    <CheckCheck className={`w-4 h-4 ${
                      theme === 'light' || theme === 'cupcake' || theme === 'bumblebee' || theme === 'emerald' || theme === 'corporate' || theme === 'retro' || theme === 'cyberpunk' || theme === 'valentine' || theme === 'garden' || theme === 'aqua' || theme === 'lofi' || theme === 'pastel' || theme === 'fantasy' || theme === 'wireframe' || theme === 'cmyk' || theme === 'autumn' || theme === 'acid' || theme === 'lemonade' || theme === 'winter'
                        ? 'text-green-500'
                        : 'text-blue-500'
                    }`} />
                  ) : message.status === 'delivered' ? (
                    <CheckCheck className="w-4 h-4 opacity-50" />
                  ) : (
                    <Check className="w-4 h-4 opacity-50" />
                  )}
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      <MessageInput />

      {contextMenu && (
        <div
          className="fixed bg-base-100 shadow-lg rounded-lg py-2 z-50 border border-base-300"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="w-full px-4 py-2 text-left hover:bg-base-200 text-xs"
            onClick={() => handleDelete('me')}
          >
            Delete for me
          </button>
          {contextMenu.isUserMessage && (
            <button
              className="w-full px-4 py-2 text-left hover:bg-base-200 text-xs text-error"
              onClick={() => handleDelete('everyone')}
            >
              Delete for everyone
            </button>
          )}
        </div>
      )}

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
export default ChatContainer;
