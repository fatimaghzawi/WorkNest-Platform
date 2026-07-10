import type { UserRole } from './auth';

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  phone?: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  portfolioLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  skills?: string[];
  portfolioLink?: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  bio?: string;
  skills?: string[];
  portfolioLink?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface ListUsersParams {
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  search?: string;
  sort?: 'newest' | 'name_asc' | 'name_desc' | 'role';
  page?: number;
  limit?: number;
}

export interface UserStats {
  total: number;
  active: number;
  clients: number;
  freelancers: number;
  admins: number;
}
