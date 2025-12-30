import axios from "axios";
import type { ChatMessage } from "../types/ChatMessage";
import type { PrivateMessage } from "../types/PrivateMessage";

const API_URL = "http://localhost:5011/api/chat";

export const chatApi = {
  // Get the general message history
  getMessages: async (count: number = 50): Promise<ChatMessage[]> => {
    try {
      const response = await axios.get(`${API_URL}/messages?count=${count}`);
      if (response.data) {
        return response.data
          .map((msg: any) => ({
            user: msg.user,
            message: msg.message,
            timestamp: new Date(msg.timestamp),
          }))
          .sort(
            (a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime()
          );
      }
      return [];
    } catch (error) {
      console.error("API Error (getMessages):", error);
      return [];
    }
  },

  // Özel mesaj geçmişini getir
  getPrivateMessages: async (
    username: string,
    count: number = 50
  ): Promise<PrivateMessage[]> => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/private/${username}?count=${count}`
      );
      if (response.data) {
        return response.data
          .map((msg: any) => ({
            fromUser: msg.user,
            toUser: msg.toUser,
            message: msg.message,
            timestamp: new Date(msg.timestamp),
          }))
          .sort(
            (a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime()
          );
      }
      return [];
    } catch (error) {
      console.error("API Error (getPrivateMessages):", error);
      return [];
    }
  },
};
