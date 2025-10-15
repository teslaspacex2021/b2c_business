import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleBlogPosts = [
  {
    title: 'The Future of B2B Commerce: Digital Transformation Trends',
    slug: 'future-b2b-commerce-digital-transformation',
    excerpt: 'Explore the latest trends in digital transformation that are reshaping the B2B commerce landscape and how businesses can adapt to stay competitive.',
    content: `
      <h2>Introduction</h2>
      <p>The B2B commerce landscape is undergoing a dramatic transformation, driven by technological advancements and changing buyer expectations. In this comprehensive guide, we'll explore the key trends shaping the future of B2B commerce and provide actionable insights for businesses looking to thrive in this digital-first world.</p>
      
      <h2>Key Digital Transformation Trends</h2>
      <h3>1. AI-Powered Personalization</h3>
      <p>Artificial intelligence is revolutionizing how B2B companies interact with their customers. From personalized product recommendations to predictive analytics, AI is enabling more targeted and effective customer experiences.</p>
      
      <h3>2. Mobile-First Approach</h3>
      <p>With decision-makers increasingly using mobile devices for business purchases, companies must prioritize mobile-optimized experiences. This includes responsive design, mobile apps, and streamlined checkout processes.</p>
      
      <h3>3. Integration and Automation</h3>
      <p>Modern B2B buyers expect seamless integration between different systems and automated processes that reduce friction in the buying journey.</p>
      
      <h2>Implementation Strategies</h2>
      <p>To successfully navigate digital transformation, businesses should focus on:</p>
      <ul>
        <li>Customer-centric design</li>
        <li>Data-driven decision making</li>
        <li>Agile implementation approaches</li>
        <li>Continuous optimization</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>The future of B2B commerce belongs to organizations that can adapt quickly to changing market conditions while maintaining a focus on customer value. By embracing these digital transformation trends, businesses can position themselves for long-term success.</p>
    `,
    featuredImage: '/images/blog/digital-transformation.jpg',
    imageAlt: 'Digital transformation concept with connected devices and data flows',
    category: 'technology',
    tags: ['digital transformation', 'B2B commerce', 'AI', 'mobile', 'automation'],
    published: true,
    featured: true,
    seoTitle: 'B2B Digital Transformation Trends 2025 | Future of Commerce',
    seoDescription: 'Discover key digital transformation trends reshaping B2B commerce. Learn how AI, mobile-first approaches, and automation are driving business success.',
    metaKeywords: ['B2B digital transformation', 'commerce trends', 'business technology', 'AI personalization'],
    views: 1250,
    likes: 89,
    shares: 34,
    allowComments: true,
    readingTime: 8,
  },
  {
    title: 'Supply Chain Optimization: Best Practices for Manufacturing',
    slug: 'supply-chain-optimization-manufacturing-best-practices',
    excerpt: 'Learn proven strategies for optimizing your manufacturing supply chain, reducing costs, and improving efficiency in today\'s complex global market.',
    content: `
      <h2>The Challenge of Modern Supply Chains</h2>
      <p>Manufacturing companies face unprecedented challenges in managing complex, global supply chains. From raw material sourcing to final product delivery, every step must be optimized for efficiency, cost-effectiveness, and resilience.</p>
      
      <h2>Key Optimization Strategies</h2>
      <h3>Supplier Relationship Management</h3>
      <p>Building strong partnerships with suppliers is crucial for supply chain success. This includes:</p>
      <ul>
        <li>Regular performance reviews</li>
        <li>Collaborative planning sessions</li>
        <li>Risk assessment and mitigation</li>
        <li>Technology integration</li>
      </ul>
      
      <h3>Inventory Management</h3>
      <p>Effective inventory management balances the need to meet customer demand while minimizing carrying costs. Modern approaches include just-in-time delivery, demand forecasting, and safety stock optimization.</p>
      
      <h3>Technology Integration</h3>
      <p>Digital technologies are transforming supply chain management through:</p>
      <ul>
        <li>IoT sensors for real-time tracking</li>
        <li>AI for demand prediction</li>
        <li>Blockchain for transparency</li>
        <li>Cloud platforms for collaboration</li>
      </ul>
      
      <h2>Measuring Success</h2>
      <p>Key performance indicators for supply chain optimization include on-time delivery rates, inventory turnover, cost per unit, and supplier performance metrics.</p>
    `,
    featuredImage: '/images/blog/supply-chain.jpg',
    imageAlt: 'Modern warehouse with automated systems and logistics management',
    category: 'business',
    tags: ['supply chain', 'manufacturing', 'optimization', 'logistics', 'efficiency'],
    published: true,
    featured: false,
    seoTitle: 'Supply Chain Optimization Guide for Manufacturing Companies',
    seoDescription: 'Comprehensive guide to supply chain optimization for manufacturers. Learn best practices for supplier management, inventory control, and technology integration.',
    metaKeywords: ['supply chain optimization', 'manufacturing efficiency', 'logistics management', 'supplier relationships'],
    views: 890,
    likes: 67,
    shares: 23,
    allowComments: true,
    readingTime: 6,
  },
  {
    title: 'Sustainable Manufacturing: Environmental Responsibility Meets Profitability',
    slug: 'sustainable-manufacturing-environmental-responsibility-profitability',
    excerpt: 'Discover how sustainable manufacturing practices can reduce environmental impact while improving your bottom line through efficiency gains and cost savings.',
    content: `
      <h2>The Business Case for Sustainability</h2>
      <p>Sustainable manufacturing is no longer just about environmental responsibility—it's a strategic business imperative that can drive significant cost savings and competitive advantages.</p>
      
      <h2>Key Sustainable Practices</h2>
      <h3>Energy Efficiency</h3>
      <p>Implementing energy-efficient technologies and processes can dramatically reduce operational costs while minimizing environmental impact.</p>
      
      <h3>Waste Reduction</h3>
      <p>Lean manufacturing principles help eliminate waste in all forms, from material waste to time waste, improving both sustainability and profitability.</p>
      
      <h3>Circular Economy Principles</h3>
      <p>Adopting circular economy principles involves designing products for reuse, recycling, and minimal waste generation throughout their lifecycle.</p>
      
      <h2>Implementation Roadmap</h2>
      <p>Successfully implementing sustainable manufacturing requires a systematic approach including assessment, planning, implementation, and continuous improvement.</p>
    `,
    featuredImage: '/images/blog/sustainable-manufacturing.jpg',
    imageAlt: 'Green manufacturing facility with solar panels and eco-friendly processes',
    category: 'industry news',
    tags: ['sustainability', 'manufacturing', 'environment', 'cost savings', 'efficiency'],
    published: true,
    featured: false,
    seoTitle: 'Sustainable Manufacturing Practices | Environmental & Economic Benefits',
    seoDescription: 'Learn how sustainable manufacturing practices reduce environmental impact while boosting profitability through energy efficiency and waste reduction.',
    metaKeywords: ['sustainable manufacturing', 'green manufacturing', 'environmental responsibility', 'cost reduction'],
    views: 634,
    likes: 45,
    shares: 18,
    allowComments: true,
    readingTime: 5,
  },
  {
    title: 'Industrial IoT: Connecting Your Factory for Smart Manufacturing',
    slug: 'industrial-iot-smart-manufacturing-factory-connectivity',
    excerpt: 'Explore how Industrial IoT is revolutionizing manufacturing through real-time data collection, predictive maintenance, and automated process optimization.',
    content: `
      <h2>What is Industrial IoT?</h2>
      <p>Industrial Internet of Things (IIoT) refers to the network of connected devices, sensors, and systems in manufacturing environments that collect and exchange data to optimize operations.</p>
      
      <h2>Key IIoT Applications</h2>
      <h3>Predictive Maintenance</h3>
      <p>IoT sensors monitor equipment health in real-time, predicting failures before they occur and reducing unplanned downtime.</p>
      
      <h3>Quality Control</h3>
      <p>Automated quality monitoring systems use sensors and AI to detect defects early in the production process.</p>
      
      <h3>Asset Tracking</h3>
      <p>Real-time location and condition monitoring of assets throughout the manufacturing facility improves efficiency and reduces losses.</p>
      
      <h2>Implementation Considerations</h2>
      <p>Successful IIoT implementation requires careful planning around security, scalability, and integration with existing systems.</p>
    `,
    featuredImage: '/images/blog/industrial-iot.jpg',
    imageAlt: 'Smart factory with connected machines and IoT sensors displaying data',
    category: 'technology',
    tags: ['IoT', 'smart manufacturing', 'Industry 4.0', 'predictive maintenance', 'automation'],
    published: false,
    featured: false,
    seoTitle: 'Industrial IoT Guide: Smart Manufacturing & Connected Factories',
    seoDescription: 'Complete guide to Industrial IoT implementation for smart manufacturing. Learn about predictive maintenance, quality control, and asset tracking.',
    metaKeywords: ['Industrial IoT', 'smart manufacturing', 'Industry 4.0', 'connected factory'],
    views: 0,
    likes: 0,
    shares: 0,
    allowComments: true,
    readingTime: 7,
  },
  {
    title: 'Global Trade Regulations: Navigating International Commerce',
    slug: 'global-trade-regulations-international-commerce-navigation',
    excerpt: 'Stay compliant and competitive in international markets with our comprehensive guide to global trade regulations, tariffs, and documentation requirements.',
    content: `
      <h2>The Complexity of Global Trade</h2>
      <p>International trade involves navigating a complex web of regulations, tariffs, and documentation requirements that vary by country and product category.</p>
      
      <h2>Key Regulatory Areas</h2>
      <h3>Import/Export Documentation</h3>
      <p>Proper documentation is essential for smooth customs clearance and compliance with international trade laws.</p>
      
      <h3>Tariffs and Duties</h3>
      <p>Understanding tariff classifications and duty rates helps businesses price products competitively while maintaining profitability.</p>
      
      <h3>Product Standards and Certifications</h3>
      <p>Different markets have varying product standards and certification requirements that must be met for legal market entry.</p>
      
      <h2>Best Practices</h2>
      <p>Successful international trade requires staying informed about regulatory changes, maintaining accurate records, and working with experienced trade professionals.</p>
    `,
    featuredImage: '/images/blog/global-trade.jpg',
    imageAlt: 'World map showing international trade routes and shipping connections',
    category: 'business',
    tags: ['international trade', 'regulations', 'compliance', 'export', 'import'],
    published: true,
    featured: false,
    seoTitle: 'Global Trade Regulations Guide | International Commerce Compliance',
    seoDescription: 'Navigate international trade regulations with confidence. Learn about documentation, tariffs, and compliance requirements for global commerce.',
    metaKeywords: ['global trade regulations', 'international commerce', 'export compliance', 'import regulations'],
    views: 445,
    likes: 28,
    shares: 12,
    allowComments: true,
    readingTime: 9,
  }
];

async function seedBlogs() {
  console.log('Seeding blog posts...');

  try {
    // Find the admin user to assign as author
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@b2bbusiness.com' }
    });

    if (!adminUser) {
      console.error('Admin user not found. Please run user seeding first.');
      return;
    }

    // Clear existing blog posts
    await prisma.blogPost.deleteMany();

    // Create new blog posts
    for (const postData of sampleBlogPosts) {
      await prisma.blogPost.create({
        data: {
          ...postData,
          authorId: adminUser.id,
          publishedAt: postData.published ? new Date() : null,
        },
      });
    }

    console.log(`Successfully seeded ${sampleBlogPosts.length} blog posts`);
  } catch (error) {
    console.error('Error seeding blog posts:', error);
    throw error;
  }
}

if (require.main === module) {
  seedBlogs()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedBlogs;

