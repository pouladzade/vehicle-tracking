-- Make email NOT NULL in customers table
-- First ensure all customers have an email address
UPDATE customers 
SET email = CONCAT(name, '@example.com')
WHERE email IS NULL;

-- Then add the NOT NULL constraint
ALTER TABLE customers ALTER COLUMN email SET NOT NULL;

-- Log the change
INSERT INTO migrations (name, applied_at) 
VALUES ('make-email-required', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING; 