import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project } from '../models/project';
import { Observable } from 'rxjs';
import { CurrentUser } from '../models/current-user';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  apiUrl: string;
  apiProjectUrl: string;
  authUrl: string;
  returnUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = "https://localhost:5001/api/";
    this.apiProjectUrl = this.apiUrl + "project/";
    this.authUrl = this.apiUrl + 'authentication/external-login';
    this.returnUrl = 'localhost:5001';

  }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiProjectUrl);
  }
  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiProjectUrl, project);
  }

  updateProject(project: Project): Observable<Project> {
    return this.http.put<Project>(this.apiProjectUrl + project.id, project);
  }
  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(this.apiProjectUrl + id);
  }
  getAuthenticated(): Observable<any> {
    return this.http.get<any>(this.authUrl + '?returnUrl=' + this.returnUrl);
  }
  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(this.apiUrl + 'user');
  }

}
