-- Seed Features Data
-- This migration seeds the features table with all attorney and client features

-- Insert Attorney Features
INSERT INTO "public"."features" ("id", "name", "displayName", "description", "route", "category", "isGlobal", "isEnabled", "createdAt", "updatedAt") VALUES
(gen_random_uuid(), 'attorney_dashboard', 'Attorney Dashboard', 'Main dashboard for attorneys with analytics and overview', '/attorney/dashboard', 'ANALYTICS', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_directory', 'Directory', 'Client directory for attorneys to browse and manage clients', '/attorney/directory', 'CLIENT_MANAGEMENT', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_inbox', 'Inbox', 'Inbox and messaging system for attorney-client communication', '/attorney/inbox', 'COMMUNICATION', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_wizard', 'Document Analysis', 'AI-powered document analysis tool for attorneys', '/attorney/wizard', 'DOCUMENT_PROCESSING', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_grand_wizard', 'Advanced Analysis', 'Advanced AI analysis tool with enhanced capabilities', '/attorney/grand-wizard', 'DOCUMENT_PROCESSING', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_query_history', 'Query History', 'History of all queries and analysis performed', '/attorney/query-history', 'ANALYTICS', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_docket_genie', 'Docket Genie', 'Court docket search and case management tool', '/attorney/docket-genie', 'DOCKET_GENIE', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_blog', 'Legal Blog', 'Legal blog publishing and content management', '/attorney/blog', 'RESOURCES', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_miniverse', 'Miniverse', 'Virtual legal environment and networking platform', '/attorney/miniverse', 'RESOURCES', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_integrations', 'Integrations', 'OneDrive and other third-party integrations', '/attorney/integrations', 'INTEGRATIONS', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_profile', 'Profile', 'Attorney profile management and settings', '/attorney/profile', 'CLIENT_MANAGEMENT', true, true, NOW(), NOW()),
(gen_random_uuid(), 'attorney_tokens', 'Service Credits', 'Token management and service credit system', '/attorney/tokens', 'ANALYTICS', true, true, NOW(), NOW()),

-- Insert Client Features
(gen_random_uuid(), 'client_dashboard', 'Client Dashboard', 'Main dashboard for clients with consultation overview', '/client/dashboard', 'ANALYTICS', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_directory', 'Find Attorney', 'Search and browse available attorneys', '/client/directory', 'CLIENT_MANAGEMENT', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_wizard', 'Legal Assistant', 'AI-powered legal assistant for basic questions', '/client/wizard', 'DOCUMENT_PROCESSING', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_grand_wizard', 'Advanced Assistant', 'Advanced AI assistant with enhanced capabilities', '/client/grand-wizard', 'DOCUMENT_PROCESSING', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_legal_chat', 'Chat History', 'History of all legal consultations and chats', '/client/legal-chat', 'COMMUNICATION', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_inbox', 'Messages', 'Direct messaging with attorneys', '/client/inbox', 'COMMUNICATION', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_integrations', 'My Documents', 'Document storage and management system', '/client/integrations', 'INTEGRATIONS', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_blog', 'Legal Blog', 'Access to legal blog and educational content', '/client/blog', 'RESOURCES', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_miniverse', 'Miniverse', 'Community platform and legal resources', '/client/miniverse', 'RESOURCES', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_profile', 'My Profile', 'Client profile management and settings', '/client/profile', 'CLIENT_MANAGEMENT', true, true, NOW(), NOW()),
(gen_random_uuid(), 'client_tokens', 'My Credits', 'Token management and credit system', '/client/tokens', 'ANALYTICS', true, true, NOW(), NOW());

-- Insert Feature Role Mappings for Attorney Features
INSERT INTO "public"."feature_roles" ("id", "featureId", "role", "isEnabled") 
SELECT gen_random_uuid(), f.id, 'ATTORNEY', true
FROM "public"."features" f
WHERE f.name LIKE 'attorney_%';

-- Insert Feature Role Mappings for Client Features
INSERT INTO "public"."feature_roles" ("id", "featureId", "role", "isEnabled") 
SELECT gen_random_uuid(), f.id, 'CUSTOMER', true
FROM "public"."features" f
WHERE f.name LIKE 'client_%';