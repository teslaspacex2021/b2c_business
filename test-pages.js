const http = require('http');
const https = require('https');

// 测试配置
const BASE_URL = 'http://localhost:3004';
const TEST_RESULTS = [];

// 测试页面列表
const PAGES_TO_TEST = [
  { path: '/', name: '首页' },
  { path: '/about', name: '关于页面' },
  { path: '/contact', name: '联系页面' },
  { path: '/product', name: '产品页面' },
  { path: '/blog', name: '博客页面' },
  { path: '/login', name: '登录页面' },
  { path: '/register', name: '注册页面' },
  { path: '/admin-login', name: '管理员登录页面' },
  { path: '/dashboard', name: '用户仪表板' },
  { path: '/profile', name: '用户资料页面' },
  { path: '/quote', name: '报价页面' },
  { path: '/payment/success', name: '支付成功页面' },
  { path: '/payment/cancel', name: '支付取消页面' },
];

// API端点测试
const API_ENDPOINTS = [
  { path: '/api/auth/signin', method: 'GET', name: 'NextAuth登录API' },
  { path: '/api/products', method: 'GET', name: '产品API' },
  { path: '/api/blogs', method: 'GET', name: '博客API' },
  { path: '/api/contact', method: 'POST', name: '联系表单API', body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    message: 'Test message'
  }) },
];

// 管理后台页面
const ADMIN_PAGES = [
  { path: '/admin', name: '管理后台首页' },
  { path: '/admin/dashboard', name: '管理仪表板' },
  { path: '/admin/products', name: '产品管理' },
  { path: '/admin/blogs', name: '博客管理' },
  { path: '/admin/users', name: '用户管理' },
  { path: '/admin/orders', name: '订单管理' },
  { path: '/admin/analytics', name: '数据分析' },
  { path: '/admin/settings', name: '系统设置' },
  { path: '/admin/support', name: '客户支持' },
];

// HTTP请求函数
function makeRequest(url, method = 'GET', data = null) {
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
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
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

    if (data) {
      req.write(data);
    }

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// 测试单个页面
async function testPage(page) {
  try {
    console.log(`测试 ${page.name} (${page.path})...`);
    const response = await makeRequest(`${BASE_URL}${page.path}`);
    
    const result = {
      name: page.name,
      path: page.path,
      statusCode: response.statusCode,
      success: response.statusCode >= 200 && response.statusCode < 400,
      contentLength: response.body.length,
      hasError: response.body.includes('Error') || response.body.includes('error'),
      hasContent: response.body.length > 100,
      timestamp: new Date().toISOString()
    };

    // 检查特定内容
    if (page.path === '/') {
      result.hasTitle = response.body.includes('<title>') || response.body.includes('B2B Business');
      result.hasNavigation = response.body.includes('nav') || response.body.includes('menu');
    }

    if (page.path.includes('/admin')) {
      result.requiresAuth = response.statusCode === 401 || response.statusCode === 403;
      result.hasAdminContent = response.body.includes('admin') || response.body.includes('dashboard');
    }

    TEST_RESULTS.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} ${result.statusCode} - ${result.contentLength} bytes`);
    
    return result;
  } catch (error) {
    const result = {
      name: page.name,
      path: page.path,
      statusCode: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    TEST_RESULTS.push(result);
    console.log(`  ❌ Error: ${error.message}`);
    return result;
  }
}

// 测试API端点
async function testAPI(endpoint) {
  try {
    console.log(`测试API ${endpoint.name} (${endpoint.method} ${endpoint.path})...`);
    const response = await makeRequest(`${BASE_URL}${endpoint.path}`, endpoint.method, endpoint.body);
    
    const result = {
      name: endpoint.name,
      path: endpoint.path,
      method: endpoint.method,
      statusCode: response.statusCode,
      success: response.statusCode >= 200 && response.statusCode < 500, // API可能返回400+但仍然是正常的
      contentType: response.headers['content-type'],
      timestamp: new Date().toISOString()
    };

    TEST_RESULTS.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} ${result.statusCode} - ${result.contentType}`);
    
    return result;
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
    console.log(`  ❌ Error: ${error.message}`);
    return result;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试B2B Business Platform...\n');
  
  // 测试前端页面
  console.log('📄 测试前端页面...');
  for (const page of PAGES_TO_TEST) {
    await testPage(page);
  }
  
  console.log('\n🔧 测试管理后台页面...');
  for (const page of ADMIN_PAGES) {
    await testPage(page);
  }
  
  console.log('\n🔌 测试API端点...');
  for (const endpoint of API_ENDPOINTS) {
    await testAPI(endpoint);
  }
  
  // 生成测试报告
  console.log('\n📊 测试报告:');
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
      console.log(`❌ ${failure.name} (${failure.path}): ${failure.error || failure.statusCode}`);
    });
  }
  
  // 保存详细报告
  const report = {
    summary: {
      total: totalTests,
      successful: successfulTests,
      failed: failedTests,
      successRate: ((successfulTests / totalTests) * 100).toFixed(2)
    },
    results: TEST_RESULTS,
    timestamp: new Date().toISOString()
  };
  
  require('fs').writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📝 详细报告已保存到 test-report.json');
}

// 运行测试
runTests().catch(console.error);