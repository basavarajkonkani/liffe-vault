// User Interface
export interface User {
  id: string;
  email: string;
  role: 'owner' | 'nominee' | 'admin';
  created_at: string;
  updated_at: string;
}

// Asset Interface
export interface Asset {
  id: string;
  owner_id: string;
  title: string;
  category: 'Legal' | 'Financial' | 'Medical' | 'Personal' | 'Other';
  created_at: string;
  updated_at: string;
  owner?: User;
  documents?: Document[];
  linked_nominees?: LinkedNominee[];
}

// Document Interface
export interface Document {
  id: string;
  asset_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

// Nominee Interface
export interface Nominee {
  id: string;
  user_id: string;
  created_at: string;
  user?: User;
}

// Linked Nominee Interface
export interface LinkedNominee {
  id: string;
  asset_id: string;
  nominee_id: string;
  linked_at: string;
  nominee?: Nominee;
}

// JWT Payload Interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth State Interface
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}
