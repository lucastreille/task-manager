export enum ROLE {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  role: ROLE;
}

export interface AuthResponse {
  access_token: string; 
}
