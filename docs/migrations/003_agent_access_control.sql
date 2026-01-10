-- Migration: Add is_free column to agents table for access control
-- Run this in your Supabase SQL Editor

-- Add is_free column to agents (true = free for all, false = requires purchase)
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;

-- Create user_agent_access table for tracking which premium agents a user has access to
CREATE TABLE IF NOT EXISTS user_agent_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL = never expires
    granted_by TEXT, -- 'purchase', 'admin', 'promotion'
    UNIQUE(user_id, agent_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_agent_access_user ON user_agent_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_access_agent ON user_agent_access(agent_id);

-- Enable RLS
ALTER TABLE user_agent_access ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own access
CREATE POLICY "Users can view own agent access" ON user_agent_access
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can manage all access
CREATE POLICY "Admins can manage agent access" ON user_agent_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Update all existing agents to be free by default
UPDATE agents SET is_free = true WHERE is_free IS NULL;

-- Example: Mark specific agents as premium (run manually as needed)
-- UPDATE agents SET is_free = false WHERE name = 'Agent Premium';
