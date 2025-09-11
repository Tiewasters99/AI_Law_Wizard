-- Insert default token packages
INSERT INTO "public"."token_packages" (
  "id",
  "name",
  "tokens",
  "priceInCents",
  "description",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES
  (
    'starter_pack_default',
    'Starter Pack',
    10,
    1000,
    'Perfect for getting started with AI document analysis',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'professional_pack_default',
    'Professional Pack',
    25,
    2000,
    'Ideal for regular users who need more analysis power',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'business_pack_default',
    'Business Pack',
    50,
    3500,
    'Great value for businesses and power users',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'enterprise_pack_default',
    'Enterprise Pack',
    100,
    6000,
    'Maximum value for large-scale document analysis',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("id") DO NOTHING;