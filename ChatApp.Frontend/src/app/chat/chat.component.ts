import { Component, OnInit } from '@angular/core';
import { SignalrService } from '../signalr.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserListComponent } from '../user-list/user-list.component';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule, UserListComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  username = '';
  message = '';
  isConnected = false;

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
      this.signalRService.sendMessage(this.username, this.message);
      this.message = '';
    }
  }
}
