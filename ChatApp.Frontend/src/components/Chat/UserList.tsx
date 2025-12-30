import React from "react";

import "./ChatLayout.css";
import type { UserStatus } from "../../types/UserStatus";

interface UserListProps {
  users: UserStatus[];
  currentUsername: string;
  onStartPrivateChat: (username: string) => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  currentUsername,
  onStartPrivateChat,
}) => {
  return (
    <div className="user-list">
      <h3>Kullanıcılar</h3>
      {users.map((user, idx) => (
        <div key={idx} className="user-item">
          <div className="user-info-row">
            <span className="user-name">{user.userName}</span>
            <span
              className={`status-indicator ${
                user.isOnline ? "online" : "offline"
              }`}
            ></span>
          </div>
          {user.isOnline && user.userName !== currentUsername && (
            <button
              className="private-chat-btn"
              onClick={() => onStartPrivateChat(user.userName)}
              title="Özel Mesaj"
            >
              +
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
