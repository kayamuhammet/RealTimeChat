import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection!: signalR.HubConnection;
  private username: string = '';
  
  public messages: {user: string, message: string}[] = [];
  public privateMessages: PrivateMessage[] = [];
  public users$ = new BehaviorSubject<UserStatus[]>([]);
  public typingUsers = new Map<string, boolean>();

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
      })
      .catch(err => console.error('SignalR bağlantı hatası:', err));
    
    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.messages.push({user, message});
    });

    this.hubConnection.on('ReceivePrivateMessage', (fromUser: string, toUser: string, message: string) => {
      this.privateMessages.push({
        fromUser,
        toUser,
        message,
        timestamp: new Date()
      });
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

  private getUserList()
  {
    this.hubConnection.invoke('GetUserList')
      .catch(err => console.error('Kullanıcı listesi alınamadı:', err));
  }

  constructor() { }
}
