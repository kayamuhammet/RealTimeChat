import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import * as signalR from "@microsoft/signalr";
import { chatApi } from "../services/api";
import type { ChatMessage } from "../types/ChatMessage";
import type { PrivateMessage } from "../types/PrivateMessage";
import type { UserStatus } from "../types/UserStatus";
import type { ChatNotification } from "../types/ChatNotification";
import type { ConnectionNotification } from "../types/ConnectionNotification";

export interface SignalRContextType {
  connection: signalR.HubConnection | null;
  startConnection: (userName: string) => void;
  messages: ChatMessage[];
  privateMessages: PrivateMessage[];
  users: UserStatus[];
  notifications: ChatNotification[];
  connectionNotifications: ConnectionNotification[];
  typingUsers: Map<string, boolean>;
  sendMessage: (user: string, message: string) => void;
  sendPrivateMessage: (
    fromUser: string,
    toUser: string,
    message: string
  ) => void;
  sendTypingStatus: (isTyping: boolean, toUser?: string) => void;
  clearTypingStatus: (toUser?: string) => void;
  currentUsername: string;
}

export const SignalRContext = createContext<SignalRContextType | undefined>(
  undefined
);

export const SignalRProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [connectionNotifications, setConnectionNotifications] = useState<
    ConnectionNotification[]
  >([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(
    new Map()
  );
  const [currentUsername, setCurrentUsername] = useState<string>("");

  const hubUrl = "http://localhost:5011/chathub";

  const loadMessageHistory = async () => {
    const data = await chatApi.getMessages();
    setMessages(data);
  };

  const loadPrivateMessageHistory = async (username: string) => {
    const data = await chatApi.getPrivateMessages(username);
    setPrivateMessages(data);
  };

  const startConnection = (userName: string) => {
    setCurrentUsername(userName);
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubUrl}?user=${userName}`)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  };

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("SignalR Bağlandı");
          connection.invoke("GetUserList");
          loadMessageHistory();
          loadPrivateMessageHistory(currentUsername);
        })
        .catch((err) => console.error("SignalR Bağlantı Hatası:", err));

      connection.on("ReceiveMessage", (user: string, message: string) => {
        setMessages((prev) => [
          ...prev,
          { user, message, timestamp: new Date() },
        ]);
      });

      connection.on(
        "ReceivePrivateMessage",
        (fromUser: string, toUser: string, message: string) => {
          setPrivateMessages((prev) => [
            ...prev,
            { fromUser, toUser, message, timestamp: new Date() },
          ]);
        }
      );

      connection.on("UserStatusChanged", (updatedUsers: UserStatus[]) => {
        setUsers(updatedUsers);
      });

      connection.on(
        "UserTypingStatusChanged",
        (userName: string, isTyping: boolean) => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(userName, isTyping);
            return newMap;
          });
        }
      );

      connection.on(
        "UserTypingStatusChangedPrivate",
        (fromUser: string, isTyping: boolean) => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(fromUser, isTyping);
            return newMap;
          });
        }
      );

      connection.on(
        "ConnectionNotification",
        (userName: string, isConnected: boolean, timestamp: string) => {
          const newNotif = {
            userName,
            isConnected,
            timestamp: new Date(timestamp),
          };
          setConnectionNotifications((prev) => [...prev, newNotif]);
          setTimeout(() => {
            setConnectionNotifications((prev) =>
              prev.filter((n) => n !== newNotif)
            );
          }, 5000);
        }
      );

      connection.on(
        "ReceiveNotification",
        (fromUser: string, message: string, isPrivate: boolean) => {
          const newNotif: ChatNotification = {
            fromUser,
            message,
            isPrivate,
            timestamp: new Date(),
          };
          setNotifications((prev) => [...prev, newNotif]);
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n !== newNotif));
          }, 5000);
        }
      );

      connection.on("UserNameExists", (message: string) => {
        alert(message);
      });

      connection.on("ForceDisconnect", (message: string) => {
        alert(message);
        connection.stop();
        window.location.reload();
      });

      return () => {
        connection.stop();
      };
    }
  }, [connection, currentUsername]);

  const sendMessage = async (user: string, message: string) => {
    if (connection) await connection.invoke("SendMessage", user, message);
  };

  const sendPrivateMessage = async (
    fromUser: string,
    toUser: string,
    message: string
  ) => {
    if (connection)
      await connection.invoke("SendPrivateMessage", fromUser, toUser, message);
  };

  const sendTypingStatus = async (isTyping: boolean, toUser?: string) => {
    if (!connection) return;
    try {
      if (toUser) {
        await connection.invoke(
          "UserIsTypingPrivate",
          currentUsername,
          toUser,
          isTyping
        );
      } else {
        await connection.invoke("UserIsTyping", currentUsername, isTyping);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearTypingStatus = async (toUser?: string) => {
    if (!connection) return;
    try {
      if (toUser) {
        await connection.invoke(
          "UserIsTypingPrivate",
          currentUsername,
          toUser,
          false
        );
      } else {
        await connection.invoke("UserIsTyping", currentUsername, false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SignalRContext.Provider
      value={{
        connection,
        startConnection,
        messages,
        privateMessages,
        users,
        notifications,
        connectionNotifications,
        typingUsers,
        sendMessage,
        sendPrivateMessage,
        sendTypingStatus,
        clearTypingStatus,
        currentUsername,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};
