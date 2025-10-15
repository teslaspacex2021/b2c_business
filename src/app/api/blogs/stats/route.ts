import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      recentPosts,
      topAuthors
    ] = await Promise.all([
      // Total posts count
      prisma.blogPost.count(),
      
      // Published posts count
      prisma.blogPost.count({
        where: { published: true }
      }),
      
      // Draft posts count
      prisma.blogPost.count({
        where: { published: false }
      }),
      
      // Scheduled posts count (published but publishedAt is in the future)
      prisma.blogPost.count({
        where: {
          published: true,
          publishedAt: {
            gt: new Date()
          }
        }
      }),
      
      // Recent posts (last 7 days)
      prisma.blogPost.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Top authors by post count
      prisma.user.findMany({
        include: {
          _count: {
            select: {
              blogPosts: true
            }
          }
        },
        orderBy: {
          blogPosts: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ]);

    const stats = {
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      recentPosts,
      topAuthors: topAuthors.map(author => ({
        id: author.id,
        name: author.name,
        email: author.email,
        postCount: author._count.blogPosts
      }))
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Blog stats fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
