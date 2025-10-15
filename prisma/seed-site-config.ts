import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSiteConfig() {
  console.log('🌐 Creating default site configuration...');

  // 创建默认网站配置
  const existingConfig = await prisma.siteConfig.findFirst();
  
  if (!existingConfig) {
    await prisma.siteConfig.create({
      data: {
      siteName: 'B2C Business',
      siteDescription: 'Leading provider of high-quality consumer products. Connecting customers worldwide with reliable solutions.',
      logo: '/images/logo.png',
      favicon: '/favicon.ico',
      heroTitle: 'Your Gateway to Quality Products',
      heroSubtitle: 'Discover premium consumer products with reliable quality and exceptional service',
      heroImage: '/images/hero-bg.jpg',
      heroButtonText: 'Explore Products',
      heroButtonLink: '/product',
      navigationItems: [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/product' },
        { name: 'Blog', href: '/blog' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' }
      ],
      companyName: 'B2C Business Ltd.',
      companyAddress: '123 Business Street, Commerce City, CC 12345',
      companyPhone: '+1 (555) 123-4567',
      companyEmail: 'info@b2cbusiness.com',
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com/b2cbusiness' },
        { platform: 'twitter', url: 'https://twitter.com/b2cbusiness' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/b2cbusiness' },
        { platform: 'instagram', url: 'https://instagram.com/b2cbusiness' }
      ],
      footerText: '© 2025 B2C Business. All rights reserved.'
      }
    });
  }

  console.log('✅ Site configuration created successfully!');
}

export { seedSiteConfig };

if (require.main === module) {
  seedSiteConfig()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
