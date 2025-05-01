-- Modify the subscription_status column to accept the new values
ALTER TABLE teams 
ALTER COLUMN subscription_status 
TYPE VARCHAR(20);

-- No table creation, just column modification