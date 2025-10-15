const http = require('http');
const https = require('https');

// 测试配置
const BASE_URL = 'http://localhost:3004';
const TEST_RESULTS = [];

// 功能测试数据
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

const TEST_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123'
};

const TEST_CONTACT = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Inquiry',
  message: 'This is a test message from the automated testing system.'
};

const TEST_QUOTE = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  company: 'Test Company',
  phone: '+1234567890',
  productInterest: 'Industrial Machinery',
  quantity: '10',
  message: 'Interested in bulk purchase'
};

// HTTP请求函数
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'Test-Agent/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...headers
      }
    };

    if (data) {
      if (typeof data === 'string') {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(data);
      } else {
        // Form data
        const formData = new URLSearchParams(data).toString();
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.headers['Content-Length'] = Buffer.byteLength(formData);
        data = formData;
      }
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          url: url
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

// 测试联系表单
async function testContactForm() {
  console.log('🔍 测试联系表单功能...');
  
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/contact`,
      'POST',
      JSON.stringify(TEST_CONTACT)
    );
    
    const result = {
      name: '联系表单提交',
      statusCode: response.statusCode,
      success: response.statusCode >= 200 && response.statusCode < 500,
      response: response.body,
      timestamp: new Date().toISOString()
    };
    
    TEST_RESULTS.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} 联系表单: ${result.statusCode}`);
    
    return result;
  } catch (error) {
    const result = {
      name: '联系表单提交',
      statusCode: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    TEST_RESULTS.push(result);
    console.log(`  ❌ 联系表单错误: ${error.message}`);
    return result;
  }
}

// 测试报价表单
async function testQuoteForm() {
  console.log('🔍 测试报价表单功能...');
  
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/quote`,
      'POST',
      JSON.stringify(TEST_QUOTE)
    );
    
    const result = {
      name: '报价表单提交',
      statusCode: response.statusCode,
      success: response.statusCode >= 200 && response.statusCode < 500,
      response: response.body,
      timestamp: new Date().toISOString()
    };
    
    TEST_RESULTS.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} 报价表单: ${result.statusCode}`);
    
    return result;
  } catch (error) {
    const result = {
      name: '报价表单提交',
      statusCode: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    TEST_RESULTS.push(result);
    console.log(`  ❌ 报价表单错误: ${error.message}`);
    return result;
  }
}

// 测试用户注册
async function testUserRegistration() {
  console.log('🔍 测试用户注册功能...');
  
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/auth/register`,
      'POST',
      JSON.stringify(TEST_USER)
    );
    
    const result = {
      name: '用户注册',
      statusCode: response.statusCode,
      success: response.statusCode >= 200 && response.statusCode < 500,
      response: response.body,
      timestamp: new Date().toISOString()
    };
    
    TEST_RESULTS.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} 用户注册: ${result.statusCode}`);
    
    return result;
  } catch (error) {
    const result = {
      name: '用户注册',
      statusCode: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    TEST_RESULTS.push(result);
    console.log(`  ❌ 用户注册错误: ${error.message}`);
    return result;
  }
}

// 测试管理员API端点
async function testAdminAPIs() {
  console.log('🔍 测试管理员API端点...');
  
  const adminEndpoints = [
    { path: '/api/admin/products', name: '管理员产品API' },
    { path: '/api/admin/blogs', name: '管理员博客API' },
    { path: '/api/admin/users', name: '管理员用户API' },
    { path: '/api/admin/orders', name: '管理员订单API' },
    { path: '/api/admin/analytics', name: '管理员分析API' },
    { path: '/api/admin/settings', name: '管理员设置API' },
  ];
  
  for (const endpoint of adminEndpoints) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint.path}`);
      
      const result = {
        name: endpoint.name,
        path: endpoint.path,
        statusCode: response.statusCode,
        success: response.statusCode >= 200 && response.statusCode < 500,
        requiresAuth: response.statusCode === 401 || response.statusCode === 403,
        timestamp: new Date().toISOString()
      };
      
      TEST_RESULTS.push(result);
      
      const status = result.success ? '✅' : '❌';
      const authStatus = result.requiresAuth ? '🔒' : '🔓';
      console.log(`  ${status} ${authStatus} ${endpoint.name}: ${result.statusCode}`);
      
    } catch (error) {
      const result = {
        name: endpoint.name,
        path: endpoint.path,
        statusCode: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      TEST_RESULTS.push(result);
      console.log(`  ❌ ${endpoint.name}错误: ${error.message}`);
    }
  }
}

// 测试产品详情页面
async function testProductDetails() {
  console.log('🔍 测试产品详情页面...');
  
  const productIds = ['1', '2', 'nonexistent'];
  
  for (const id of productIds) {
    try {
      const response = await makeRequest(`${BASE_URL}/product/${id}`);
      
      const result = {
        name: `产品详情页面 (ID: ${id})`,
        path: `/product/${id}`,
        statusCode: response.statusCode,
        success: response.statusCode >= 200 && response.statusCode < 500,
        contentLength: response.body.length,
        timestamp: new Date().toISOString()
      };
      
      TEST_RESULTS.push(result);
      
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} 产品 ${id}: ${result.statusCode} - ${result.contentLength} bytes`);
      
    } catch (error) {
      const result = {
        name: `产品详情页面 (ID: ${id})`,
        path: `/product/${id}`,
        statusCode: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      TEST_RESULTS.push(result);
      console.log(`  ❌ 产品 ${id} 错误: ${error.message}`);
    }
  }
}

// 测试博客详情页面
async function testBlogDetails() {
  console.log('🔍 测试博客详情页面...');
  
  const blogSlugs = ['future-b2b-manufacturing-technology', 'supply-chain-optimization-strategies', 'nonexistent-post'];
  
  for (const slug of blogSlugs) {
    try {
      const response = await makeRequest(`${BASE_URL}/blog/${slug}`);
      
      const result = {
        name: `博客详情页面 (Slug: ${slug})`,
        path: `/blog/${slug}`,
        statusCode: response.statusCode,
        success: response.statusCode >= 200 && response.statusCode < 500,
        contentLength: response.body.length,
        timestamp: new Date().toISOString()
      };
      
      TEST_RESULTS.push(result);
      
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} 博客 ${slug}: ${result.statusCode} - ${result.contentLength} bytes`);
      
    } catch (error) {
      const result = {
        name: `博客详情页面 (Slug: ${slug})`,
        path: `/blog/${slug}`,
        statusCode: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      TEST_RESULTS.push(result);
      console.log(`  ❌ 博客 ${slug} 错误: ${error.message}`);
    }
  }
}

// 测试支付流程
async function testPaymentFlow() {
  console.log('🔍 测试支付流程...');
  
  const paymentEndpoints = [
    { path: '/api/create-payment-intent', method: 'POST', name: '创建支付意图' },
    { path: '/api/webhooks/stripe', method: 'POST', name: 'Stripe Webhook' },
  ];
  
  for (const endpoint of paymentEndpoints) {
    try {
      const testData = endpoint.path.includes('payment-intent') 
        ? JSON.stringify({ amount: 1000, currency: 'usd' })
        : JSON.stringify({ type: 'test' });
        
      const response = await makeRequest(
        `${BASE_URL}${endpoint.path}`,
        endpoint.method,
        testData
      );
      
      const result = {
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        statusCode: response.statusCode,
        success: response.statusCode >= 200 && response.statusCode < 500,
        timestamp: new Date().toISOString()
      };
      
      TEST_RESULTS.push(result);
      
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${endpoint.name}: ${result.statusCode}`);
      
    } catch (error) {
      const result = {
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        statusCode: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      TEST_RESULTS.push(result);
      console.log(`  ❌ ${endpoint.name} 错误: ${error.message}`);
    }
  }
}

// 主测试函数
async function runFunctionalityTests() {
  console.log('🚀 开始功能测试...\n');
  
  // 测试表单功能
  await testContactForm();
  await testQuoteForm();
  
  // 测试用户认证
  await testUserRegistration();
  
  // 测试管理员API
  await testAdminAPIs();
  
  // 测试详情页面
  await testProductDetails();
  await testBlogDetails();
  
  // 测试支付流程
  await testPaymentFlow();
  
  // 生成测试报告
  console.log('\n📊 功能测试报告:');
  console.log('='.repeat(50));
  
  const totalTests = TEST_RESULTS.length;
  const successfulTests = TEST_RESULTS.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  
  console.log(`总测试数: ${totalTests}`);
  console.log(`成功: ${successfulTests} ✅`);
  console.log(`失败: ${failedTests} ❌`);
  console.log(`成功率: ${((successfulTests / totalTests) * 100).toFixed(2)}%`);
  
  console.log('\n失败的测试:');
  const failures = TEST_RESULTS.filter(r => !r.success);
  if (failures.length === 0) {
    console.log('无失败测试 🎉');
  } else {
    failures.forEach(failure => {
      console.log(`❌ ${failure.name}: ${failure.error || failure.statusCode}`);
    });
  }
  
  console.log('\n需要认证的端点:');
  const authRequired = TEST_RESULTS.filter(r => r.requiresAuth);
  if (authRequired.length === 0) {
    console.log('无需要认证的端点 (可能需要检查安全性)');
  } else {
    authRequired.forEach(endpoint => {
      console.log(`🔒 ${endpoint.name}: ${endpoint.statusCode}`);
    });
  }
  
  // 保存详细报告
  const report = {
    summary: {
      total: totalTests,
      successful: successfulTests,
      failed: failedTests,
      successRate: ((successfulTests / totalTests) * 100).toFixed(2),
      authRequired: authRequired.length
    },
    results: TEST_RESULTS,
    timestamp: new Date().toISOString()
  };
  
  require('fs').writeFileSync('functionality-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📝 详细报告已保存到 functionality-test-report.json');
}

// 运行测试
runFunctionalityTests().catch(console.error);