import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@b2bbusiness.com' },
    update: {},
    create: {
      email: 'admin@b2bbusiness.com',
      name: 'Admin User',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create editor user
  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@b2bbusiness.com' },
    update: {},
    create: {
      email: 'editor@b2bbusiness.com',
      name: 'Editor User',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
      role: 'EDITOR',
      status: 'ACTIVE',
    },
  });

  console.log('👥 Created users:', { adminUser: adminUser.email, editorUser: editorUser.email });

  // Create sample products
  const products = [
    {
      title: 'Industrial LED Lighting System',
      description: 'High-efficiency LED lighting solutions for industrial applications with advanced control systems and energy-saving features.',
      sku: 'LED-IND-001',
      price: 1299.99,
      comparePrice: 1499.99,
      costPrice: 899.99,
      stock: 45,
      lowStockAlert: 10,
      weight: 5.2,
      images: ['/images/products/led-lighting-1.jpg', '/images/products/led-lighting-2.jpg'],
      category: 'electronics',
      subcategory: 'lighting',
      brand: 'IndustrialTech',
      tags: ['LED', 'Industrial', 'Energy Efficient', 'Commercial'],
      specifications: {
        'Power Consumption': '50W',
        'Luminous Flux': '5000lm',
        'Color Temperature': '4000K',
        'IP Rating': 'IP65',
        'Lifespan': '50,000 hours'
      },
      published: true,
      featured: true,
    },
    {
      title: 'CNC Machining Center',
      description: 'Precision CNC machining center for manufacturing operations with high accuracy and reliability.',
      sku: 'CNC-MAC-002',
      price: 89999.99,
      comparePrice: 99999.99,
      costPrice: 75000.00,
      stock: 3,
      lowStockAlert: 1,
      weight: 2500.0,
      images: ['/images/products/cnc-machine-1.jpg', '/images/products/cnc-machine-2.jpg'],
      category: 'machinery',
      subcategory: 'manufacturing',
      brand: 'PrecisionCorp',
      tags: ['CNC', 'Machinery', 'Manufacturing', 'Precision'],
      specifications: {
        'Working Area': '1000x600x500mm',
        'Spindle Speed': '12000 RPM',
        'Tool Capacity': '24 tools',
        'Positioning Accuracy': '±0.005mm',
        'Power': '15kW'
      },
      published: true,
      featured: true,
    },
    {
      title: 'Steel Construction Materials',
      description: 'High-grade steel materials for construction and infrastructure projects with certified quality standards.',
      sku: 'STL-CON-003',
      price: 299.99,
      comparePrice: 349.99,
      costPrice: 199.99,
      stock: 150,
      lowStockAlert: 20,
      weight: 50.0,
      images: ['/images/products/steel-materials-1.jpg', '/images/products/steel-materials-2.jpg'],
      category: 'materials',
      subcategory: 'construction',
      brand: 'SteelWorks',
      tags: ['Steel', 'Construction', 'Infrastructure', 'Materials'],
      specifications: {
        'Grade': 'Q345B',
        'Thickness': '6-50mm',
        'Width': '1500-4020mm',
        'Length': '6000-18000mm',
        'Standard': 'GB/T 1591-2018'
      },
      published: true,
      featured: false,
    },
    {
      title: 'Electronic Control Systems',
      description: 'Advanced electronic control systems for industrial automation with programmable logic controllers.',
      sku: 'ECS-AUTO-004',
      price: 2599.99,
      comparePrice: 2999.99,
      costPrice: 1899.99,
      stock: 12,
      lowStockAlert: 3,
      weight: 8.5,
      images: ['/images/products/control-systems-1.jpg'],
      category: 'electronics',
      subcategory: 'automation',
      brand: 'AutoTech',
      tags: ['Electronics', 'Control', 'Automation', 'Industrial'],
      specifications: {
        'Input Voltage': '24VDC',
        'Digital Inputs': '16',
        'Digital Outputs': '12',
        'Analog Inputs': '8',
        'Communication': 'Ethernet, RS485'
      },
      published: false,
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('📦 Created sample products');

  // Create sample blog posts
  const blogPosts = [
    {
      title: 'Global Trade Trends in 2024: What Businesses Need to Know',
      content: `The global trade landscape is rapidly evolving, driven by technological advancements, changing consumer preferences, and geopolitical shifts. As we navigate through 2024, businesses must stay informed about the key trends shaping international commerce.

## Digital Transformation in Trade

The digitization of trade processes continues to accelerate, with blockchain technology, AI-powered logistics, and automated customs procedures becoming mainstream. Companies that embrace these technologies gain significant competitive advantages in terms of efficiency and cost reduction.

## Sustainability Focus

Environmental consciousness is no longer optional in international trade. Businesses are increasingly required to demonstrate sustainable practices throughout their supply chains, from sourcing to delivery.

## Supply Chain Resilience

The lessons learned from recent global disruptions have led to a fundamental shift towards building more resilient supply chains. Companies are diversifying their supplier base and investing in local sourcing options.`,
      excerpt: 'Explore the key trends shaping international trade in 2024, from digital transformation to sustainable practices.',
      tags: ['global trade', 'trends', '2024', 'business strategy'],
      published: true,
      publishedAt: new Date('2024-01-15'),
      seoTitle: 'Global Trade Trends 2024 - Key Insights for International Business',
      seoDescription: 'Discover the latest global trade trends in 2024. Learn about digital transformation, sustainability, and supply chain resilience in international commerce.',
      authorId: adminUser.id,
    },
    {
      title: 'The Rise of Sustainable Manufacturing in B2B Trade',
      content: `Sustainability has become a critical factor in B2B purchasing decisions, fundamentally changing how manufacturers approach production and supply chain management.

## The Business Case for Sustainability

Companies are discovering that sustainable practices not only benefit the environment but also drive cost savings, improve brand reputation, and open new market opportunities.

## Key Areas of Focus

- Energy efficiency in production processes
- Waste reduction and circular economy principles
- Sustainable sourcing of raw materials
- Carbon footprint reduction across the supply chain

## Implementation Strategies

Successful companies are taking a systematic approach to sustainability, setting measurable goals and investing in green technologies.`,
      excerpt: 'How sustainability is becoming a key factor in B2B purchasing decisions and what it means for manufacturers.',
      tags: ['sustainability', 'manufacturing', 'B2B', 'environment'],
      published: true,
      publishedAt: new Date('2024-01-10'),
      seoTitle: 'Sustainable Manufacturing in B2B Trade - Environmental Business Practices',
      seoDescription: 'Learn how sustainable manufacturing is transforming B2B trade. Discover strategies for implementing green practices in your business.',
      authorId: editorUser.id,
    },
    {
      title: 'Digital Transformation in International Logistics',
      content: `The logistics industry is undergoing a digital revolution that is transforming how goods move across borders and through supply chains.

## Technology Drivers

- IoT sensors for real-time tracking
- AI and machine learning for route optimization
- Blockchain for transparent documentation
- Automated warehousing systems

## Benefits for Businesses

Digital transformation in logistics offers numerous advantages including improved visibility, reduced costs, faster delivery times, and enhanced customer satisfaction.

## Implementation Challenges

While the benefits are clear, companies face challenges in technology adoption, including integration complexity, cost considerations, and workforce training requirements.`,
      excerpt: 'Discover how digital technologies are revolutionizing supply chain management and logistics operations.',
      tags: ['digital transformation', 'logistics', 'supply chain', 'technology'],
      published: false,
      authorId: adminUser.id,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: post,
    });
  }

  console.log('📝 Created sample blog posts');

  // Create sample contact submissions
  const contacts = [
    {
      name: 'John Smith',
      email: 'john.smith@company.com',
      company: 'ABC Manufacturing',
      subject: 'Product Inquiry',
      message: 'I am interested in your CNC machining center. Could you please provide more details about pricing and availability?',
      status: 'PENDING',
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah@tradecorp.com',
      company: 'Trade Corp',
      subject: 'Partnership Opportunity',
      message: 'We are looking for reliable suppliers for our international projects. Would like to discuss potential partnership opportunities.',
      status: 'REVIEWED',
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.create({
      data: contact,
    });
  }

  console.log('📧 Created sample contact submissions');

  console.log('✅ Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
