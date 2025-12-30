import React, { useEffect, useRef } from "react";

import "./ChatLayout.css";
import type { ChatMessage } from "../../types/ChatMessage";
import type { PrivateMessage } from "../../types/PrivateMessage";
import type { ConnectionNotification } from "../../types/ConnectionNotification";

interface MessageListProps {
  messages: (ChatMessage | PrivateMessage)[];
  currentUser: string;
  connectionNotifications?: ConnectionNotification[];
  typingUsers: Map<string, boolean>;
  isPrivateChat: boolean;
  selectedUser: string | null;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  connectionNotifications,
  typingUsers,
  isPrivateChat,
  selectedUser,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    <div className="chat-messages">
      {!isPrivateChat &&
        connectionNotifications &&
        connectionNotifications.map((notif, idx) => (
          <div
            key={idx}
            className={`connection-notification ${
              notif.isConnected ? "connected" : "disconnected"
            }`}
          >
            {notif.userName}{" "}
            {notif.isConnected ? "sohbete katıldı" : "sohbetten ayrıldı"}
          </div>
        ))}

      {messages.map((msg, idx) => {
        const senderName = (msg as any).user || (msg as any).fromUser;
        const isMyMessage = senderName === currentUser;

        return (
          <div
            key={idx}
            className={`message ${isMyMessage ? "my-message" : ""} ${
              isPrivateChat ? "private" : ""
            }`}
          >
            <span className={isMyMessage ? "message-container" : ""}>
              <strong
                className={
                  isPrivateChat && !isMyMessage ? "from-user" : "user-name-chat"
                }
              >
                {senderName}:
              </strong>
              <span className="message-content">{msg.message}</span>
            </span>
          </div>
        );
      })}

      {!isPrivateChat
        ? // for General Chat
          Array.from(typingUsers.entries()).map(([user, isTyping]) => {
            if (isTyping && user !== currentUser) {
              return (
                <div key={user} className="typing-indicator">
                  {user} yazıyor...
                </div>
              );
            }
            return null;
          })
        : // for Private Chat
          selectedUser &&
          typingUsers.get(selectedUser) && (
            <div className="typing-indicator">{selectedUser} yazıyor...</div>
          )}

      <div ref={messagesEndRef} />
    </div>
  );
};
