import { NextRequest, NextResponse } from 'next/server';

// 模拟快捷回复数据
const quickReplies = [
  {
    id: '1',
    title: 'Product Information',
    content: 'I need information about your products',
    category: 'general'
  },
  {
    id: '2',
    title: 'Pricing',
    content: 'Can you provide pricing information?',
    category: 'sales'
  },
  {
    id: '3',
    title: 'Technical Support',
    content: 'I need technical assistance',
    category: 'support'
  },
  {
    id: '4',
    title: 'Talk to Human',
    content: 'I would like to speak with a human agent',
    category: 'escalation'
  },
  {
    id: '5',
    title: 'Request Quote',
    content: 'I would like to request a quote for products',
    category: 'sales'
  },
  {
    id: '6',
    title: 'Shipping Information',
    content: 'What are your shipping options and costs?',
    category: 'logistics'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let filteredReplies = quickReplies;
    if (category && category !== 'all') {
      filteredReplies = quickReplies.filter(reply => reply.category === category);
    }

    return NextResponse.json({
      success: true,
      data: filteredReplies
    });
  } catch (error) {
    console.error('Error fetching quick replies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quick replies' },
      { status: 500 }
    );
  }
}
