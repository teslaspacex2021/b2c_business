import Link from 'next/link';
import { prisma } from '@/lib/db';
import type { Metadata } from 'next';
import NewsletterSubscription from '@/components/NewsletterSubscription';

export const metadata: Metadata = {
  title: 'Blog - International Trade Insights and Industry News',
  description: 'Stay updated with the latest insights, trends, and news in international trade and business.',
  keywords: ['blog', 'international trade', 'business insights', 'industry news', 'trade trends'],
  openGraph: {
    title: 'Blog - B2B Business',
    description: 'Stay updated with the latest insights, trends, and news in international trade and business.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - B2B Business',
    description: 'Stay updated with the latest insights, trends, and news in international trade and business.',
  },
};

async function getBlogPosts() {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 20, // Limit to 20 most recent posts
    });

    return blogPosts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

function estimateReadTime(content: string): string {
  // Remove HTML tags and count words
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
  return `${readTime} min read`;
}

function getUniqueCategories(posts: any[]): string[] {
  const categories = new Set(['All Posts']);
  posts.forEach(post => {
    post.tags.forEach((tag: string) => {
      // Convert tags to title case for categories
      const category = tag.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      categories.add(category);
    });
  });
  return Array.from(categories).slice(0, 6); // Limit to 6 categories
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  const categories = getUniqueCategories(blogPosts);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay informed with the latest insights, trends, and news in international trade and business.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className="px-6 py-2 rounded-full border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Article</h2>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2 h-64 md:h-auto bg-gray-200 flex items-center justify-center">
                    {featuredPost.featuredImage ? (
                      <img 
                        src={featuredPost.featuredImage} 
                        alt={featuredPost.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-lg">Featured Image</span>
                    )}
                  </div>
                  <div className="md:w-1/2 p-8">
                    <div className="mb-4">
                      {featuredPost.tags[0] && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold">
                          {featuredPost.tags[0]}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {featuredPost.excerpt || featuredPost.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{featuredPost.author.name}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(featuredPost.publishedAt || featuredPost.createdAt)}</span>
                        <span className="mx-2">•</span>
                        <span>{estimateReadTime(featuredPost.content)}</span>
                      </div>
                      <Link
                        href={`/blog/${featuredPost.id}`}
                        className="text-blue-600 font-semibold hover:text-blue-800"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Subscription */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSubscription
            title="Never Miss an Update"
            description="Get the latest industry insights, trade news, and business tips delivered straight to your inbox."
            source="blog"
            className="max-w-md mx-auto"
          />
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Articles</h2>
          
          {otherPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No blog posts available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Article Image</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="mb-3">
                      {post.tags[0] && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold">
                          {post.tags[0]}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{post.author.name}</span>
                      <span>{estimateReadTime(post.content)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                      <Link
                        href={`/blog/${post.id}`}
                        className="text-blue-600 font-semibold hover:text-blue-800"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Get the latest trade insights and industry news delivered to your inbox
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-blue-800 px-6 py-3 rounded-r-lg hover:bg-blue-900 transition-colors font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

