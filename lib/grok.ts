import axios from 'axios'

const GROK_API_KEY = process.env.GROK_API_KEY || ''
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'

export async function sendMessageToGrok(message: string, context?: string) {
  try {
    const response = await axios.post(
      GROK_API_URL,
      {
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI tutor specializing in robotics, electronics, and circuit design. Help students learn in a friendly, encouraging way.'
          },
          ...(context ? [{ role: 'user' as const, content: context }] : []),
          { role: 'user' as const, content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return {
      success: true,
      message: response.data.choices[0].message.content
    }
  } catch (error: any) {
    console.error('Grok API error:', error)
    return {
      success: false,
      message: 'Sorry, I am having trouble connecting right now. Please try again later.'
    }
  }
}
