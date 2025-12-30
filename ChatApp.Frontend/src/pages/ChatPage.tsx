import React, { useState } from "react";
import { UserList } from "../components/Chat/UserList";
import { MessageList } from "../components/Chat/MessageList";
import { ChatInput } from "../components/Chat/ChatInput";
import { NotificationList } from "../components/Common/NotificationList";
import "../components/Chat/ChatLayout.css";
import { useSignalR } from "../hooks/useSignalR";

export const ChatPage: React.FC = () => {
  const {
    startConnection,
    currentUsername,
    users,
    messages,
    privateMessages,
    notifications,
    connectionNotifications,
    typingUsers,
    sendMessage,
    sendPrivateMessage,
    sendTypingStatus,
  } = useSignalR();

  const [usernameInput, setUsernameInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isPrivateChat, setIsPrivateChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleConnect = () => {
    if (usernameInput.trim()) {
      startConnection(usernameInput);
      setIsConnected(true);
    }
  };

  const startPrivateChat = (userName: string) => {
    setSelectedUser(userName);
    setIsPrivateChat(true);
  };

  const switchToPublicChat = () => {
    setIsPrivateChat(false);
    setSelectedUser(null);
  };

  const switchToPrivateChat = () => {
    if (selectedUser) {
      setIsPrivateChat(true);
    }
  };

  const getCurrentMessages = () => {
    if (isPrivateChat && selectedUser) {
      return privateMessages.filter(
        (msg) =>
          (msg.fromUser === currentUsername && msg.toUser === selectedUser) ||
          (msg.fromUser === selectedUser && msg.toUser === currentUsername)
      );
    }
    return messages;
  };

  const handleSendMessage = (msg: string) => {
    if (isPrivateChat && selectedUser) {
      sendPrivateMessage(currentUsername, selectedUser, msg);
    } else {
      sendMessage(currentUsername, msg);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (isPrivateChat && selectedUser) {
      sendTypingStatus(isTyping, selectedUser);
    } else {
      sendTypingStatus(isTyping);
    }
  };

  if (!isConnected) {
    return (
      <div
        className="chat-container"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div className="chat-header">
          <h2>Gerçek Zamanlı Sohbet (Giriş)</h2>
          <div className="user-input">
            <input
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Kullanıcı adınızı girin"
            />
            <button onClick={handleConnect} disabled={!usernameInput}>
              Bağlan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <NotificationList notifications={notifications} />

      <div className="chat-header">
        <h2>Gerçek Zamanlı Sohbet</h2>
        <div className="user-info">Hoş geldin, {currentUsername}!</div>
      </div>

      <div className="chat-layout">
        <UserList
          users={users}
          currentUsername={currentUsername}
          onStartPrivateChat={startPrivateChat}
        />

        <div className="chat-area">
          <div className="chat-tabs">
            <button
              className={!isPrivateChat ? "active" : ""}
              onClick={switchToPublicChat}
            >
              Genel Sohbet
            </button>
            {selectedUser && (
              <button
                className={isPrivateChat ? "active" : ""}
                onClick={switchToPrivateChat}
              >
                {selectedUser} ile Özel Sohbet
              </button>
            )}
          </div>

          <MessageList
            messages={getCurrentMessages()}
            currentUser={currentUsername}
            connectionNotifications={connectionNotifications}
            typingUsers={typingUsers}
            isPrivateChat={isPrivateChat}
            selectedUser={selectedUser}
          />

          <ChatInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
          />
        </div>
      </div>
    </div>
  );
};
