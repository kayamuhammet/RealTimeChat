import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection!: signalR.HubConnection;
  
  public messages: {user: string, message: string}[] = [];

  public startConnection()
  {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5011/chathub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR bağlantısı başlatıldı.'))
      .catch(err => console.error('SignalR bağlantı hatası:', err));
    
    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.messages.push({user, message});
    });
  }

  public sendMessage(user: string, message: string)
  {
    this.hubConnection.invoke('SendMessage', user, message)
      .catch(err => console.error('Mesaj gönderilemedi:', err));
  }

  constructor() { }
}
