-- Seed pricing data for token packages
-- This migration creates default token packages with role-specific pricing

-- Insert default token packages
INSERT INTO "token_packages" ("id", "name", "tokens", "priceInCents", "description", "isActive", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'Basic Plan', 1000, 1000, 'Perfect for small projects and individual use', true, NOW(), NOW()),
(gen_random_uuid(), 'Professional Plan', 5000, 4500, 'Ideal for regular users and small teams', true, NOW(), NOW()),
(gen_random_uuid(), 'Business Plan', 15000, 12000, 'Great for growing businesses and law firms', true, NOW(), NOW()),
(gen_random_uuid(), 'Enterprise Plan', 50000, 35000, 'For large organizations with high usage', true, NOW(), NOW()),
(gen_random_uuid(), 'Starter Pack', 500, 500, 'Entry-level package for testing the platform', true, NOW(), NOW());

-- Insert role-specific pricing for each package
-- Basic Plan pricing
INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'ATTORNEY',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Basic Plan';

INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'CUSTOMER',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Basic Plan';

-- Professional Plan pricing
INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'ATTORNEY',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Professional Plan';

INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'CUSTOMER',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Professional Plan';

-- Business Plan pricing
INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'ATTORNEY',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Business Plan';

INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'CUSTOMER',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Business Plan';

-- Enterprise Plan pricing
INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'ATTORNEY',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Enterprise Plan';

INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'CUSTOMER',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Enterprise Plan';

-- Starter Pack pricing
INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'ATTORNEY',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Starter Pack';

INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'CUSTOMER',
  tp.id,
  tp."priceInCents",
  true,
  NOW(),
  NOW()
FROM "token_packages" tp WHERE tp.name = 'Starter Pack';
