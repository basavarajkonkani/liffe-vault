// TypeScript interfaces matching database schema

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'nominee' | 'admin';
  pin_hash: string;
  created_at: string;
  updated_at: string;
}

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

export interface Document {
  id: string;
  asset_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export interface Nominee {
  id: string;
  user_id: string;
  created_at: string;
  user?: User;
}

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

// Request user interface (attached to Express Request)
export interface RequestUser {
  userId: string;
  email: string;
  role: 'owner' | 'nominee' | 'admin';
}
