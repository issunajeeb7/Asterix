export type UserRole = 'kids' | 'elderly' | 'caregiver';

export interface UserMetadata {
  role: UserRole;
  age_group?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  metadata?: UserMetadata;
}
