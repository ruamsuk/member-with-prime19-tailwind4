export type Roles = 'admin' | 'manager' | 'user';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: Roles;
  emailVerified?: boolean;
}

export interface UserProfile {
  displayName: string | null;
  email: string | null;
  role: string;
  createdAt?: Date; // Optional field
}
