export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}