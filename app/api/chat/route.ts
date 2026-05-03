import { NextRequest, NextResponse } from 'next/server'
import { chatWithGrok } from '@/lib/grok'

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const response = await chatWithGrok(messages, context)

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
