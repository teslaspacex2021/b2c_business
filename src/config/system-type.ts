/**
 * B2C System Configuration
 * This file identifies the current system type and available features
 */

export const SYSTEM_CONFIG = {
  type: 'b2c',
  name: 'B2C Business Platform',
  description: 'Business-to-Consumer platform with payment and shopping cart features',
  version: '1.0.0',
  
  features: {
    // B2C specific features
    payment: true,
    stripe: true,
    shoppingCart: true,
    checkout: true,
    instantPurchase: true,
    
    // B2B features (disabled in B2C)
    quote: false,
    bulkOrder: false,
    customPricing: false,
    
    // Shared features
    products: true,
    blog: true,
    contact: true,
    authentication: true,
    adminPanel: true,
  },
  
  database: {
    name: 'b2c_business',
    port: 5434,
  },
} as const;

export type SystemType = typeof SYSTEM_CONFIG.type;
export type SystemFeatures = typeof SYSTEM_CONFIG.features;

/**
 * Check if a feature is enabled in the current system
 */
export function isFeatureEnabled(feature: keyof typeof SYSTEM_CONFIG.features): boolean {
  return SYSTEM_CONFIG.features[feature];
}

/**
 * Get the current system type
 */
export function getSystemType(): SystemType {
  return SYSTEM_CONFIG.type;
}

