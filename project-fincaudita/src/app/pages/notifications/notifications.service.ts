import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private apiUrl = 'http://localhost:9191/api/alert'; // URL de tu API

  constructor(private http: HttpClient) {
    this.loadNotifications();
  }

  // Método para cargar notificaciones desde la API
  private loadNotifications() {
    this.http.get<any[]>(this.apiUrl).pipe(
      map(alerts => alerts.map(alert => ({
        id: alert.id,
        title: alert.title, // Obtener el title de alert
        date: new Date(alert.date), // Asegúrate de convertir la fecha
        userId: alert.userId, // Asumiendo que también hay un userId en los datos de alert
        read: false // Inicializa como no leída
      })))
    ).subscribe(notifications => {
      this.notificationsSubject.next(notifications);
    });
  }

  // Método para obtener notificaciones por usuario
  getNotificationsForUser(userId: number) {
    return this.notificationsSubject.value.filter(notification => notification.userId === userId);
  }
}
