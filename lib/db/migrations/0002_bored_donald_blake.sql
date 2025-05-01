-- Modify the subscription_status column to accept the new values
ALTER TABLE teams 
ALTER COLUMN subscription_status 
TYPE VARCHAR(20);

-- If you're using PostgreSQL with enum types, you might need:
-- ALTER TYPE subscription_status_enum ADD VALUE IF NOT EXISTS 'incomplete';
-- ALTER TYPE subscription_status_enum ADD VALUE IF NOT EXISTS 'incomplete_expired';
-- ALTER TYPE subscription_status_enum ADD VALUE IF NOT EXISTS 'past_due';