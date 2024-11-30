import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from './notifications.service'; // Importa el servicio

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  private currentUserId = 1; // Cambia esto al ID del usuario actual

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = this.notificationService.getNotificationsForUser(this.currentUserId);
    });
  }

  markAsRead(notification: any) {
    notification.read = true;
  }
}
