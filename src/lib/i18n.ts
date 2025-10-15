// 简单的国际化系统
export type Language = 'en' | 'zh';

export interface Translations {
  [key: string]: string | Translations;
}

// 英文翻译
export const enTranslations: Translations = {
  common: {
    home: 'Home',
    products: 'Products',
    blog: 'Blog',
    about: 'About Us',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    search: 'Search',
    cart: 'Cart',
    notifications: 'Notifications',
    language: 'Language',
    getQuote: 'Get Quote',
    learnMore: 'Learn More',
    viewAll: 'View All',
    readMore: 'Read More',
    subscribe: 'Subscribe',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  header: {
    searchPlaceholder: 'Search products, blogs...',
    account: 'Account',
    myProfile: 'My Profile',
    myOrders: 'My Orders',
  },
  footer: {
    stayUpdated: 'Stay Updated',
    newsletterDescription: 'Subscribe to our newsletter for the latest industry insights and updates.',
    emailPlaceholder: 'Enter your email',
    quickLinks: 'Quick Links',
    productCategories: 'Product Categories',
    contactInformation: 'Contact Information',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    sitemap: 'Sitemap',
    allRightsReserved: '© 2025 B2B Business. All rights reserved.',
  },
  home: {
    heroTitle: 'International Trade Solutions',
    heroSubtitle: 'Discover high-quality products for international trade. Connect with reliable suppliers and expand your business globally.',
    whyChooseUs: 'Why Choose Us',
    comprehensiveSolutions: 'Comprehensive Solutions for Global Trade',
    solutionsDescription: 'We provide end-to-end solutions for your international trade needs with unmatched quality and service',
    qualityAssurance: 'Quality Assurance',
    qualityDescription: 'All products undergo rigorous quality control to meet international standards and certifications',
    fastDelivery: 'Fast Delivery',
    deliveryDescription: 'Efficient logistics network ensuring timely delivery worldwide with real-time tracking',
    support247: '24/7 Support',
    supportDescription: 'Dedicated customer support team available around the clock in multiple languages',
    featuredProducts: 'Featured Products',
    discoverCategories: 'Discover Our Product Categories',
    categoriesDescription: 'Explore our comprehensive range of high-quality products designed for international trade',
    electronics: 'Electronics',
    electronicsDescription: 'High-tech electronic components and devices for various industries',
    machinery: 'Machinery',
    machineryDescription: 'Industrial machinery and equipment for manufacturing processes',
    materials: 'Materials',
    materialsDescription: 'Raw materials and components for construction and manufacturing',
    viewProducts: 'View Products',
    latestInsights: 'Latest Insights',
    industryNews: 'Industry News & Updates',
    newsDescription: 'Stay informed with the latest trends, insights, and news in international trade and business',
    noBlogPosts: 'No Blog Posts Yet',
    blogPlaceholder: 'Stay tuned for the latest industry insights and updates.',
    viewAllArticles: 'View All Articles',
    readyToStart: '🚀 Ready to Get Started?',
    expandBusiness: 'Ready to Expand Your Business Globally?',
    expandDescription: 'Join thousands of successful businesses who trust us for their international trade needs. Get your personalized quote today.',
    getFreeQuote: 'Get Free Quote',
  },
  newsletter: {
    stayUpdated: 'Stay Updated',
    neverMissUpdate: 'Never Miss an Update',
    subscribeDescription: 'Subscribe to our newsletter for the latest industry insights and updates.',
    blogDescription: 'Get the latest industry insights, trade news, and business tips delivered straight to your inbox.',
    nameOptional: 'Name (Optional)',
    emailRequired: 'Email Address *',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'Enter your email',
    subscribeButton: 'Subscribe to Newsletter',
    subscribing: 'Subscribing...',
    privacyNote: 'We respect your privacy. Unsubscribe at any time.',
  },
};

// 中文翻译
export const zhTranslations: Translations = {
  common: {
    home: '首页',
    products: '产品',
    blog: '博客',
    about: '关于我们',
    contact: '联系我们',
    login: '登录',
    register: '注册',
    logout: '退出',
    search: '搜索',
    cart: '购物车',
    notifications: '通知',
    language: '语言',
    getQuote: '获取报价',
    learnMore: '了解更多',
    viewAll: '查看全部',
    readMore: '阅读更多',
    subscribe: '订阅',
    loading: '加载中...',
    error: '错误',
    success: '成功',
  },
  header: {
    searchPlaceholder: '搜索产品、博客...',
    account: '账户',
    myProfile: '我的资料',
    myOrders: '我的订单',
  },
  footer: {
    stayUpdated: '保持更新',
    newsletterDescription: '订阅我们的新闻通讯，获取最新的行业见解和更新。',
    emailPlaceholder: '输入您的邮箱',
    quickLinks: '快速链接',
    productCategories: '产品分类',
    contactInformation: '联系信息',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款',
    sitemap: '网站地图',
    allRightsReserved: '© 2025 B2B商务平台。保留所有权利。',
  },
  home: {
    heroTitle: '国际贸易解决方案',
    heroSubtitle: '发现高质量的国际贸易产品。与可靠的供应商建立联系，拓展您的全球业务。',
    whyChooseUs: '为什么选择我们',
    comprehensiveSolutions: '全球贸易的综合解决方案',
    solutionsDescription: '我们为您的国际贸易需求提供端到端的解决方案，质量和服务无与伦比',
    qualityAssurance: '质量保证',
    qualityDescription: '所有产品都经过严格的质量控制，符合国际标准和认证',
    fastDelivery: '快速交付',
    deliveryDescription: '高效的物流网络确保全球范围内的及时交付，并提供实时跟踪',
    support247: '24/7支持',
    supportDescription: '专业的客户支持团队全天候为您服务，支持多种语言',
    featuredProducts: '精选产品',
    discoverCategories: '探索我们的产品分类',
    categoriesDescription: '探索我们为国际贸易设计的全面高质量产品系列',
    electronics: '电子产品',
    electronicsDescription: '适用于各种行业的高科技电子元件和设备',
    machinery: '机械设备',
    machineryDescription: '用于制造过程的工业机械和设备',
    materials: '原材料',
    materialsDescription: '用于建筑和制造的原材料和组件',
    viewProducts: '查看产品',
    latestInsights: '最新见解',
    industryNews: '行业新闻与动态',
    newsDescription: '了解国际贸易和商业领域的最新趋势、见解和新闻',
    noBlogPosts: '暂无博客文章',
    blogPlaceholder: '敬请关注最新的行业见解和更新。',
    viewAllArticles: '查看所有文章',
    readyToStart: '🚀 准备开始了吗？',
    expandBusiness: '准备将您的业务拓展到全球吗？',
    expandDescription: '加入数千家信任我们国际贸易需求的成功企业。立即获取您的个性化报价。',
    getFreeQuote: '获取免费报价',
  },
  newsletter: {
    stayUpdated: '保持更新',
    neverMissUpdate: '不错过任何更新',
    subscribeDescription: '订阅我们的新闻通讯，获取最新的行业见解和更新。',
    blogDescription: '获取最新的行业见解、贸易新闻和商业技巧，直接发送到您的收件箱。',
    nameOptional: '姓名（可选）',
    emailRequired: '邮箱地址 *',
    namePlaceholder: '您的姓名',
    emailPlaceholder: '输入您的邮箱',
    subscribeButton: '订阅新闻通讯',
    subscribing: '订阅中...',
    privacyNote: '我们尊重您的隐私。您可以随时取消订阅。',
  },
};

// 获取翻译文本的函数
export function getTranslation(
  translations: Translations,
  key: string,
  fallback?: string
): string {
  const keys = key.split('.');
  let current: any = translations;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return fallback || key;
    }
  }

  return typeof current === 'string' ? current : fallback || key;
}

// 语言配置
export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
] as const;

export const defaultLanguage: Language = 'en';

// 获取当前语言的翻译
export function getTranslations(language: Language): Translations {
  return language === 'zh' ? zhTranslations : enTranslations;
}

// 翻译函数
export function t(language: Language, key: string, fallback?: string): string {
  const translations = getTranslations(language);
  return getTranslation(translations, key, fallback);
}
