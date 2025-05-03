import { Component, OnInit } from '@angular/core';
import { SignalrService, UserStatus } from '../signalr.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  username = '';
  message = '';
  isConnected = false;
  isPrivateChat = false;
  selectedUser: string | null = null;

  constructor(public signalRService: SignalrService) {}

  ngOnInit(): void {}

  connect(): void {
    if (this.username) {
      this.signalRService.startConnection(this.username);
      this.isConnected = true;
    }
  }

  send(): void {
    if (this.message) {
      if (this.isPrivateChat && this.selectedUser) {
        this.signalRService.sendPrivateMessage(this.username, this.selectedUser, this.message);
      } else {
        this.signalRService.sendMessage(this.username, this.message);
      }
      this.message = '';
    }
  }

  startPrivateChat(userName: string): void {
    this.selectedUser = userName;
    this.isPrivateChat = true;
  }

  switchToPublicChat(): void {
    this.isPrivateChat = false;
    this.selectedUser = null;
  }

  switchToPrivateChat(): void {
    if (this.selectedUser) {
      this.isPrivateChat = true;
    }
  }

  getPrivateMessages() {
    return this.signalRService.privateMessages.filter(msg => 
      (msg.fromUser === this.username && msg.toUser === this.selectedUser) ||
      (msg.fromUser === this.selectedUser && msg.toUser === this.username)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}
