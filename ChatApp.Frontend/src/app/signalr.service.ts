import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

export interface UserStatus {
  userName: string;
  isOnline: boolean;
  lastSeen: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection!: signalR.HubConnection;
  
  public messages: {user: string, message: string}[] = [];
  public users$ = new BehaviorSubject<UserStatus[]>([]);

  public startConnection(userName: string)
  {
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

    this.hubConnection.on('UserStatusChanged', (users: UserStatus[]) => {
      this.users$.next(users);
    });
  }

  public sendMessage(user: string, message: string)
  {
    this.hubConnection.invoke('SendMessage', user, message)
      .catch(err => console.error('Mesaj gönderilemedi:', err));
  }

  private getUserList()
  {
    this.hubConnection.invoke('GetUserList')
      .catch(err => console.error('Kullanıcı listesi alınamadı:', err));
  }

  constructor() { }
}
