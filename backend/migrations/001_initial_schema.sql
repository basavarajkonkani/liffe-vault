-- LifeVault Database Migration
-- Version: 001
-- Description: Initial schema with users, assets, documents, nominees, and linked_nominees tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth users)
-- Stores additional user information including role and hashed PIN
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'nominee', 'admin')),
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
-- Stores digital assets owned by users
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Legal', 'Financial', 'Medical', 'Personal', 'Other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
-- Stores metadata for files uploaded to Supabase Storage
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nominees table
-- Stores users who can be designated as nominees
CREATE TABLE IF NOT EXISTS nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Linked nominees table (junction table)
-- Links assets to nominees for access control
CREATE TABLE IF NOT EXISTS linked_nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  nominee_id UUID NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, nominee_id)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_asset_id ON documents(asset_id);
CREATE INDEX IF NOT EXISTS idx_nominees_user_id ON nominees(user_id);
CREATE INDEX IF NOT EXISTS idx_linked_nominees_asset_id ON linked_nominees(asset_id);
CREATE INDEX IF NOT EXISTS idx_linked_nominees_nominee_id ON linked_nominees(nominee_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create triggers to automatically update updated_at on assets table
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to tables for documentation
COMMENT ON TABLE users IS 'Extended user information including role and PIN hash';
COMMENT ON TABLE assets IS 'Digital assets owned by users';
COMMENT ON TABLE documents IS 'Document metadata for files stored in Supabase Storage';
COMMENT ON TABLE nominees IS 'Users designated as nominees who can receive asset access';
COMMENT ON TABLE linked_nominees IS 'Junction table linking assets to nominees for access control';

-- Add comments to important columns
COMMENT ON COLUMN users.role IS 'User role: owner (creates assets), nominee (receives access), or admin (system management)';
COMMENT ON COLUMN users.pin_hash IS 'Bcrypt hashed 6-digit PIN for authentication';
COMMENT ON COLUMN assets.category IS 'Asset category: Legal, Financial, Medical, Personal, or Other';
COMMENT ON COLUMN documents.file_path IS 'Path to file in Supabase Storage bucket';
COMMENT ON COLUMN documents.file_size IS 'File size in bytes';
