import React from "react";

import "../Chat/ChatLayout.css"; // CSS'i buradan çekiyoruz
import type { ChatNotification } from "../../types/ChatNotification";

interface NotificationListProps {
  notifications: ChatNotification[];
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
}) => {
  return (
    <div className="notifications-container">
      {notifications.map((notif, index) => (
        <div
          key={index}
          className={`top-notification ${notif.isPrivate ? "private" : ""}`}
        >
          <span className="notification-content">
            <strong>{notif.fromUser}</strong>
            {notif.isPrivate
              ? " size özel mesaj gönderdi:"
              : " size yeni bir mesaj gönderdi:"}
            {" " + notif.message}
          </span>
        </div>
      ))}
    </div>
  );
};
