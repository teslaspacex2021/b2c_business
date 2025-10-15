import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface CustomPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 获取页面数据
async function getPage(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pages/${slug}`, {
      cache: 'no-store', // 确保获取最新数据
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.page;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

// 生成页面元数据
export async function generateMetadata({ params }: CustomPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) {
      return {
        title: 'Page Not Found',
      };
    }

    return {
      title: page.metaTitle || page.title,
      description: page.metaDescription,
    };
  } catch (error) {
    return {
      title: 'Page Not Found',
    };
  }
}

// 页面组件
export default async function CustomPage({ params }: CustomPageProps) {
  try {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        {/* 页面头部 */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {page.title}
              </h1>
            </div>
          </div>
        </section>

        {/* 页面内容 */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error rendering page:', error);
    notFound();
  }
}

