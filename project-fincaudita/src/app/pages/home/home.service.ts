import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:9191/api';

  constructor(private http: HttpClient) {}

  getFincas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Farm`);
  }

  getCultivos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/crop`);
  }

  getLotes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/lot`);
  }
}