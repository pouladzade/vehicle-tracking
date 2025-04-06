-- Add email column to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Update existing customers with placeholder emails
-- This is just for demonstration, in a real scenario you'd want to collect actual emails
UPDATE customers 
SET email = CONCAT(name, '@example.com')
WHERE email IS NULL;

-- Add an index for email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email); 