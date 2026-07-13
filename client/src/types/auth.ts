export type UserRole = 'client' | 'freelancer' | 'admin';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  authProvider?: 'local' | 'google' | 'github';
  profileImage?: string;
  bio?: string;
  skills?: string[];
}

export interface GoogleLoginPayload {
  credential: string;
  role?: 'client' | 'freelancer';
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'client' | 'freelancer';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
}
