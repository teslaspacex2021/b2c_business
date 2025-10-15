import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, isTyping } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // 这里可以通过SSE或WebSocket广播输入状态
    // 目前只是简单返回成功状态
    console.log(`User typing status for session ${sessionId}: ${isTyping}`);

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        isTyping,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating typing status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update typing status' },
      { status: 500 }
    );
  }
}
