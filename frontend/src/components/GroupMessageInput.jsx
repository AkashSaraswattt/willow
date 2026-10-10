import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const SAFE_EMOJIS = [
  '😊', '😄', '🙂', '😍', '😇',
  '❤️', '💙',
  '👍', '🙌', '👏',
  '🎉', '✨', '🌸',
  '😂', '😅', '🤗',
  '😎', '🤔', '🫡', '🤐'
];

const GroupMessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const { selectedUser } = useChatStore();
  const { socket, authUser } = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    const handleBlocked = (data) => {
      toast.error(data.reason || "This message was blocked due to inappropriate language. Kindly communicate respectfully.");
      setIsSending(false);
    };

    socket.on('group:message:blocked', handleBlocked);

    return () => {
      socket.off('group:message:blocked', handleBlocked);
    };
  }, [socket]);

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

    if (isEmojiPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (!socket || !selectedUser?._id) return;

    setIsSending(true);

    try {
      socket.emit('group:message:send', {
        groupId: selectedUser._id,
        senderId: authUser._id,
        text: text.trim(),
        image: imagePreview
      });
      
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      const messageHandler = () => {
        setIsSending(false);
        socket.off('group:newMessage', messageHandler);
      };
      
      socket.once('group:newMessage', messageHandler);
      
      setTimeout(() => {
        setIsSending(false);
        socket.off('group:newMessage', messageHandler);
      }, 10000);
    } catch (error) {
      console.error("Failed to send group message:", error);
      toast.error("Failed to send message");
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 w-full">
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
            className="btn btn-ghost btn-sm hover:bg-base-200 transition-colors p-2 flex items-center justify-center"
            aria-label="Open emoji picker"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-current fill-current text-base-content/60">
              <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none"/>
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
                    className="text-xl p-2 hover:bg-base-200 rounded transition-colors flex items-center justify-center min-h-[40px]"
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
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={(!text.trim() && !imagePreview) || isSending}
        >
          {isSending ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Send size={22} />
          )}
        </button>
      </form>
    </div>
  );
};

export default GroupMessageInput;