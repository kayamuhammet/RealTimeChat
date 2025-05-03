import { Component, OnInit } from '@angular/core';
import { SignalrService } from '../signalr.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit{
  username = '';
  message = '';

  constructor(public signalRService : SignalrService) {}

  ngOnInit(): void {
    this.signalRService.startConnection();
  }

  send(): void {
    if(this.username && this.message)
    {
      this.signalRService.sendMessage(this.username, this.message);
      this.message = '';
    }
  }

}
