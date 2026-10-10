import { useState } from 'react';
import EmojiPickerInput from './EmojiPickerInput';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-base-100 border-t border-base-300">
      <EmojiPickerInput
        value={message}
        onChange={setMessage}
        placeholder="Type a message..."
        onSend={handleSend}
        className="text-sm"
      />
      
      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="btn btn-primary btn-sm"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;