'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Code2, BookOpen, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import AiCodeReviewer from '@/components/AiCodeReviewer'

type CodeStep = { step_index: number; title: string; code_snippet: string }
type LessonGroup = { slug: string; title: string; difficulty: string; steps: CodeStep[] }
type Breakdown = { label: string; explain: string; why?: string }
type Explanation = { summary: string; breakdown: Breakdown[] }

const EXPLANATIONS: Record<string, Explanation> = {
  'blink-led-4': {
    summary: 'Your first Arduino program — blinks an LED on and off once per second, forever.',
    breakdown: [
      { label: 'void setup()', explain: 'Runs exactly once when the Arduino powers on. Use it to configure pins and settings before your main code starts.', why: 'Pins need to be configured before loop() begins. Without this, pin 9 won\'t drive the LED reliably.' },
      { label: 'pinMode(9, OUTPUT)', explain: 'Tells pin 9 it will be sending voltage outward to the LED. Pins are INPUT by default, so this step is required.', why: 'Arduino doesn\'t know what each pin is connected to — you have to tell it.' },
      { label: 'void loop()', explain: 'Runs over and over forever after setup() finishes. Every line inside here repeats until the board loses power.', why: 'Arduino programs never truly end — loop() is how you keep things running continuously.' },
      { label: 'digitalWrite(9, HIGH)', explain: 'Sends 5V to pin 9. The LED receives power through pin 9 and lights up. HIGH = full voltage (5V).', why: 'HIGH is clearer than writing "5" — and works on any Arduino regardless of its operating voltage.' },
      { label: 'delay(1000)', explain: 'Freezes the entire program for 1000ms (1 full second). Nothing else runs during this pause.', why: 'Without delay(), the LED would blink thousands of times per second — too fast for your eyes to see.' },
      { label: 'digitalWrite(9, LOW)', explain: 'Sends 0V to pin 9. The LED loses power and goes dark. LOW = zero voltage.', why: 'This completes the blink cycle: HIGH → wait → LOW → wait → repeat.' },
    ],
  },
  'blink-led-5': {
    summary: 'Upgrades the blink sketch with variables so you can tweak the timing without digging through the code.',
    breakdown: [
      { label: 'int onTime = 300', explain: 'Creates a variable called onTime that stores 300. "int" means it holds whole numbers. You can change 300 to anything.', why: 'Storing timing in a named variable means you change it in one place at the top instead of hunting through the code.' },
      { label: 'int offTime = 700', explain: 'A second variable for how long the LED stays off. 300 + 700 = 1000ms total, so the LED blinks once per second.', why: 'Separating on/off timing lets you create patterns — a short flash vs. a long pulse feel completely different.' },
      { label: 'delay(onTime)', explain: 'Uses the variable instead of a hardcoded number. If you change onTime at the top, this line automatically uses the new value.', why: 'This is the main power of variables — one change ripples everywhere the variable is used.' },
    ],
  },
  'servo-motor-3': {
    summary: 'Smoothly sweeps a servo from 0° to 180° and back using the Arduino Servo library.',
    breakdown: [
      { label: '#include <Servo.h>', explain: 'Loads the Servo library — code written by the Arduino team that handles the precise timing signals servos need. Without it you\'d need 50+ lines of low-level code.', why: 'Libraries let you use complex hardware with simple commands. This is how real-world engineering works.' },
      { label: 'Servo myServo', explain: 'Creates a servo controller object called "myServo". Think of it as naming your servo so you can give it commands by name.', why: 'You could name it anything — myArm, gate, doorLock. Good names make your code self-documenting.' },
      { label: 'myServo.attach(9)', explain: 'Tells the library which pin the servo\'s signal wire is on. The library will now send the correct pulses to pin 9.', why: 'One Servo library can control multiple servos on different pins — attach() connects the right object to the right pin.' },
      { label: 'for (int angle = 0; angle <= 180; angle++)', explain: 'A counting loop. Creates variable "angle" starting at 0, runs the code inside, adds 1, checks if still ≤180, repeats. Runs 181 times total.', why: 'Loops let you command every degree without writing 181 separate lines of code.' },
      { label: 'myServo.write(angle)', explain: 'Moves the servo to that exact degree. angle=0 goes to one end, angle=90 is the middle, angle=180 is the other end.', why: 'write() is the core servo command. The library converts the angle to the right pulse width automatically.' },
      { label: 'delay(15)', explain: 'Gives the servo 15ms to physically move to the commanded position before the next command arrives.', why: 'Servos have physical speed limits. Without this, commands pile up faster than the servo can execute them.' },
    ],
  },
  'servo-motor-4': {
    summary: 'Makes the servo interactive — type an angle in the Serial Monitor and the servo moves there instantly.',
    breakdown: [
      { label: 'Serial.available() > 0', explain: 'Checks if you\'ve typed something in the Serial Monitor and pressed Enter. Returns true when there\'s data waiting to be read.', why: 'Without this check, Serial.parseInt() would block the whole program waiting forever for input.' },
      { label: 'Serial.parseInt()', explain: 'Reads the number you typed. It looks at the incoming characters and converts them to an integer, stopping at the first non-digit.', why: 'Converts raw text ("90") into an actual number (90) you can use in math and function calls.' },
      { label: 'constrain(angle, 0, 180)', explain: 'Safety clamp. If you type 999 it becomes 180. Type -5 it becomes 0. Keeps the value inside the valid servo range.', why: 'Servos can be damaged by out-of-range commands. constrain() is a one-line guard that prevents this.' },
      { label: 'myServo.write(angle)', explain: 'Moves the servo to the position you typed. Combined with constrain(), this is always a safe command.', why: 'This is the payoff — your typed input directly controls a physical object in the real world.' },
      { label: 'Serial.print("Moving to: ")', explain: 'Sends confirmation text back to your screen so you know the Arduino received and processed your input.', why: 'Feedback is essential for debugging. Without it, you don\'t know if your typed value was actually received.' },
    ],
  },
  'pwm-fade-led-3': {
    summary: 'Demonstrates analogWrite by holding an LED at exactly 25% brightness — a fixed dim glow.',
    breakdown: [
      { label: 'analogWrite(9, 64)', explain: 'Sets pin 9 to 64 out of 255 possible levels — roughly 25% power. The LED glows at quarter brightness and stays there.', why: 'Unlike digitalWrite (fully on or fully off), analogWrite gives you 256 brightness levels using rapid on/off pulses (PWM) your eye reads as dimming.' },
      { label: 'Why 255 max?', explain: 'PWM uses 8 bits of precision: 2⁸ = 256 steps, numbered 0 to 255. 0 is fully off, 255 is fully on. To find any percentage: divide by 100 then multiply by 255.', why: '256 levels is enough that dimming looks perfectly smooth to the human eye — no visible stepping.' },
    ],
  },
  'pwm-fade-led-4': {
    summary: 'Fades an LED from off to full brightness and back — the classic "breathing" effect.',
    breakdown: [
      { label: 'for (int b = 0; b <= 255; b++)', explain: 'Loop that counts b from 0 to 255 — every brightness level from off to full. Runs 256 times.', why: 'One loop handles all 256 steps instead of writing analogWrite(9, 0), analogWrite(9, 1)... 255 times.' },
      { label: 'analogWrite(9, b)', explain: 'Updates the LED brightness with each step of the loop. As b increases 0→255, the LED smoothly brightens.', why: 'The loop variable "b" does double duty — it\'s both the counter and the brightness value.' },
      { label: 'delay(8)', explain: '8ms between each brightness step. 256 steps × 8ms = 2048ms ≈ 2 second fade. Make this smaller for a snappier fade, larger for a dramatic slow pulse.', why: 'The timing is what makes the fade look smooth. Without delay, the LED would flash instantly.' },
      { label: 'Second for loop (255 → 0)', explain: 'Same structure but counts down. b starts at 255, decreases by 1, stops at 0. The LED dims back to off.', why: 'Two loops — one counting up, one counting down — create the complete breathing cycle.' },
    ],
  },
  'button-input-4': {
    summary: 'Reads a pushbutton and prints its state (1 = pressed, 0 = not pressed) to the Serial Monitor.',
    breakdown: [
      { label: 'pinMode(2, INPUT)', explain: 'Configures pin 2 to receive voltage coming in from the button circuit. The opposite of OUTPUT — it reads instead of sends.', why: 'The same pin hardware can be input or output. You choose the role in your code.' },
      { label: 'Serial.begin(9600)', explain: 'Opens serial communication at 9600 baud (bits per second). Both the Arduino and your Serial Monitor must use the same speed.', why: 'Mismatched baud rates produce garbled output. 9600 is the universal starting speed for most projects.' },
      { label: 'digitalRead(2)', explain: 'Reads pin 2 and returns HIGH (1) or LOW (0). Button pressed + 5V reaches pin 2 → returns 1. Button released → returns 0.', why: 'digitalRead is the input counterpart to digitalWrite. Together they\'re the foundation of all digital communication.' },
      { label: 'Serial.println(buttonState)', explain: 'Sends the value (0 or 1) to your screen and moves to a new line. Watch it change in real time as you press the button.', why: 'println = print + new line. This keeps each reading on its own row so the output stays readable.' },
      { label: 'delay(100)', explain: '100ms pause = 10 readings per second. Fast enough to feel instant, slow enough to read in the monitor.', why: 'Too fast and the monitor scrolls too quickly to read. Too slow and button presses feel laggy. 100ms is the sweet spot.' },
    ],
  },
  'analog-sensor-3': {
    summary: 'Reads a potentiometer and prints the raw value (0–1023) to the Serial Monitor 20 times per second.',
    breakdown: [
      { label: 'analogRead(A0)', explain: 'Reads the voltage on analog pin A0 and converts it to a number. 0V → 0, 5V → 1023. That\'s 1024 possible values — compared to digitalRead\'s 2 (just 0 or 1).', why: 'Analog sensors (temperature, light, position) produce varying voltages. analogRead captures that full range.' },
      { label: 'Serial.println(sensorValue)', explain: 'Prints the number and a new line. Turn the potentiometer and watch the number change live.', why: 'Seeing the raw values first lets you understand your sensor\'s full range before you try to process it.' },
      { label: 'delay(50)', explain: '50ms pause = 20 readings per second. Fast enough to track smooth pot movement without flooding the Serial Monitor.', why: 'Too fast and thousands of lines appear per second. 50ms keeps output human-readable.' },
    ],
  },
  'analog-sensor-4': {
    summary: 'Maps the potentiometer position directly to LED brightness — turning the knob changes the light level.',
    breakdown: [
      { label: 'map(raw, 0, 1023, 0, 255)', explain: 'Converts a value from one range to another. Input 0→output 0, input 512→output 127, input 1023→output 255. Perfectly proportional.', why: 'analogRead outputs 0-1023 but analogWrite only accepts 0-255. map() bridges this mismatch in one line.' },
      { label: 'analogWrite(9, bright)', explain: 'Sets LED brightness to the mapped value. Pot at one end = LED off. Pot at the other = LED full brightness.', why: 'This makes a physical input directly control a physical output. The pot IS the dimmer switch.' },
      { label: 'Serial.print / println block', explain: 'Shows both the raw value and the mapped value side by side so you can watch the conversion happen live.', why: 'Printing both values confirms your math works — you can see "Raw: 512 → Brightness: 127" and verify it makes sense.' },
    ],
  },
  'serial-monitor-2': {
    summary: 'Sends an incrementing counter to the Serial Monitor every half second — your first communication from Arduino to computer.',
    breakdown: [
      { label: 'int counter = 0', explain: 'Declared OUTSIDE loop() so it keeps its value between runs. If declared inside loop(), it would reset to 0 every iteration and you\'d only ever see "Count: 0".', why: 'Where you declare a variable determines whether it persists or resets. This is called variable scope.' },
      { label: 'Serial.begin(9600)', explain: 'Must be called in setup() before any Serial.print(). Sets the speed. The Serial Monitor\'s dropdown (bottom right corner) must match this number.', why: 'Without Serial.begin(), Serial.print() does nothing. Forgetting this is the #1 reason beginners see a blank monitor.' },
      { label: 'Serial.print("Count: ")', explain: 'Sends text but stays on the same line. The next print() call appears immediately after the colon and space.', why: 'print() vs println() is the key distinction. print stays on the line, println ends it.' },
      { label: 'Serial.println(counter)', explain: 'Prints the current number and moves to a new line. That\'s why each count appears on its own row.', why: 'println = print + a newline character. Every data row should end with println.' },
      { label: 'counter++', explain: 'Shorthand for counter = counter + 1. Adds 1 to counter every time loop() runs — so the number goes up every half second.', why: '++ is one of the most common operators in Arduino code. You\'ll see it in almost every for loop and counter.' },
    ],
  },
  'serial-monitor-3': {
    summary: 'Formats multiple sensor values into one clean, readable line — the standard pattern for logging data.',
    breakdown: [
      { label: 'Serial.print("Temperature: ")', explain: 'Sends the label text with no line break. The cursor stays on the same line, ready for the next print().', why: 'Building output piece by piece lets you combine labels and values into nicely formatted rows.' },
      { label: 'Serial.print(temp)', explain: 'Sends the variable\'s current value right after the label. Because we used print() (not println()), it stays on the same line.', why: 'Variables print as their actual value — so temp=20 prints "20", not the word "temp".' },
      { label: 'Serial.print(" C   |   Humidity: ")', explain: 'Sends a separator string that visually divides the two values. Spaces and the pipe character make it easy to scan at a glance.', why: 'Good formatting makes debugging faster — you can read values instantly instead of parsing a wall of numbers.' },
      { label: 'Serial.println(" %")', explain: 'Sends the unit AND the line break. This is the last piece on this line, so println() ends it.', why: 'The rule: use print() for everything except the last item on a line. That last item always uses println().' },
    ],
  },
}

export default function CodeReference() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<LessonGroup[]>([])
  const [userTier, setUserTier] = useState('free')
  const didScroll = useRef(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      const [{ data: profileData }, { data: lessonData }] = await Promise.all([
        supabase.from('profiles').select('subscription_tier').eq('id', session.user.id).maybeSingle(),
        supabase.from('learning_lessons').select('id, slug, title, difficulty, order_index').order('order_index'),
      ])
      setUserTier(profileData?.subscription_tier || 'free')

      if (!lessonData) { setLoading(false); return }

      const groups: LessonGroup[] = []
      for (const lesson of lessonData) {
        const { data: steps } = await supabase
          .from('learning_lesson_steps')
          .select('step_index, title, code_snippet')
          .eq('lesson_id', lesson.id)
          .not('code_snippet', 'is', null)
          .neq('code_snippet', '')
          .order('step_index')
        if (steps && steps.length > 0) {
          groups.push({ slug: lesson.slug, title: lesson.title, difficulty: lesson.difficulty, steps })
        }
      }
      setLessons(groups)
      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    if (loading || didScroll.current || !lessons.length) return
    const hash = window.location.hash.slice(1)
    if (hash) {
      didScroll.current = true
      setTimeout(() => {
        const el = document.getElementById(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }, [loading, lessons])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  function diffBadge(d: string) {
    if (d === 'beginner') return 'bg-green-100 text-green-700'
    if (d === 'intermediate') return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">

        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to lessons
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-slate-900 rounded flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Code Reference</h1>
          </div>
          <p className="text-slate-500 text-sm ml-12 max-w-xl">
            Every sketch from every lesson, explained line by line. Understand not just what the code does — but why each line is there.
          </p>
        </div>

        {/* AI Code Reviewer */}
        <AiCodeReviewer userTier={userTier} />

        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24 space-y-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jump to</p>
              {lessons.map(lesson => (
                <div key={lesson.slug}>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">{lesson.title}</p>
                  <div className="space-y-0.5">
                    {lesson.steps.map(step => (
                      <a
                        key={step.step_index}
                        href={`#${lesson.slug}-${step.step_index}`}
                        className="block text-xs text-slate-400 hover:text-slate-800 py-1 pl-2 border-l-2 border-slate-200 hover:border-slate-700 transition-colors"
                      >
                        Step {step.step_index} — {step.title.length > 22 ? step.title.slice(0, 22) + '…' : step.title}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-10">
            {lessons.map(lesson => (
              <div key={lesson.slug}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{lesson.title}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${diffBadge(lesson.difficulty)}`}>
                    {lesson.difficulty}
                  </span>
                </div>

                {lesson.steps.map(step => {
                  const key = `${lesson.slug}-${step.step_index}`
                  const expl = EXPLANATIONS[key]
                  return (
                    <div
                      key={step.step_index}
                      id={key}
                      className="bg-white border border-slate-200 rounded-md overflow-hidden mb-5 scroll-mt-24"
                    >
                      {/* Step header */}
                      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2.5">
                        <span className="w-6 h-6 bg-slate-900 rounded text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {step.step_index}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                      </div>

                      {/* Summary */}
                      {expl && (
                        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                          <p className="text-sm text-blue-900">{expl.summary}</p>
                        </div>
                      )}

                      {/* Code block */}
                      <div className="bg-slate-900">
                        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-800">
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
                          <span className="text-xs text-slate-400 font-mono">Arduino sketch</span>
                        </div>
                        <pre className="overflow-auto px-5 py-4 text-xs text-slate-200 font-mono leading-relaxed">
                          {step.code_snippet}
                        </pre>
                      </div>

                      {/* Line-by-line breakdown */}
                      {expl && expl.breakdown.length > 0 && (
                        <div className="p-5">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                            Line by line
                          </p>
                          <div className="space-y-4">
                            {expl.breakdown.map((item, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="w-1 bg-slate-200 rounded-full shrink-0 mt-1 mb-1" />
                                <div>
                                  <code className="text-xs font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                    {item.label}
                                  </code>
                                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{item.explain}</p>
                                  {item.why && (
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                      <span className="font-semibold">Why:</span> {item.why}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                        <Link
                          href={`/learn/${lesson.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Open lesson
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
