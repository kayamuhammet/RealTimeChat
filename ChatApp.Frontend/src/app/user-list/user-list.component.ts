import { Component, OnInit } from '@angular/core';
import { SignalrService, UserStatus } from '../signalr.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: UserStatus[] = [];

  constructor(private signalrService: SignalrService) {}

  ngOnInit() {
    this.signalrService.users$.subscribe(users => {
      this.users = users;
    });
  }
} 
