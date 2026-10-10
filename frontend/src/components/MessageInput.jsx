import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const SAFE_EMOJIS = [
  '😊', '😄', '🙂', '😍', '😇',
  '❤️', '💙',
  '👍', '🙌', '👏',
  '🎉', '✨', '🌸',
  '😂', '😅', '🤗',
  '😎', '🤔', '🫡', '🤐'
];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const { sendMessage, sendAiMessage, sendGroupMessage, selectedUser, activeAi, isSendingMessage, isSendingGroupMessage, getSuggestion, blockStatus } = useChatStore();
  const { socket, authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  const isGroupsPage = location.pathname === '/groups';

  useEffect(() => {
    const handleGroupLeft = () => setHasLeftGroup(true);
    window.addEventListener('groupLeft', handleGroupLeft);
    return () => window.removeEventListener('groupLeft', handleGroupLeft);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle outside clicks for emoji picker and suggestion dismissal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target) &&
        !emojiButtonRef.current.contains(event.target) &&
        !textInputRef.current.contains(event.target)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSuggestion(null);
        setIsEmojiPickerOpen(false);
      }
    };

    if (isEmojiPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEmojiPickerOpen]);

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  const insertEmoji = (emoji) => {
    const input = textInputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    const newValue = text.slice(0, start) + emoji + text.slice(end);
    setText(newValue);
    
    // Restore cursor position after emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    // Check if communication is blocked
    if (selectedUser?.type !== 'ai' && !selectedUser?.memberCount && blockStatus && !blockStatus.canCommunicate) {
      toast.error("Cannot send message. Communication is blocked.");
      return;
    }

    const messageText = text.trim();
    const messageImage = imagePreview;
    
    // Clear form immediately
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    // Check for suggestion first (for both regular and group messages, but not AI)
    if (selectedUser?.type !== 'ai' && messageText && !suggestion) {
      setIsGettingSuggestion(true);
      const suggestionResult = await getSuggestion(messageText);
      console.log('Got suggestion result:', suggestionResult);
      setIsGettingSuggestion(false);
      
      if (suggestionResult?.blocked) {
        toast.error("This message was blocked due to inappropriate language. Please communicate respectfully.");
        return;
      }
      
      if (suggestionResult?.needsModeration) {
        console.log('Setting suggestion:', suggestionResult);
        setSuggestion(suggestionResult);
        return; // Don't send yet, show suggestion
      }
    }
    
    setSuggestion(null);

    try {
      // Check if in groups page - send group message
      if (isGroupsPage && selectedUser?._id && socket) {
        await sendGroupMessage({
          groupId: selectedUser._id,
          senderId: authUser._id,
          text: messageText,
          image: messageImage
        });
      }
      // Check if sending to AI
      else if (selectedUser?.type === 'ai' && activeAi) {
        await sendAiMessage(messageText);
      } 
      // Regular user message
      else {
        await sendMessage({
          text: messageText,
          image: messageImage,
          bypassModeration: suggestion?.needsModeration // Bypass if using suggestion
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSuggestionClick = () => {
    if (!suggestion) return;
    
    // Use suggested text and send immediately
    const messageText = suggestion.suggested;
    const messageImage = imagePreview;
    
    // Clear form
    setText("");
    setImagePreview(null);
    setSuggestion(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    // Send with bypass flag - handle both regular and group messages
    if (isGroupsPage && selectedUser?._id) {
      sendGroupMessage({
        groupId: selectedUser._id,
        text: messageText,
        image: messageImage,
        bypassModeration: true
      });
    } else {
      sendMessage({
        text: messageText,
        image: messageImage,
        bypassModeration: true
      });
    }
  };

  return (
    <div className="p-4 w-full">
      {hasLeftGroup && selectedUser?.memberCount ? (
        <div className="text-center py-3 text-base-content/70">
          You are no longer part of this group
        </div>
      ) : (
        <>
      {suggestion && (
        <div className={`mb-3 p-3 rounded-lg ${
          theme === 'dark' || theme === 'dracula' || theme === 'night' || theme === 'forest' || theme === 'black' || theme === 'luxury' || theme === 'business' || theme === 'synthwave' || theme === 'halloween' || theme === 'coffee' || theme === 'dim' || theme === 'sunset'
            ? 'bg-base-200 border border-base-300'
            : 'bg-info/10 border border-info/20'
        }`}>
          <div className={`text-sm mb-2 ${
            theme === 'dark' || theme === 'dracula' || theme === 'night' || theme === 'forest' || theme === 'black' || theme === 'luxury' || theme === 'business' || theme === 'synthwave' || theme === 'halloween' || theme === 'coffee' || theme === 'dim' || theme === 'sunset'
              ? 'text-base-content/70'
              : 'text-info'
          }`}>Suggested polite version:</div>
          <div 
            className={`p-2 border rounded cursor-pointer transition-colors text-sm text-base-content ${
              theme === 'dark' || theme === 'dracula' || theme === 'night' || theme === 'forest' || theme === 'black' || theme === 'luxury' || theme === 'business' || theme === 'synthwave' || theme === 'halloween' || theme === 'coffee' || theme === 'dim' || theme === 'sunset'
                ? 'bg-base-200 border-base-content/5 hover:bg-base-300'
                : 'bg-info/5 border-blue-400 hover:bg-info/15'
            }`}
            onClick={handleSuggestionClick}
          >
            "{suggestion.suggested}"
          </div>
          <div className="text-xs text-base-content/50 mt-1">Click to send this version</div>
        </div>
      )}

      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 relative">
          {/* Emoji Button */}
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={toggleEmojiPicker}
            className="p-2 flex items-center justify-center focus:outline-none"
            aria-label="Open emoji picker"
            disabled={selectedUser?.type !== 'ai' && !selectedUser?.memberCount && blockStatus && !blockStatus.canCommunicate}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-current fill-current text-base-content/60">
              <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none" stroke="currentColor"/>
              <circle cx="8" cy="9" r="1.5"/>
              <circle cx="16" cy="9" r="1.5"/>
              <path d="M8 15s1.5 2 4 2 4-2 4-2" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Emoji Picker Panel */}
          {isEmojiPickerOpen && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full left-0 mb-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 z-50 w-64"
            >
              <div className="grid grid-cols-5 gap-1">
                {SAFE_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="text-xl p-2 rounded flex items-center justify-center min-h-[40px] focus:outline-none"
                    aria-label={`Insert ${emoji} emoji`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <input
            ref={textInputRef}
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder={
              selectedUser?.type === 'ai' 
                ? `Message ${selectedUser.name}...` 
                : blockStatus && !blockStatus.canCommunicate
                  ? "Communication blocked"
                  : "Type a message..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={selectedUser?.type !== 'ai' && !selectedUser?.memberCount && blockStatus && !blockStatus.canCommunicate}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-base-content/70"}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={selectedUser?.type !== 'ai' && !selectedUser?.memberCount && blockStatus && !blockStatus.canCommunicate}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={(!text.trim() && !imagePreview) || (isGroupsPage ? isSendingGroupMessage : isSendingMessage) || isGettingSuggestion || (selectedUser?.type !== 'ai' && !selectedUser?.memberCount && blockStatus && !blockStatus.canCommunicate)}
        >
          {(isGroupsPage ? isSendingGroupMessage : isSendingMessage) || isGettingSuggestion ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Send size={22} />
          )}
        </button>
      </form>
      </>
      )}
    </div>
  );
};
export default MessageInput;
