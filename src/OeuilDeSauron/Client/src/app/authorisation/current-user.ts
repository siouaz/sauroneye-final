/**
 * Logged-in user.
 */
export interface CurrentUser {
  id: string;
  userName: string;
  userEmail: string;
  userFullName: string;
  culture: string;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  roles: string[];
}
