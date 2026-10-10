import { useState, useRef, useEffect } from 'react';

const SAFE_EMOJIS = [
  '😊', '😄', '🙂', '😍', '😇',
  '❤️', '💙', '💚', '💛',
  '👍', '🙌', '👏',
  '🎉', '✨', '🌸',
  '😂', '😅', '🤗'
];

const EmojiPickerInput = ({ 
  value, 
  onChange, 
  placeholder = "Type a message...",
  className = "",
  onSend
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target) &&
        !emojiButtonRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsPickerOpen(false);
      }
    };

    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  const togglePicker = () => {
    setIsPickerOpen(!isPickerOpen);
  };

  const insertEmoji = (emoji) => {
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    const newValue = value.slice(0, start) + emoji + value.slice(end);
    onChange(newValue);
    
    // Restore cursor position after emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onSend && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Emoji Button */}
      <button
        ref={emojiButtonRef}
        type="button"
        onClick={togglePicker}
        className="text-xl p-2 rounded focus:outline-none"
        aria-label="Open emoji picker"
      >
        😊
      </button>

      {/* Message Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className={`input input-bordered flex-1 ${className}`}
      />

      {/* Emoji Picker Panel */}
      {isPickerOpen && (
        <div
          ref={pickerRef}
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
    </div>
  );
};

export default EmojiPickerInput;