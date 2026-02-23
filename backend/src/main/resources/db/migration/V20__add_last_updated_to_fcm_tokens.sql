-- Add last_updated column to fcm_tokens if it doesn't exist
ALTER TABLE fcm_tokens ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP;

-- Update existing rows to have last_updated equal to created_at
UPDATE fcm_tokens SET last_updated = created_at WHERE last_updated IS NULL;
