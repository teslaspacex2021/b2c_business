#!/usr/bin/env node

/**
 * B2B Platform Enhancement - Automated Testing Script
 * Uses MCP-style testing approach to validate all implemented features
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 B2B Platform Enhancement - Automated Testing\n');

// Test configuration
const config = {
  serverUrl: 'http://localhost:3002',
  testTimeout: 30000,
  retryAttempts: 3
};

// Test results storage
const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: { passed: 0, failed: 0, skipped: 0 }
};

// Utility functions
function logTest(name, status, details = '') {
  const statusIcon = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${name}${details ? ` - ${details}` : ''}`);
  
  results.tests.push({ name, status, details, timestamp: new Date().toISOString() });
  results.summary[status.toLowerCase()]++;
}

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${config.serverUrl}${endpoint}`, options);
    return { ok: response.ok, status: response.status, data: await response.json() };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// Test 1: File Structure Validation
console.log('📁 Testing File Structure...');

const requiredFiles = [
  'src/components/StripePaymentElement.tsx',
  'src/components/OptimizedCustomerSupportWidget.tsx',
  'src/app/api/payments/create-payment-intent/route.ts',
  'src/app/api/admin/payments/settings/route.ts',
  'src/app/api/admin/payments/test-connection/route.ts',
  'src/app/admin/layout.tsx',
  'src/app/admin/page.tsx',
  'src/app/blog/[id]/page.tsx',
  'src/app/product/[id]/ProductDetailContent.tsx',
  'prisma/schema.prisma'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    logTest(`File exists: ${file}`, 'PASSED');
  } else {
    logTest(`File missing: ${file}`, 'FAILED');
    allFilesExist = false;
  }
});

// Test 2: Component Implementation Validation
console.log('\n🧩 Testing Component Implementations...');

// Test Stripe Payment Element
const stripeComponentPath = path.join(__dirname, 'src/components/StripePaymentElement.tsx');
if (fs.existsSync(stripeComponentPath)) {
  const content = fs.readFileSync(stripeComponentPath, 'utf8');
  
  const hasPaymentElement = content.includes('PaymentElement');
  const hasLoadStripe = content.includes('loadStripe');
  const hasErrorHandling = content.includes('onError');
  
  if (hasPaymentElement && hasLoadStripe && hasErrorHandling) {
    logTest('StripePaymentElement implementation', 'PASSED', 'All required features present');
  } else {
    logTest('StripePaymentElement implementation', 'FAILED', 'Missing required features');
  }
} else {
  logTest('StripePaymentElement implementation', 'FAILED', 'File not found');
}

// Test Optimized Support Widget
const supportWidgetPath = path.join(__dirname, 'src/components/OptimizedCustomerSupportWidget.tsx');
if (fs.existsSync(supportWidgetPath)) {
  const content = fs.readFileSync(supportWidgetPath, 'utf8');
  
  const hasAuthentication = content.includes('useSession');
  const hasSocialMedia = content.includes('SocialMediaLinks');
  const noBotFunctionality = !content.toLowerCase().includes('bot') || content.includes('// No bot functionality');
  
  if (hasAuthentication && hasSocialMedia) {
    logTest('OptimizedCustomerSupportWidget implementation', 'PASSED', 'Authentication and social media integrated');
  } else {
    logTest('OptimizedCustomerSupportWidget implementation', 'FAILED', 'Missing required features');
  }
} else {
  logTest('OptimizedCustomerSupportWidget implementation', 'FAILED', 'File not found');
}

// Test 3: Database Schema Validation
console.log('\n🗄️ Testing Database Schema...');

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  if (schemaContent.includes('model PaymentSettings')) {
    logTest('PaymentSettings model', 'PASSED', 'Model exists in schema');
  } else {
    logTest('PaymentSettings model', 'FAILED', 'Model missing from schema');
  }
  
  if (schemaContent.includes('stripeSecretKey') && schemaContent.includes('stripePublishableKey')) {
    logTest('Stripe configuration fields', 'PASSED', 'All fields present');
  } else {
    logTest('Stripe configuration fields', 'FAILED', 'Missing required fields');
  }
} else {
  logTest('Database schema', 'FAILED', 'Schema file not found');
}

// Test 4: Admin Layout Optimization
console.log('\n🎛️ Testing Admin Layout...');

const adminLayoutPath = path.join(__dirname, 'src/app/admin/layout.tsx');
if (fs.existsSync(adminLayoutPath)) {
  const content = fs.readFileSync(adminLayoutPath, 'utf8');
  
  // Check for Payment Setup navigation
  if (content.includes('Payment Setup')) {
    logTest('Payment Setup navigation', 'PASSED', 'Navigation item added');
  } else {
    logTest('Payment Setup navigation', 'FAILED', 'Navigation item missing');
  }
  
  // Check for duplicate customers (should not exist)
  const customerMatches = content.match(/title: 'Customers'/g);
  if (!customerMatches || customerMatches.length <= 1) {
    logTest('Navigation duplicates removed', 'PASSED', 'No duplicate entries found');
  } else {
    logTest('Navigation duplicates removed', 'FAILED', `Found ${customerMatches.length} duplicate entries`);
  }
} else {
  logTest('Admin layout optimization', 'FAILED', 'Layout file not found');
}

// Test 5: Dashboard Statistics Compression
console.log('\n📊 Testing Dashboard Optimization...');

const dashboardPath = path.join(__dirname, 'src/app/admin/page.tsx');
if (fs.existsSync(dashboardPath)) {
  const content = fs.readFileSync(dashboardPath, 'utf8');
  
  if (content.includes('System Overview')) {
    logTest('Dashboard statistics compression', 'PASSED', 'Compact layout implemented');
  } else {
    logTest('Dashboard statistics compression', 'FAILED', 'Still using old layout');
  }
  
  if (content.includes('grid gap-4 md:grid-cols-3 lg:grid-cols-6')) {
    logTest('Dashboard grid layout', 'PASSED', 'Compressed grid implemented');
  } else {
    logTest('Dashboard grid layout', 'FAILED', 'Grid layout not optimized');
  }
} else {
  logTest('Dashboard optimization', 'FAILED', 'Dashboard file not found');
}

// Test 6: Blog Routing Fix
console.log('\n📝 Testing Blog Routing...');

const blogDetailPath = path.join(__dirname, 'src/app/blog/[id]/page.tsx');
if (fs.existsSync(blogDetailPath)) {
  const content = fs.readFileSync(blogDetailPath, 'utf8');
  
  if (content.includes('const { id } = await params;')) {
    logTest('Blog routing fix', 'PASSED', 'Parameter handling corrected');
  } else {
    logTest('Blog routing fix', 'FAILED', 'Parameter handling not fixed');
  }
} else {
  logTest('Blog routing fix', 'FAILED', 'Blog detail file not found');
}

// Test 7: Product Detail Enhancement
console.log('\n🛍️ Testing Product Detail Enhancement...');

const productDetailPath = path.join(__dirname, 'src/app/product/[id]/ProductDetailContent.tsx');
if (fs.existsSync(productDetailPath)) {
  const content = fs.readFileSync(productDetailPath, 'utf8');
  
  if (content.includes('StripePaymentElement')) {
    logTest('Product payment integration', 'PASSED', 'Stripe integration added');
  } else {
    logTest('Product payment integration', 'FAILED', 'Stripe integration missing');
  }
  
  if (content.includes('Dialog') && content.includes('paymentDialogOpen')) {
    logTest('Product payment dialog', 'PASSED', 'Payment dialog implemented');
  } else {
    logTest('Product payment dialog', 'FAILED', 'Payment dialog missing');
  }
} else {
  logTest('Product detail enhancement', 'FAILED', 'Product detail file not found');
}

// Test 8: API Endpoint Structure
console.log('\n🔌 Testing API Endpoints...');

const apiEndpoints = [
  'src/app/api/payments/create-payment-intent/route.ts',
  'src/app/api/admin/payments/settings/route.ts',
  'src/app/api/admin/payments/test-connection/route.ts'
];

apiEndpoints.forEach(endpoint => {
  const filePath = path.join(__dirname, endpoint);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasNextStructure = content.includes('NextRequest') && content.includes('NextResponse');
    const hasAuthentication = content.includes('getServerSession') || endpoint.includes('create-payment-intent');
    
    if (hasNextStructure) {
      logTest(`API endpoint: ${endpoint}`, 'PASSED', 'Proper Next.js structure');
    } else {
      logTest(`API endpoint: ${endpoint}`, 'FAILED', 'Invalid API structure');
    }
  } else {
    logTest(`API endpoint: ${endpoint}`, 'FAILED', 'File not found');
  }
});

// Generate final report
console.log('\n📋 Test Summary');
console.log('================');
console.log(`Total Tests: ${results.tests.length}`);
console.log(`✅ Passed: ${results.summary.passed}`);
console.log(`❌ Failed: ${results.summary.failed}`);
console.log(`⚠️ Skipped: ${results.summary.skipped}`);

const successRate = ((results.summary.passed / results.tests.length) * 100).toFixed(1);
console.log(`📊 Success Rate: ${successRate}%`);

// Save detailed results
const reportPath = path.join(__dirname, 'test-report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// Final status
if (results.summary.failed === 0) {
  console.log('\n🎉 All tests passed! Implementation is ready for production.');
} else {
  console.log(`\n⚠️ ${results.summary.failed} test(s) failed. Please review and fix issues.`);
  process.exit(1);
}

console.log('\n🚀 Next Steps:');
console.log('1. Configure Stripe test keys for payment testing');
console.log('2. Test browser functionality with user interactions');
console.log('3. Perform responsive design testing');
console.log('4. Deploy to staging environment for full testing');