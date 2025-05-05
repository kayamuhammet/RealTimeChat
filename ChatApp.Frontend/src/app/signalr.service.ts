import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface UserStatus {
  userName: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface PrivateMessage {
  fromUser: string;
  toUser: string;
  message: string;
  timestamp: Date;
}

export interface ChatMessage {
  user: string;
  message: string;
  timestamp: Date;
}

export interface ConnectionNotification {
  userName: string;
  isConnected: boolean;
  timestamp: Date;
}

export interface Notification {
  fromUser: string;
  message: string;
  isPrivate: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection!: signalR.HubConnection;
  private username: string = '';
  private apiUrl = 'http://localhost:5011/api/chat';
  
  public messages: ChatMessage[] = [];
  public privateMessages: PrivateMessage[] = [];
  public users$ = new BehaviorSubject<UserStatus[]>([]);
  public typingUsers = new Map<string, boolean>();
  public connectionNotifications$ = new BehaviorSubject<ConnectionNotification[]>([]);
  public notifications$ = new BehaviorSubject<Notification[]>([]);

  constructor(private http: HttpClient) {}

  public async loadMessageHistory(count: number = 50) {
    try {
      const response = await this.http.get<any[]>(`${this.apiUrl}/messages?count=${count}`).toPromise();
      if (response) {
        this.messages = response.map(msg => ({
          user: msg.user,
          message: msg.message,
          timestamp: new Date(msg.timestamp)
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      }
    } catch (error) {
      console.error('Mesaj geçmişi yüklenirken hata oluştu:', error);
    }
  }

  public async loadPrivateMessageHistory(username: string, count: number = 50) {
    try {
      const response = await this.http.get<any[]>(`${this.apiUrl}/messages/private/${username}?count=${count}`).toPromise();
      if (response) {
        this.privateMessages = response.map(msg => ({
          fromUser: msg.user,
          toUser: msg.toUser,
          message: msg.message,
          timestamp: new Date(msg.timestamp)
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      }
    } catch (error) {
      console.error('Özel mesaj geçmişi yüklenirken hata oluştu:', error);
    }
  }

  public async loadUserMessageHistory(username: string, count: number = 50) {
    try {
      const response = await this.http.get<any[]>(`${this.apiUrl}/messages/user/${username}?count=${count}`).toPromise();
      if (response) {
        return response.map(msg => ({
          user: msg.user,
          message: msg.message,
          timestamp: new Date(msg.timestamp)
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      }
      return [];
    } catch (error) {
      console.error('Kullanıcı mesaj geçmişi yüklenirken hata oluştu:', error);
      return [];
    }
  }

  public async searchMessages(query: string, count: number = 50) {
    try {
      const response = await this.http.get<any[]>(`${this.apiUrl}/messages/search?query=${query}&count=${count}`).toPromise();
      if (response) {
        return response.map(msg => ({
          user: msg.user,
          message: msg.message,
          timestamp: new Date(msg.timestamp)
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      }
      return [];
    } catch (error) {
      console.error('Mesaj araması yapılırken hata oluştu:', error);
      return [];
    }
  }

  public startConnection(userName: string)
  {
    this.username = userName;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5011/chathub?user=${userName}`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR bağlantısı başlatıldı.');
        this.getUserList();
        this.loadMessageHistory();
        this.loadPrivateMessageHistory(userName);
      })
      .catch(err => console.error('SignalR bağlantı hatası:', err));
    
    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.messages.push({
        user,
        message,
        timestamp: new Date()
      });
      this.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    this.hubConnection.on('ReceivePrivateMessage', (fromUser: string, toUser: string, message: string) => {
      this.privateMessages.push({
        fromUser,
        toUser,
        message,
        timestamp: new Date()
      });
      this.privateMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    this.hubConnection.on('UserStatusChanged', (users: UserStatus[]) => {
      this.users$.next(users);
    });

    this.hubConnection.on('UserTypingStatusChanged', (userName: string, isTyping: boolean) => {
      this.typingUsers.set(userName, isTyping);
    });

    this.hubConnection.on('UserTypingStatusChangedPrivate', (fromUser: string, isTyping: boolean) => {
      this.typingUsers.set(fromUser, isTyping);
    });

    this.hubConnection.on('ConnectionNotification', (userName: string, isConnected: boolean, timestamp: Date) => {
      const notifications = this.connectionNotifications$.value;
      const newNotification = {
        userName,
        isConnected,
        timestamp: new Date(timestamp)
      };
      notifications.push(newNotification);
      this.connectionNotifications$.next(notifications);

      setTimeout(() => {
        const currentNotifications = this.connectionNotifications$.value;
        const index = currentNotifications.findIndex(n => 
          n.userName === userName && 
          n.isConnected === isConnected && 
          n.timestamp.getTime() === newNotification.timestamp.getTime()
        );
        if (index !== -1) {
          currentNotifications.splice(index, 1);
          this.connectionNotifications$.next(currentNotifications);
        }
      }, 5000);
    });

    this.hubConnection.on('UserNameExists', (message: string) => {
      alert(message);
    });

    this.hubConnection.on('ForceDisconnect', (message: string) => {
      alert(message);
      this.hubConnection.stop();
      window.location.reload();
    });

    this.hubConnection.on('ReceiveNotification', (fromUser: string, message: string, isPrivate: boolean) => {
      const notifications = this.notifications$.value;
      const newNotification = {
        fromUser,
        message,
        isPrivate,
        timestamp: new Date()
      };
      notifications.push(newNotification);
      this.notifications$.next(notifications);

      setTimeout(() => {
        const currentNotifications = this.notifications$.value;
        const index = currentNotifications.findIndex(n => 
          n.fromUser === fromUser && 
          n.message === message && 
          n.isPrivate === isPrivate &&
          n.timestamp.getTime() === newNotification.timestamp.getTime()
        );
        if (index !== -1) {
          currentNotifications.splice(index, 1);
          this.notifications$.next(currentNotifications);
        }
      }, 5000);
    });
  }

  public sendMessage(user: string, message: string)
  {
    this.hubConnection.invoke('SendMessage', user, message)
      .catch(err => console.error('Mesaj gönderilemedi:', err));
  }

  public sendPrivateMessage(fromUser: string, toUser: string, message: string)
  {
    this.hubConnection.invoke('SendPrivateMessage', fromUser, toUser, message)
      .catch(err => console.error('Özel mesaj gönderilemedi:', err));
  }

  public sendTypingStatus(isTyping: boolean, toUser?: string) {
    if (toUser) {
      this.hubConnection.invoke('UserIsTypingPrivate', this.username, toUser, isTyping)
        .catch(err => console.error('Yazma durumu gönderilemedi:', err));
    } else {
      this.hubConnection.invoke('UserIsTyping', this.username, isTyping)
        .catch(err => console.error('Yazma durumu gönderilemedi:', err));
    }
  }

  public clearTypingStatus(toUser?: string) {
    if (toUser) {
      this.hubConnection.invoke('UserIsTypingPrivate', this.username, toUser, false)
        .catch(err => console.error('Yazma durumu temizlenemedi:', err));
    } else {
      this.hubConnection.invoke('UserIsTyping', this.username, false)
        .catch(err => console.error('Yazma durumu temizlenemedi:', err));
    }
  }

  private getUserList()
  {
    this.hubConnection.invoke('GetUserList')
      .catch(err => console.error('Kullanıcı listesi alınamadı:', err));
  }
}
