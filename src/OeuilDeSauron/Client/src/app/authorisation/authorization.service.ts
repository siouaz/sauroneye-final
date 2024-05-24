import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { CurrentUser } from './current-user';

/**
 * Authorization service.
 *
 * @export
 */
@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private current?: CurrentUser;

  public get user(): CurrentUser | undefined {
    return this.current;
  }

  /**
   * Sets the logged-in user.
   */
  public set user(user: CurrentUser | undefined) {
    this.current = user;

    // Add user properties to the logger
    if (this.user?.isAuthenticated) {
      // this.logger
      //   .addProperty('userName', this.current?.userName as string)
      //   .setAuthenticatedUserContext(this.current?.id as string);
    }
  }

  constructor(private http: HttpClient) { }

  /**
   * Gets the logged-in user.
   */
  public getUser(): Observable<CurrentUser> {
    const test = this.http.get<CurrentUser>('/api/user');
    console.log(test)
    return test;
    return this.http.get<CurrentUser>('/api/user');
  }



  /**
   * Application initializer factory for retrieving logged-in user.
   */
  public async initialize(): Promise<CurrentUser | undefined> {
    this.user = await firstValueFrom(this.getUser());

    return this.user;
  }
}
