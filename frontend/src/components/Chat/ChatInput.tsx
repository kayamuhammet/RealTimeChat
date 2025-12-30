import React, { useState } from "react";
import "./ChatLayout.css";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
}) => {
  const [messageInput, setMessageInput] = useState("");

  const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    if (val.trim()) {
      onTyping(true);
    } else {
      onTyping(false);
    }
  };

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      onTyping(false);
      setMessageInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-input">
      <input
        value={messageInput}
        onChange={handleMessageInput}
        onKeyDown={handleKeyDown}
        placeholder="Mesajınızı yazın..."
      />
      <button onClick={handleSend} disabled={!messageInput}>
        Gönder
      </button>
    </div>
  );
};
