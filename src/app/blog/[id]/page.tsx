import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import type { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getBlogPost(id: string) {
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return blogPost;
  } catch (error) {
    console.warn('Database connection failed, returning mock data:', error);
    
    // Return mock blog post data
    const mockBlogPosts = {
      'future-b2b-manufacturing-technology': {
        id: 'future-b2b-manufacturing-technology',
        title: 'The Future of B2B Manufacturing Technology',
        slug: 'future-b2b-manufacturing-technology',
        content: `
          <h2>Introduction</h2>
          <p>The manufacturing industry is undergoing a digital transformation that is reshaping how businesses operate, compete, and deliver value to their customers. In this comprehensive analysis, we explore the key technological trends that are driving the future of B2B manufacturing.</p>
          
          <h2>Key Technologies Shaping the Future</h2>
          <h3>1. Internet of Things (IoT)</h3>
          <p>IoT devices are revolutionizing manufacturing by providing real-time data on equipment performance, environmental conditions, and production metrics. This connectivity enables predictive maintenance, quality control, and operational efficiency improvements.</p>
          
          <h3>2. Artificial Intelligence and Machine Learning</h3>
          <p>AI and ML algorithms are being deployed to optimize production processes, predict equipment failures, and enhance quality control. These technologies enable manufacturers to make data-driven decisions and automate complex processes.</p>
          
          <h3>3. Advanced Robotics</h3>
          <p>Modern robotics systems are becoming more flexible, intelligent, and collaborative. They can work alongside human operators to increase productivity while maintaining safety standards.</p>
          
          <h2>Benefits for B2B Manufacturers</h2>
          <ul>
            <li>Increased operational efficiency</li>
            <li>Reduced downtime through predictive maintenance</li>
            <li>Improved product quality and consistency</li>
            <li>Enhanced supply chain visibility</li>
            <li>Better customer service and responsiveness</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>The future of B2B manufacturing lies in the strategic adoption of these emerging technologies. Companies that embrace digital transformation will be better positioned to compete in the global marketplace and meet evolving customer demands.</p>
        `,
        excerpt: 'Exploring the latest trends and innovations in B2B manufacturing technology that are shaping the industry.',
        featuredImage: '/images/blog/manufacturing-tech.jpg',
        imageAlt: 'Modern manufacturing technology',
        tags: ['technology', 'manufacturing', 'innovation'],
        category: 'Technology',
        featured: true,
        published: true,
        publishedAt: new Date().toISOString(),
        readingTime: 5,
        views: 245,
        likes: 18,
        seoTitle: 'Future of B2B Manufacturing Technology - Industry Trends 2024',
        seoDescription: 'Discover the latest technological trends shaping B2B manufacturing, including IoT, AI, and advanced robotics.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
        },
      },
      'supply-chain-optimization-strategies': {
        id: 'supply-chain-optimization-strategies',
        title: 'Supply Chain Optimization Strategies',
        slug: 'supply-chain-optimization-strategies',
        content: `
          <h2>Introduction</h2>
          <p>In today's competitive business environment, supply chain optimization has become a critical factor for success. This article explores proven strategies that B2B companies can implement to streamline their supply chain operations.</p>
          
          <h2>Key Optimization Strategies</h2>
          <h3>1. Demand Forecasting</h3>
          <p>Accurate demand forecasting is the foundation of an optimized supply chain. By leveraging historical data, market trends, and advanced analytics, companies can better predict customer demand and adjust their operations accordingly.</p>
          
          <h3>2. Supplier Relationship Management</h3>
          <p>Building strong relationships with suppliers is crucial for supply chain success. This includes regular communication, performance monitoring, and collaborative planning to ensure mutual benefits.</p>
          
          <h3>3. Inventory Optimization</h3>
          <p>Implementing just-in-time inventory practices and using data analytics to determine optimal stock levels can significantly reduce carrying costs while maintaining service levels.</p>
          
          <h2>Technology Solutions</h2>
          <ul>
            <li>Supply Chain Management (SCM) software</li>
            <li>Enterprise Resource Planning (ERP) systems</li>
            <li>Real-time tracking and monitoring tools</li>
            <li>Blockchain for transparency and traceability</li>
          </ul>
          
          <h2>Measuring Success</h2>
          <p>Key performance indicators (KPIs) for supply chain optimization include:</p>
          <ul>
            <li>Order fulfillment time</li>
            <li>Inventory turnover ratio</li>
            <li>Supplier performance metrics</li>
            <li>Cost reduction percentages</li>
            <li>Customer satisfaction scores</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>Supply chain optimization is an ongoing process that requires continuous monitoring, analysis, and improvement. Companies that invest in these strategies will see significant benefits in terms of cost reduction, efficiency, and customer satisfaction.</p>
        `,
        excerpt: 'Learn effective strategies to optimize your supply chain and reduce costs while improving efficiency.',
        featuredImage: '/images/blog/supply-chain.jpg',
        imageAlt: 'Supply chain management',
        tags: ['supply-chain', 'optimization', 'business'],
        category: 'Business',
        featured: false,
        published: true,
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        readingTime: 7,
        views: 189,
        likes: 12,
        seoTitle: 'Supply Chain Optimization Strategies for B2B Success',
        seoDescription: 'Comprehensive guide to supply chain optimization strategies that can help B2B companies reduce costs and improve efficiency.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        author: {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      }
    };

    return mockBlogPosts[id as keyof typeof mockBlogPosts] || null;
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const blogPost = await getBlogPost(id);

  if (!blogPost) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: blogPost.seoTitle || blogPost.title,
    description: blogPost.seoDescription || blogPost.excerpt || `Read ${blogPost.title} on our blog`,
    openGraph: {
      title: blogPost.seoTitle || blogPost.title,
      description: blogPost.seoDescription || blogPost.excerpt || `Read ${blogPost.title} on our blog`,
      type: 'article',
      publishedTime: blogPost.publishedAt || blogPost.createdAt,
      authors: [blogPost.author.name],
      images: blogPost.featuredImage ? [blogPost.featuredImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blogPost.seoTitle || blogPost.title,
      description: blogPost.seoDescription || blogPost.excerpt || `Read ${blogPost.title} on our blog`,
      images: blogPost.featuredImage ? [blogPost.featuredImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  
  console.log('Blog post ID:', id); // Debug log
  
  const blogPost = await getBlogPost(id);

  if (!blogPost || !blogPost.published) {
    console.log('Blog post not found or not published:', blogPost); // Debug log
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {blogPost.featuredImage && (
            <div className="w-full h-64 md:h-96 relative">
              <img
                src={blogPost.featuredImage}
                alt={blogPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="p-8">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {blogPost.title}
              </h1>
              
              {blogPost.excerpt && (
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {blogPost.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {blogPost.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {blogPost.author.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(blogPost.publishedAt || blogPost.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {blogPost.tags && blogPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blogPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
          </div>
        </article>

        {/* Back to Blog Link */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
