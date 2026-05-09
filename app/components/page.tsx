'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'

type Component = {
  id: string
  name: string
  category: string
  emoji: string
  what_it_is: string
  how_it_works: string
  typical_uses: string[]
  pins: string[]
  tips: string[]
  common_values?: string
  amazon_search?: string
}

const COMPONENTS: Component[] = [
  {
    id: 'led',
    name: 'LED',
    category: 'Output',
    emoji: '💡',
    what_it_is: 'A Light Emitting Diode — a tiny light that only lets current flow in one direction.',
    how_it_works: 'When current flows from the longer leg (anode/+) to the shorter leg (cathode/−), it emits light. Always use a resistor in series to limit current.',
    typical_uses: ['Status indicator', 'Blink patterns', 'PWM dimming'],
    pins: ['Anode (+) — longer leg', 'Cathode (−) — shorter leg, flat side of housing'],
    tips: ['Always use a 220Ω–1kΩ resistor in series', 'Connect anode to Arduino pin, cathode to GND', 'Typical forward voltage: 2V for red, 3.3V for blue/white'],
    common_values: '5mm red, green, yellow, blue, white',
    amazon_search: 'https://www.amazon.com/s?k=5mm+LED+assortment+arduino',
  },
  {
    id: 'resistor',
    name: 'Resistor',
    category: 'Passive',
    emoji: '〰️',
    what_it_is: 'A component that resists the flow of electricity, limiting current in a circuit.',
    how_it_works: 'Uses Ohm\'s Law: V = I × R. A higher resistance means less current for the same voltage. Color bands on the body encode the resistance value.',
    typical_uses: ['Protect LEDs from too much current', 'Pull-up / pull-down for buttons', 'Voltage dividers'],
    pins: ['No polarity — either leg can go either way'],
    tips: ['Use the resistor color code chart to read values', '220Ω for LEDs at 5V', '10kΩ for pull-up/down resistors'],
    common_values: '220Ω, 1kΩ, 4.7kΩ, 10kΩ',
    amazon_search: 'https://www.amazon.com/s?k=resistor+kit+assortment+arduino',
  },
  {
    id: 'pushbutton',
    name: 'Pushbutton',
    category: 'Input',
    emoji: '🔘',
    what_it_is: 'A tactile switch that connects two pins when pressed and disconnects them when released.',
    how_it_works: 'Internally, legs on the same side are always connected. Pressing bridges the two sides. Use a pull-down resistor (10kΩ to GND) to get a stable LOW when not pressed.',
    typical_uses: ['User input', 'Menu navigation', 'Trigger events'],
    pins: ['Leg A & B (one side)', 'Leg C & D (other side) — pressing bridges A/B to C/D'],
    tips: ['Add a 10kΩ pull-down resistor between the signal pin and GND', 'Or use INPUT_PULLUP in Arduino and connect to GND instead', 'Debounce in software with a small delay or debounce library'],
    amazon_search: 'https://www.amazon.com/s?k=tactile+pushbutton+switch+arduino+kit',
  },
  {
    id: 'potentiometer',
    name: 'Potentiometer',
    category: 'Input',
    emoji: '🎛️',
    what_it_is: 'A variable resistor with a knob. Turning the knob changes resistance between 0 and its max value.',
    how_it_works: 'Has three pins. Outer two connect to power and GND. The middle wiper pin outputs a voltage between 0V and 5V depending on knob position. Read with analogRead() (0–1023).',
    typical_uses: ['Volume/brightness control', 'Sensor calibration', 'Joystick axis'],
    pins: ['Pin 1 — +5V', 'Pin 2 (middle) — wiper/signal to analog pin', 'Pin 3 — GND'],
    tips: ['Use analogRead() which returns 0–1023', 'Map to a range with map(val, 0, 1023, 0, 255)', 'Common values: 10kΩ'],
    common_values: '10kΩ, 100kΩ',
    amazon_search: 'https://www.amazon.com/s?k=10k+potentiometer+trimmer+arduino',
  },
  {
    id: 'servo',
    name: 'Servo Motor',
    category: 'Output',
    emoji: '⚙️',
    what_it_is: 'A small motor that rotates to a precise angle (0–180°) based on a PWM signal.',
    how_it_works: 'Uses a control wire that receives PWM pulses. Pulse width between 1ms and 2ms maps to 0° and 180°. The Servo.h library handles this for you.',
    typical_uses: ['Robot arm joints', 'Pan/tilt camera', 'Steering mechanism'],
    pins: ['Brown/Black — GND', 'Red — +5V (use external power for multiple servos)', 'Orange/Yellow/White — signal to PWM pin'],
    tips: ['Use the Servo library: #include <Servo.h>', 'myServo.write(90) for 90 degrees', 'Power directly from 5V for one servo, external supply for more'],
    common_values: 'SG90 (9g micro), MG996R (high torque)',
    amazon_search: 'https://www.amazon.com/s?k=SG90+servo+motor+arduino',
  },
  {
    id: 'ldr',
    name: 'LDR (Light Sensor)',
    category: 'Input',
    emoji: '☀️',
    what_it_is: 'Light Dependent Resistor — resistance changes based on light intensity. Bright = low resistance, dark = high resistance.',
    how_it_works: 'Used in a voltage divider with a fixed resistor. The midpoint voltage changes with light level and is read on an analog pin.',
    typical_uses: ['Automatic night light', 'Light-following robot', 'Ambient light sensing'],
    pins: ['No polarity — either leg can go either way'],
    tips: ['Build a voltage divider: 5V → LDR → analog pin → 10kΩ → GND', 'analogRead() returns 0 (dark) to 1023 (bright)', 'Resistance: ~1kΩ in bright light, ~1MΩ in darkness'],
    amazon_search: 'https://www.amazon.com/s?k=LDR+photoresistor+light+sensor+arduino',
  },
  {
    id: 'buzzer',
    name: 'Piezo Buzzer',
    category: 'Output',
    emoji: '🔔',
    what_it_is: 'A small speaker that makes tones when given a PWM signal. Perfect for beeps, alarms, and simple melodies.',
    how_it_works: 'Active buzzers beep on their own when powered. Passive buzzers need a frequency signal from tone() to make different pitches.',
    typical_uses: ['Alarms and alerts', 'Musical notes', 'Game sound effects'],
    pins: ['+ (longer leg) — signal or +5V', '− (shorter leg) — GND'],
    tips: ['Use tone(pin, frequency) to play a note', 'Use noTone(pin) to stop', 'Frequency 262Hz = middle C, 440Hz = A4'],
    amazon_search: 'https://www.amazon.com/s?k=passive+piezo+buzzer+arduino',
  },
  {
    id: 'ultrasonic',
    name: 'Ultrasonic Sensor (HC-SR04)',
    category: 'Input',
    emoji: '📡',
    what_it_is: 'Measures distance by sending an ultrasonic pulse and timing the echo. Range: ~2cm to 400cm.',
    how_it_works: 'Send a 10µs HIGH pulse to the Trig pin. The sensor emits a burst of 40kHz sound. The Echo pin goes HIGH for as long as the sound takes to return. Distance = (duration × 0.034) / 2.',
    typical_uses: ['Obstacle avoidance robot', 'Parking sensor', 'Liquid level measurement'],
    pins: ['VCC — +5V', 'GND', 'Trig — output pin (trigger)', 'Echo — input pin (receives echo)'],
    tips: ['Use pulseIn(echoPin, HIGH) to measure echo duration', 'Convert: distance_cm = duration * 0.034 / 2', 'Minimum reliable range is ~2cm'],
    amazon_search: 'https://www.amazon.com/s?k=HC-SR04+ultrasonic+sensor+arduino',
  },
  {
    id: 'rgb-led',
    name: 'RGB LED',
    category: 'Output',
    emoji: '🌈',
    what_it_is: 'A single LED with three separate dies (red, green, blue) in one package. Mix colors by changing the brightness of each channel.',
    how_it_works: 'Common cathode type: shared GND, each color pin goes to a PWM pin through a resistor. analogWrite(0–255) on each to mix colors.',
    typical_uses: ['Color indicators', 'Mood lighting', 'Status display'],
    pins: ['R — red PWM pin (220Ω resistor)', 'G — green PWM pin (220Ω resistor)', 'B — blue PWM pin (220Ω resistor)', 'Common cathode — GND'],
    tips: ['Use analogWrite() for color mixing', 'analogWrite(redPin, 255) + analogWrite(greenPin, 255) = yellow', 'Common cathode is most common — the longest leg'],
    amazon_search: 'https://www.amazon.com/s?k=RGB+LED+common+cathode+arduino',
  },
  {
    id: 'lcd',
    name: 'LCD Display (16×2)',
    category: 'Output',
    emoji: '🖥️',
    what_it_is: 'A 16-character × 2-line character display. Shows text and numbers.',
    how_it_works: 'Uses the LiquidCrystal library. Can be wired in 4-bit or 8-bit mode. Often paired with a potentiometer for contrast adjustment.',
    typical_uses: ['Sensor readout display', 'Menu interfaces', 'Clocks and counters'],
    pins: ['VSS — GND', 'VDD — +5V', 'V0 — contrast (potentiometer wiper)', 'RS, EN, D4–D7 — data/control pins to Arduino'],
    tips: ['Use LiquidCrystal library: lcd.print("Hello!")', 'lcd.setCursor(col, row) to position cursor', 'Use a 10kΩ trimmer for contrast'],
    amazon_search: 'https://www.amazon.com/s?k=16x2+LCD+display+arduino+I2C',
  },
  {
    id: 'dht11',
    name: 'DHT11 Temp & Humidity',
    category: 'Input',
    emoji: '🌡️',
    what_it_is: 'A digital sensor that measures temperature (0–50°C) and relative humidity (20–90% RH).',
    how_it_works: 'Outputs a digital signal on a single data pin. Use the DHT library to decode it. Updates once per second.',
    typical_uses: ['Weather station', 'HVAC control', 'Environmental monitor'],
    pins: ['VCC — +5V or 3.3V', 'Data — any digital pin (add 10kΩ pull-up to VCC)', 'GND'],
    tips: ['Install the DHT sensor library by Adafruit', 'Use DHT dht(pin, DHT11); dht.readTemperature();', 'Takes ~1 second between readings'],
    amazon_search: 'https://www.amazon.com/s?k=DHT11+temperature+humidity+sensor+arduino',
  },
  {
    id: 'ir-receiver',
    name: 'IR Receiver',
    category: 'Input',
    emoji: '📺',
    what_it_is: 'A sensor that detects infrared light pulses from TV remotes and other IR transmitters.',
    how_it_works: 'Demodulates 38kHz IR signals and outputs a digital pin signal. Use the IRremote library to decode button codes.',
    typical_uses: ['Remote-controlled robot', 'IR-activated relay', 'Replicate TV remotes'],
    pins: ['OUT — signal to digital pin', 'GND', 'VCC — +5V'],
    tips: ['Use IRremote library: IrReceiver.decode()', 'Decode.value gives the button hex code', 'Works with most TV/stereo remotes'],
    amazon_search: 'https://www.amazon.com/s?k=VS1838B+IR+receiver+arduino',
  },
  {
    id: 'relay',
    name: 'Relay Module',
    category: 'Output',
    emoji: '⚡',
    what_it_is: 'An electrically-operated switch. A small Arduino signal switches a separate high-power circuit on or off.',
    how_it_works: 'Energizing the coil with 5V creates a magnetic field that flips a mechanical switch. The switched side can handle mains voltage or higher currents (check relay specs).',
    typical_uses: ['Control AC appliances', 'Motorized locks', 'Automated switches'],
    pins: ['IN — signal from Arduino (LOW or HIGH to trigger)', 'VCC — +5V', 'GND', 'NO/NC/COM — the switched circuit terminals'],
    tips: ['Most modules trigger on LOW signal', 'Add a flyback diode if driving coil directly', 'Never handle mains voltage without proper safety knowledge'],
    amazon_search: 'https://www.amazon.com/s?k=5V+relay+module+arduino',
  },
  {
    id: 'stepper',
    name: 'Stepper Motor',
    category: 'Output',
    emoji: '🔩',
    what_it_is: 'A motor that rotates in precise steps, allowing exact position control without feedback.',
    how_it_works: 'Energizing coil pairs in sequence causes the motor to step. A driver IC (like ULN2003 or A4988) handles the high current. Typical: 28BYJ-48 does 2048 steps per revolution.',
    typical_uses: ['3D printer axes', 'CNC machines', 'Precise positioning'],
    pins: ['Uses 4 control pins to motor driver', 'Driver handles motor power (5V or 12V)'],
    tips: ['Use Stepper library or AccelStepper for smooth movement', 'Power motor from external supply, not Arduino 5V', 'Set current limit on driver to protect motor'],
    amazon_search: 'https://www.amazon.com/s?k=28BYJ-48+stepper+motor+ULN2003+arduino',
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    category: 'Passive',
    emoji: '🔋',
    what_it_is: 'A component that stores and releases electrical charge. Used for filtering noise and stabilizing power.',
    how_it_works: 'Blocks DC but passes AC. A capacitor across power supply rails smooths out voltage spikes and dips caused by motors or other loads.',
    typical_uses: ['Power supply decoupling', 'Filter noise from motors', 'Timing circuits (with resistors)'],
    pins: ['Electrolytic: + leg (longer) and − leg (shorter, stripe)', 'Ceramic: no polarity'],
    tips: ['Always check voltage rating — use higher than your supply', 'Electrolytic caps have polarity — install correctly', '100µF near power, 100nF near ICs for decoupling'],
    common_values: '100nF (0.1µF) ceramic, 10µF, 100µF, 1000µF electrolytic',
    amazon_search: 'https://www.amazon.com/s?k=capacitor+assortment+kit+electrolytic+ceramic',
  },
]

const CATEGORIES = ['All', 'Input', 'Output', 'Passive']

export default function ComponentsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = COMPONENTS.filter(c => {
    const matchCat = activeCategory === 'All' || c.category === activeCategory
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.what_it_is.toLowerCase().includes(search.toLowerCase()) ||
      c.typical_uses.some(u => u.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Component Reference Library</h1>
          <p className="text-slate-500 text-sm">
            A plain-English guide to {COMPONENTS.length} common Arduino components. Search, browse, and learn what each part does and how to use it.
          </p>
        </div>

        {/* Search + filters */}
        <div className="bg-white border border-slate-200 rounded-md p-4 mb-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search components…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-slate-50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-400 mb-3">{filtered.length} component{filtered.length !== 1 ? 's' : ''}</p>

        {/* Component cards */}
        <div className="space-y-3">
          {filtered.map(comp => {
            const isOpen = expandedId === comp.id
            return (
              <div key={comp.id} className="bg-white border border-slate-200 rounded-md overflow-hidden">
                {/* Card header — always visible */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : comp.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl leading-none shrink-0">{comp.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-slate-900 text-sm">{comp.name}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{comp.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{comp.what_it_is}</p>
                  </div>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  }
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-5 space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">What it is</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{comp.what_it_is}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">How it works</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{comp.how_it_works}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Typical uses</h3>
                        <ul className="space-y-1">
                          {comp.typical_uses.map((u, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <span className="w-1 h-1 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                              {u}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Pins</h3>
                        <ul className="space-y-1">
                          {comp.pins.map((p, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tips</h3>
                      <ul className="space-y-1">
                        {comp.tips.map((t, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <Zap className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {comp.common_values && (
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-600">Common values: </span>{comp.common_values}
                      </div>
                    )}
                    {comp.amazon_search && (
                      <a
                        href={comp.amazon_search}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
                      >
                        Buy on Amazon →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No components match your search.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
