-- Migration: Add trash functionality with automatic deletion after 30 days
-- Date: 2025-11-30
-- Description: Adds deleted_at column to folder and record tables for soft delete functionality

-- Add deleted_at column to folder table
ALTER TABLE folder ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_at column to record table
ALTER TABLE record ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create indexes for better query performance on deleted items
CREATE INDEX IF NOT EXISTS idx_folder_deleted_at ON folder (deleted_at);
CREATE INDEX IF NOT EXISTS idx_record_deleted_at ON record (deleted_at);

-- Create indexes for trash queries (where deleted_at IS NOT NULL)
CREATE INDEX IF NOT EXISTS idx_folder_trash ON folder (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_record_trash ON record (deleted_at) WHERE deleted_at IS NOT NULL;