import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Globe, Truck, Headphones, ArrowRight, Star, Calendar, Clock, User } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Home - International Trade Solutions',
  description: 'Discover high-quality products for international trade. Connect with reliable suppliers and expand your business globally.',
  keywords: ['international trade', 'B2B business', 'global trade', 'export', 'import', 'business solutions'],
  openGraph: {
    title: 'B2B Business - International Trade Solutions',
    description: 'Discover high-quality products for international trade. Connect with reliable suppliers and expand your business globally.',
    type: 'website',
    images: [
      {
        url: '/images/hero-pattern.svg',
        width: 1200,
        height: 630,
        alt: 'B2B Business - International Trade Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'B2B Business - International Trade Solutions',
    description: 'Discover high-quality products for international trade. Connect with reliable suppliers and expand your business globally.',
    images: ['/images/hero-pattern.svg'],
  },
};

// 获取最新博客文章
async function getLatestBlogPosts() {
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
      take: 3, // 只获取最新的3篇文章
    });

    return blogPosts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// 估算阅读时间
function estimateReadTime(content: string): string {
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).length;
  const readTimeMinutes = Math.ceil(wordCount / 200); // 假设每分钟阅读200个单词
  return `${readTimeMinutes} min read`;
}

export default async function Home() {
  const latestBlogPosts = await getLatestBlogPosts();
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comprehensive Solutions for Global Trade
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide end-to-end solutions for your international trade needs with unmatched quality and service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  All products undergo rigorous quality control to meet international standards and certifications
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Efficient logistics network ensuring timely delivery worldwide with real-time tracking
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Dedicated customer support team available around the clock in multiple languages
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Featured Products
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Discover Our Product Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our comprehensive range of high-quality products designed for international trade
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Globe className="w-16 h-16 text-white opacity-80" />
              </div>
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">Electronics</CardTitle>
                <CardDescription className="text-base">
                  High-tech electronic components and devices for various industries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  <Link href="/product?category=electronics">
                    View Products
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Truck className="w-16 h-16 text-white opacity-80" />
              </div>
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">Machinery</CardTitle>
                <CardDescription className="text-base">
                  Industrial machinery and equipment for manufacturing processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  <Link href="/product?category=machinery">
                    View Products
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-white opacity-80" />
              </div>
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">Materials</CardTitle>
                <CardDescription className="text-base">
                  Raw materials and components for construction and manufacturing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  <Link href="/product?category=materials">
                    View Products
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Latest Insights
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Industry News & Updates
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay informed with the latest trends, insights, and news in international trade and business
            </p>
          </div>
          
          {latestBlogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBlogPosts.map((post) => (
                <Card key={post.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.imageAlt || post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center p-6">
                        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <span className="text-gray-500 text-sm">Article Image</span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estimateReadTime(post.content)}
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-base mb-4 line-clamp-3">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        {post.author?.name || 'Anonymous'}
                      </div>
                      <Button asChild variant="ghost" size="sm" className="group-hover:text-primary">
                        <Link href={`/blog/${post.id}`}>
                          Read More
                          <ArrowRight className="ml-1 w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Blog Posts Yet</h3>
              <p className="text-muted-foreground">
                Stay tuned for the latest industry insights and updates.
              </p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/blog">
                View All Articles
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/cta-pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white hover:bg-white/30">
            🚀 Ready to Get Started?
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Expand Your Business Globally?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of successful businesses who trust us for their international trade needs. Get your personalized quote today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
              <Link href="/contact">
                Get Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}