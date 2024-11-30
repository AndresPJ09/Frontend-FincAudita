// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private profileImageUrlSource = new BehaviorSubject<string | null>(localStorage.getItem('profileImageUrl'));
  profileImageUrl$ = this.profileImageUrlSource.asObservable();

  updateProfileImage(newImageUrl: string) {
    localStorage.setItem('profileImageUrl', newImageUrl);
    this.profileImageUrlSource.next(newImageUrl);
  }
}
