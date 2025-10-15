import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all blog posts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status && status !== 'All Status') {
      where.published = status === 'Published';
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const stats = {
      total: await prisma.blogPost.count(),
      published: await prisma.blogPost.count({ where: { published: true } }),
      draft: await prisma.blogPost.count({ where: { published: false } }),
    };

    return NextResponse.json({ posts, stats });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      slug,
      content, 
      excerpt, 
      featuredImage,
      imageAlt,
      tags, 
      category,
      published, 
      featured,
      scheduledAt,
      seoTitle, 
      seoDescription,
      metaKeywords,
      allowComments,
      readingTime
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Find the user by email from session
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate slug if not provided
    let postSlug = slug;
    if (!postSlug) {
      postSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }

    // Calculate reading time if not provided
    let estimatedReadingTime = readingTime;
    if (!estimatedReadingTime && content) {
      const wordsPerMinute = 200;
      const wordCount = content.split(/\s+/).length;
      estimatedReadingTime = Math.ceil(wordCount / wordsPerMinute);
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: postSlug,
        content,
        excerpt: excerpt || '',
        featuredImage: featuredImage || null,
        imageAlt: imageAlt || null,
        tags: tags || [],
        category: category || null,
        published: published || false,
        featured: featured || false,
        publishedAt: published ? new Date() : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        metaKeywords: metaKeywords || [],
        allowComments: allowComments !== undefined ? allowComments : true,
        readingTime: estimatedReadingTime,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
