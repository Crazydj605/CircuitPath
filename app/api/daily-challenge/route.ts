import { NextResponse } from 'next/server'
import axios from 'axios'

const GROK_API_KEY = process.env.GROK_API_KEY || ''
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const FALLBACK = {
  question: 'What is the purpose of a resistor in an LED circuit?',
  options: [
    'To make the LED brighter',
    'To limit current and protect the LED',
    'To store electrical charge',
    'To convert AC power to DC',
  ],
  correct_index: 1,
  explanation:
    'A resistor limits the amount of current flowing through the LED. Without it, too much current would flow and burn out the LED instantly.',
  topic: 'Resistors',
}

async function generateQuestion() {
  try {
    const res = await axios.post(
      GROK_API_URL,
      {
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content:
              'You generate multiple choice quiz questions about Arduino and electronics. Return ONLY valid JSON, no markdown, no code blocks, no extra text.',
          },
          {
            role: 'user',
            content: `Generate a fun beginner-friendly Arduino/electronics multiple choice question.
Topics (pick one): resistors, LEDs, Ohm's Law, servo motors, potentiometers, ultrasonic sensors, digital pins, analog pins, voltage, current, breadboards, buttons, buzzer, serial monitor, PWM.
Return ONLY this exact JSON structure:
{"question":"...","options":["option A","option B","option C","option D"],"correct_index":0,"explanation":"one sentence why this is correct","topic":"Topic Name"}`,
          },
        ],
        temperature: 0.9,
        max_tokens: 300,
      },
      { headers: { Authorization: `Bearer ${GROK_API_KEY}`, 'Content-Type': 'application/json' } }
    )

    const raw = res.data.choices[0].message.content as string
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    if (
      typeof parsed.question !== 'string' ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correct_index !== 'number' ||
      typeof parsed.explanation !== 'string' ||
      typeof parsed.topic !== 'string'
    ) {
      return FALLBACK
    }

    return parsed as typeof FALLBACK
  } catch {
    return FALLBACK
  }
}

function sbHeaders() {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Check for existing challenge
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/daily_challenges?challenge_date=eq.${today}&select=*`,
      { headers: sbHeaders() }
    )
    const existing = await checkRes.json()
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(existing[0])
    }

    // Generate new challenge
    const question = await generateQuestion()

    // Insert into DB
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/daily_challenges`, {
      method: 'POST',
      headers: { ...sbHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({
        question: question.question,
        options: question.options,
        correct_index: question.correct_index,
        explanation: question.explanation,
        topic: question.topic,
        challenge_date: today,
      }),
    })

    const inserted = await insertRes.json()
    if (Array.isArray(inserted) && inserted.length > 0) {
      return NextResponse.json(inserted[0])
    }

    // Race condition: another request beat us, fetch existing
    const retryRes = await fetch(
      `${SUPABASE_URL}/rest/v1/daily_challenges?challenge_date=eq.${today}&select=*`,
      { headers: sbHeaders() }
    )
    const retry = await retryRes.json()
    if (Array.isArray(retry) && retry.length > 0) {
      return NextResponse.json(retry[0])
    }

    // Absolute fallback — return without saving
    return NextResponse.json({ ...question, id: 'temp', challenge_date: today })
  } catch (err) {
    console.error('daily-challenge GET error:', err)
    return NextResponse.json({ error: 'Failed to load challenge' }, { status: 500 })
  }
}
