import { NextRequest, NextResponse } from 'next/server'
import { sendMessageToGrok } from '@/lib/grok'

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const response = await sendMessageToGrok(message, context)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
