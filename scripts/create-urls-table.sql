-- Create the urls table for storing URL mappings
CREATE TABLE IF NOT EXISTS urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  click_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);

-- Create index for created_at for analytics
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at);
