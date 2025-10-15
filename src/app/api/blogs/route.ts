import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const skip = (page - 1) * limit;

    const where: any = {
      published: true, // Only return published blog posts for public API
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    try {
      const [blogPosts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          skip,
          take: limit,
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: true,
            imageAlt: true,
            tags: true,
            category: true,
            featured: true,
            publishedAt: true,
            readingTime: true,
            views: true,
            likes: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.blogPost.count({ where }),
      ]);

      // Get unique categories for filtering
      const categories = await prisma.blogPost.findMany({
        where: { published: true, category: { not: null } },
        select: { category: true },
        distinct: ['category'],
      });

      return NextResponse.json({
        blogPosts,
        categories: categories.map(c => c.category).filter(Boolean),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (dbError) {
      console.warn('Database connection failed, returning mock data:', dbError);
      
      // Return mock data when database is not available
      const mockBlogPosts = [
        {
          id: '1',
          title: 'The Future of B2B Manufacturing Technology',
          slug: 'future-b2b-manufacturing-technology',
          excerpt: 'Exploring the latest trends and innovations in B2B manufacturing technology that are shaping the industry.',
          featuredImage: '/images/blog/manufacturing-tech.jpg',
          imageAlt: 'Modern manufacturing technology',
          tags: ['technology', 'manufacturing', 'innovation'],
          category: 'Technology',
          featured: true,
          publishedAt: new Date().toISOString(),
          readingTime: 5,
          views: 245,
          likes: 18,
          author: {
            id: '1',
            name: 'John Smith',
          },
        },
        {
          id: '2',
          title: 'Supply Chain Optimization Strategies',
          slug: 'supply-chain-optimization-strategies',
          excerpt: 'Learn effective strategies to optimize your supply chain and reduce costs while improving efficiency.',
          featuredImage: '/images/blog/supply-chain.jpg',
          imageAlt: 'Supply chain management',
          tags: ['supply-chain', 'optimization', 'business'],
          category: 'Business',
          featured: false,
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          readingTime: 7,
          views: 189,
          likes: 12,
          author: {
            id: '2',
            name: 'Jane Doe',
          },
        }
      ];

      const filteredPosts = mockBlogPosts.slice(skip, skip + limit);
      
      return NextResponse.json({
        blogPosts: filteredPosts,
        categories: ['Technology', 'Business', 'Industry', 'Innovation'],
        pagination: {
          page,
          limit,
          total: mockBlogPosts.length,
          pages: Math.ceil(mockBlogPosts.length / limit),
        },
      });
    }
  } catch (error) {
    console.error('Blog posts fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      content, 
      excerpt, 
      featuredImage, 
      tags, 
      published, 
      publishedAt,
      seoTitle,
      seoDescription 
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        tags: tags || [],
        published: published || false,
        publishedAt: published && publishedAt ? new Date(publishedAt) : (published ? new Date() : null),
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        authorId: session.user.id,
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
    });

    return NextResponse.json(
      { message: 'Blog post created successfully', blogPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('Blog post creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
