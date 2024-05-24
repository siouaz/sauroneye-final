// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CurrentUser } from '../authorisation/current-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'https://localhost:5001/api/';

  constructor(private http: HttpClient) { }

  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(this.authUrl + 'user');
  }
}
