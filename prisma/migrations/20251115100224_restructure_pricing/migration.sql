-- Migration: Restructure Pricing System
-- This migration should run AFTER 20251115100223_remove_pricing_from_token_packages
-- 1. Ensure all packages have RolePricing entries (migrate from priceInCents if it still exists)
-- 2. Seed initial feature pricing data

-- Step 1: Ensure all packages have RolePricing entries for both roles
-- Only migrate if priceInCents column still exists (for backward compatibility if migrations run out of order)
DO $$
BEGIN
    -- Check if priceInCents column exists before trying to migrate
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'token_packages' 
        AND column_name = 'priceInCents'
    ) THEN
        -- Create RolePricing entries from existing priceInCents if they don't exist for ATTORNEY
        INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
        SELECT 
          gen_random_uuid(),
          'ATTORNEY',
          tp.id,
          tp."priceInCents",
          true,
          NOW(),
          NOW()
        FROM "token_packages" tp
        WHERE NOT EXISTS (
          SELECT 1 FROM "role_pricing" rp 
          WHERE rp."packageId" = tp.id AND rp.role = 'ATTORNEY'
        );

        -- Create RolePricing entries from existing priceInCents if they don't exist for CUSTOMER
        INSERT INTO "role_pricing" ("id", "role", "packageId", "priceInCents", "isActive", "createdAt", "updatedAt")
        SELECT 
          gen_random_uuid(),
          'CUSTOMER',
          tp.id,
          tp."priceInCents",
          true,
          NOW(),
          NOW()
        FROM "token_packages" tp
        WHERE NOT EXISTS (
          SELECT 1 FROM "role_pricing" rp 
          WHERE rp."packageId" = tp.id AND rp.role = 'CUSTOMER'
        );
    END IF;
END $$;

-- Step 2: Seed initial feature pricing data
-- Note: feature_pricing table is created in migration 20251115100223_remove_pricing_from_token_packages
-- Role-agnostic pricing (applies to all roles when role is null)
INSERT INTO "feature_pricing" ("id", "feature", "displayName", "tokens", "role", "description", "isActive", "createdAt", "updatedAt")
VALUES
-- Role-agnostic features
(gen_random_uuid(), 'consultation-request', 'Consultation Request', 0, NULL, 'Free consultation request feature', true, NOW(), NOW()),
(gen_random_uuid(), 'file-upload', 'File Upload', 0, NULL, 'Free file upload feature', true, NOW(), NOW()),

-- CUSTOMER-specific features
(gen_random_uuid(), 'wizard', 'Legal Chat', 2, 'CUSTOMER', 'Basic legal chat for clients', true, NOW(), NOW()),
(gen_random_uuid(), 'grand-wizard', 'Grand Wizard', 5, 'CUSTOMER', 'Advanced legal chat for clients', true, NOW(), NOW()),
(gen_random_uuid(), 'document-assistant', 'Document Analysis', 5, 'CUSTOMER', 'Document analysis for clients', true, NOW(), NOW()),

-- ATTORNEY-specific features  
(gen_random_uuid(), 'wizard', 'Document Analysis (Wizard)', 5, 'ATTORNEY', 'Document analysis for attorneys', true, NOW(), NOW()),
(gen_random_uuid(), 'grand-wizard', 'Advanced Analysis (Grand Wizard)', 10, 'ATTORNEY', 'Advanced document analysis for attorneys', true, NOW(), NOW()),
(gen_random_uuid(), 'document-assistant', 'Document Assistant', 5, 'ATTORNEY', 'Document assistant for attorneys', true, NOW(), NOW()),
(gen_random_uuid(), 'legal-research', 'Legal Research', 3, 'ATTORNEY', 'Legal research queries for attorneys', true, NOW(), NOW()),
(gen_random_uuid(), 'document-processing', 'Document Processing', 2, 'ATTORNEY', 'Document upload and processing for attorneys', true, NOW(), NOW())
ON CONFLICT (feature, role) DO NOTHING;

-- Note: priceInCents column removal is handled in migration 20251115100223_remove_pricing_from_token_packages

