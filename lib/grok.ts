import axios from 'axios'

const GROK_API_KEY = process.env.GROK_API_KEY || ''
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatWithGrok(messages: GrokMessage[], context?: string): Promise<string> {
  try {
    const systemPrompt = context 
      ? `You are CircuitPath AI, a friendly and knowledgeable robotics tutor. ${context}`
      : `You are CircuitPath AI, a friendly and knowledgeable robotics tutor. You help users learn about electronics, circuits, robotics, and programming. Always be encouraging, clear, and practical. Use examples and analogies when helpful. If discussing circuits, be precise about electrical concepts.`

    const response = await axios.post(
      GROK_API_URL,
      {
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('Grok API error:', error)
    throw new Error('Failed to get response from AI tutor')
  }
}

export async function getRoboticsTutorResponse(
  userMessage: string, 
  lessonContext?: string,
  circuitContext?: string
): Promise<string> {
  let context = ''
  
  if (lessonContext) {
    context += `Current lesson context: ${lessonContext}\n`
  }
  
  if (circuitContext) {
    context += `Current circuit context: ${circuitContext}\n`
  }

  const messages: GrokMessage[] = [
    { role: 'user', content: userMessage }
  ]

  return chatWithGrok(messages, context || undefined)
}

export async function getCircuitHelp(circuitState: string, userQuestion: string): Promise<string> {
  const context = `The user is building a circuit. Current circuit state: ${circuitState}. Provide specific, actionable guidance.`
  
  const messages: GrokMessage[] = [
    { role: 'user', content: userQuestion }
  ]

  return chatWithGrok(messages, context)
}

export async function explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'advanced'): Promise<string> {
  const messages: GrokMessage[] = [
    { role: 'user', content: `Explain ${concept} at a ${level} level` }
  ]

  const context = `The user is asking for an explanation at ${level} level. Adjust your explanation accordingly - use simple analogies for beginners, technical details for advanced users.`

  return chatWithGrok(messages, context)
}
