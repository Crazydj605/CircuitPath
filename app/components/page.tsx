'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, Zap, Lightbulb, Waves, Circle, Sliders, Cog, Sun, Bell, Radio, Palette, Monitor, Thermometer, Tv, Zap as ZapIcon, Bolt, Battery, Plug, Fan, Wifi, CreditCard, Sprout, Target, Sparkles, Gamepad2, Calculator, Database, Clock, Wind } from 'lucide-react'
import Navbar from '@/components/Navbar'
import AffiliateLink from '@/components/AffiliateLink'

type Component = {
  id: string
  name: string
  category: string
  icon: React.ComponentType<{ className?: string }>
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
    icon: Lightbulb,
    what_it_is: 'A Light Emitting Diode — a tiny light that only lets current flow in one direction.',
    how_it_works: 'When current flows from the longer leg (anode/+) to the shorter leg (cathode/−), it emits light. Always use a resistor in series to limit current.',
    typical_uses: ['Status indicator', 'Blink patterns', 'PWM dimming'],
    pins: ['Anode (+) — longer leg', 'Cathode (−) — shorter leg, flat side of housing'],
    tips: ['Always use a 220Ω–1kΩ resistor in series', 'Connect anode to Arduino pin, cathode to GND', 'Typical forward voltage: 2V for red, 3.3V for blue/white'],
    common_values: '5mm red, green, yellow, blue, white',
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=5mm+LED+assortment+arduino',
  },
  {
    id: 'resistor',
    name: 'Resistor',
    category: 'Passive',
    icon: Waves,
    what_it_is: 'A component that resists the flow of electricity, limiting current in a circuit.',
    how_it_works: 'Uses Ohm\'s Law: V = I × R. A higher resistance means less current for the same voltage. Color bands on the body encode the resistance value.',
    typical_uses: ['Protect LEDs from too much current', 'Pull-up / pull-down for buttons', 'Voltage dividers'],
    pins: ['No polarity — either leg can go either way'],
    tips: ['Use the resistor color code chart to read values', '220Ω for LEDs at 5V', '10kΩ for pull-up/down resistors'],
    common_values: '220Ω, 1kΩ, 4.7kΩ, 10kΩ',
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=resistor+kit+assortment+arduino',
  },
  {
    id: 'pushbutton',
    name: 'Pushbutton',
    category: 'Input',
    icon: Circle,
    what_it_is: 'A tactile switch that connects two pins when pressed and disconnects them when released.',
    how_it_works: 'Internally, legs on the same side are always connected. Pressing bridges the two sides. Use a pull-down resistor (10kΩ to GND) to get a stable LOW when not pressed.',
    typical_uses: ['User input', 'Menu navigation', 'Trigger events'],
    pins: ['Leg A & B (one side)', 'Leg C & D (other side) — pressing bridges A/B to C/D'],
    tips: ['Add a 10kΩ pull-down resistor between the signal pin and GND', 'Or use INPUT_PULLUP in Arduino and connect to GND instead', 'Debounce in software with a small delay or debounce library'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=tactile+pushbutton+switch+arduino+kit',
  },
  {
    id: 'potentiometer',
    name: 'Potentiometer',
    category: 'Input',
    icon: Sliders,
    what_it_is: 'A variable resistor with a knob. Turning the knob changes resistance between 0 and its max value.',
    how_it_works: 'Has three pins. Outer two connect to power and GND. The middle wiper pin outputs a voltage between 0V and 5V depending on knob position. Read with analogRead() (0–1023).',
    typical_uses: ['Volume/brightness control', 'Sensor calibration', 'Joystick axis'],
    pins: ['Pin 1 — +5V', 'Pin 2 (middle) — wiper/signal to analog pin', 'Pin 3 — GND'],
    tips: ['Use analogRead() which returns 0–1023', 'Map to a range with map(val, 0, 1023, 0, 255)', 'Common values: 10kΩ'],
    common_values: '10kΩ, 100kΩ',
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=10k+potentiometer+trimmer+arduino',
  },
  {
    id: 'servo',
    name: 'Servo Motor',
    category: 'Output',
    icon: Cog,
    what_it_is: 'A small motor that rotates to a precise angle (0–180°) based on a PWM signal.',
    how_it_works: 'Uses a control wire that receives PWM pulses. Pulse width between 1ms and 2ms maps to 0° and 180°. The Servo.h library handles this for you.',
    typical_uses: ['Robot arm joints', 'Pan/tilt camera', 'Steering mechanism'],
    pins: ['Brown/Black — GND', 'Red — +5V (use external power for multiple servos)', 'Orange/Yellow/White — signal to PWM pin'],
    tips: ['Use the Servo library: #include <Servo.h>', 'myServo.write(90) for 90 degrees', 'Power directly from 5V for one servo, external supply for more'],
    common_values: 'SG90 (9g micro), MG996R (high torque)',
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=SG90+servo+motor+arduino',
  },
  {
    id: 'ldr',
    name: 'LDR (Light Sensor)',
    category: 'Input',
    icon: Sun,
    what_it_is: 'Light Dependent Resistor — resistance changes based on light intensity. Bright = low resistance, dark = high resistance.',
    how_it_works: 'Used in a voltage divider with a fixed resistor. The midpoint voltage changes with light level and is read on an analog pin.',
    typical_uses: ['Automatic night light', 'Light-following robot', 'Ambient light sensing'],
    pins: ['No polarity — either leg can go either way'],
    tips: ['Build a voltage divider: 5V → LDR → analog pin → 10kΩ → GND', 'analogRead() returns 0 (dark) to 1023 (bright)', 'Resistance: ~1kΩ in bright light, ~1MΩ in darkness'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=LDR+photoresistor+light+sensor+arduino',
  },
  {
    id: 'buzzer',
    name: 'Piezo Buzzer',
    category: 'Output',
    icon: Bell,
    what_it_is: 'A small speaker that makes tones when given a PWM signal. Perfect for beeps, alarms, and simple melodies.',
    how_it_works: 'Active buzzers beep on their own when powered. Passive buzzers need a frequency signal from tone() to make different pitches.',
    typical_uses: ['Alarms and alerts', 'Musical notes', 'Game sound effects'],
    pins: ['+ (longer leg) — signal or +5V', '− (shorter leg) — GND'],
    tips: ['Use tone(pin, frequency) to play a note', 'Use noTone(pin) to stop', 'Frequency 262Hz = middle C, 440Hz = A4'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=passive+piezo+buzzer+arduino',
  },
  {
    id: 'ultrasonic',
    name: 'Ultrasonic Sensor (HC-SR04)',
    category: 'Input',
    icon: Radio,
    what_it_is: 'Measures distance by sending an ultrasonic pulse and timing the echo. Range: ~2cm to 400cm.',
    how_it_works: 'Send a 10µs HIGH pulse to the Trig pin. The sensor emits a burst of 40kHz sound. The Echo pin goes HIGH for as long as the sound takes to return. Distance = (duration × 0.034) / 2.',
    typical_uses: ['Obstacle avoidance robot', 'Parking sensor', 'Liquid level measurement'],
    pins: ['VCC — +5V', 'GND', 'Trig — output pin (trigger)', 'Echo — input pin (receives echo)'],
    tips: ['Use pulseIn(echoPin, HIGH) to measure echo duration', 'Convert: distance_cm = duration * 0.034 / 2', 'Minimum reliable range is ~2cm'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=HC-SR04+ultrasonic+sensor+arduino',
  },
  {
    id: 'rgb-led',
    name: 'RGB LED',
    category: 'Output',
    icon: Palette,
    what_it_is: 'A single LED with three separate dies (red, green, blue) in one package. Mix colors by changing the brightness of each channel.',
    how_it_works: 'Common cathode type: shared GND, each color pin goes to a PWM pin through a resistor. analogWrite(0–255) on each to mix colors.',
    typical_uses: ['Color indicators', 'Mood lighting', 'Status display'],
    pins: ['R — red PWM pin (220Ω resistor)', 'G — green PWM pin (220Ω resistor)', 'B — blue PWM pin (220Ω resistor)', 'Common cathode — GND'],
    tips: ['Use analogWrite() for color mixing', 'analogWrite(redPin, 255) + analogWrite(greenPin, 255) = yellow', 'Common cathode is most common — the longest leg'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=RGB+LED+common+cathode+arduino',
  },
  {
    id: 'lcd',
    name: 'LCD Display (16×2)',
    category: 'Output',
    icon: Monitor,
    what_it_is: 'A 16-character × 2-line character display. Shows text and numbers.',
    how_it_works: 'Uses the LiquidCrystal library. Can be wired in 4-bit or 8-bit mode. Often paired with a potentiometer for contrast adjustment.',
    typical_uses: ['Sensor readout display', 'Menu interfaces', 'Clocks and counters'],
    pins: ['VSS — GND', 'VDD — +5V', 'V0 — contrast (potentiometer wiper)', 'RS, EN, D4–D7 — data/control pins to Arduino'],
    tips: ['Use LiquidCrystal library: lcd.print("Hello!")', 'lcd.setCursor(col, row) to position cursor', 'Use a 10kΩ trimmer for contrast'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=16x2+LCD+display+arduino+I2C',
  },
  {
    id: 'dht11',
    name: 'DHT11 Temp & Humidity',
    category: 'Input',
    icon: Thermometer,
    what_it_is: 'A digital sensor that measures temperature (0–50°C) and relative humidity (20–90% RH).',
    how_it_works: 'Outputs a digital signal on a single data pin. Use the DHT library to decode it. Updates once per second.',
    typical_uses: ['Weather station', 'HVAC control', 'Environmental monitor'],
    pins: ['VCC — +5V or 3.3V', 'Data — any digital pin (add 10kΩ pull-up to VCC)', 'GND'],
    tips: ['Install the DHT sensor library by Adafruit', 'Use DHT dht(pin, DHT11); dht.readTemperature();', 'Takes ~1 second between readings'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=DHT11+temperature+humidity+sensor+arduino',
  },
  {
    id: 'ir-receiver',
    name: 'IR Receiver',
    category: 'Input',
    icon: Tv,
    what_it_is: 'A sensor that detects infrared light pulses from TV remotes and other IR transmitters.',
    how_it_works: 'Demodulates 38kHz IR signals and outputs a digital pin signal. Use the IRremote library to decode button codes.',
    typical_uses: ['Remote-controlled robot', 'IR-activated relay', 'Replicate TV remotes'],
    pins: ['OUT — signal to digital pin', 'GND', 'VCC — +5V'],
    tips: ['Use IRremote library: IrReceiver.decode()', 'Decode.value gives the button hex code', 'Works with most TV/stereo remotes'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=VS1838B+IR+receiver+arduino',
  },
  {
    id: 'relay',
    name: 'Relay Module',
    category: 'Output',
    icon: ZapIcon,
    what_it_is: 'An electrically-operated switch. A small Arduino signal switches a separate high-power circuit on or off.',
    how_it_works: 'Energizing the coil with 5V creates a magnetic field that flips a mechanical switch. The switched side can handle mains voltage or higher currents (check relay specs).',
    typical_uses: ['Control AC appliances', 'Motorized locks', 'Automated switches'],
    pins: ['IN — signal from Arduino (LOW or HIGH to trigger)', 'VCC — +5V', 'GND', 'NO/NC/COM — the switched circuit terminals'],
    tips: ['Most modules trigger on LOW signal', 'Add a flyback diode if driving coil directly', 'Never handle mains voltage without proper safety knowledge'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=5V+relay+module+arduino',
  },
  {
    id: 'stepper',
    name: 'Stepper Motor',
    category: 'Output',
    icon: Bolt,
    what_it_is: 'A motor that rotates in precise steps, allowing exact position control without feedback.',
    how_it_works: 'Energizing coil pairs in sequence causes the motor to step. A driver IC (like ULN2003 or A4988) handles the high current. Typical: 28BYJ-48 does 2048 steps per revolution.',
    typical_uses: ['3D printer axes', 'CNC machines', 'Precise positioning'],
    pins: ['Uses 4 control pins to motor driver', 'Driver handles motor power (5V or 12V)'],
    tips: ['Use Stepper library or AccelStepper for smooth movement', 'Power motor from external supply, not Arduino 5V', 'Set current limit on driver to protect motor'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=28BYJ-48+stepper+motor+ULN2003+arduino',
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    category: 'Passive',
    icon: Battery,
    what_it_is: 'A component that stores and releases electrical charge. Used for filtering noise and stabilizing power.',
    how_it_works: 'Blocks DC but passes AC. A capacitor across power supply rails smooths out voltage spikes and dips caused by motors or other loads.',
    typical_uses: ['Power supply decoupling', 'Filter noise from motors', 'Timing circuits (with resistors)'],
    pins: ['Electrolytic: + leg (longer) and − leg (shorter, stripe)', 'Ceramic: no polarity'],
    tips: ['Always check voltage rating — use higher than your supply', 'Electrolytic caps have polarity — install correctly', '100µF near power, 100nF near ICs for decoupling'],
    common_values: '100nF (0.1µF) ceramic, 10µF, 100µF, 1000µF electrolytic',
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=capacitor+assortment+kit+electrolytic+ceramic',
  },
  {
    id: 'transistor-npn',
    name: 'NPN Transistor (2N2222)',
    category: 'Passive',
    icon: Plug,
    what_it_is: 'A three-pin semiconductor that uses a small base current to switch or amplify a larger collector current.',
    how_it_works: 'When you apply a small current to the Base pin, it allows a much larger current to flow from Collector to Emitter. Acts as an electronic switch controlled by your Arduino.',
    typical_uses: ['Switch motors or LEDs from a digital pin', 'Drive relays without a module', 'Signal amplification'],
    pins: ['Base (B) — control signal from Arduino via resistor', 'Collector (C) — connects to load +', 'Emitter (E) — connects to GND'],
    tips: ['Always put a 1kΩ resistor between Arduino pin and the Base', 'Add a flyback diode when switching inductive loads like motors', 'Common NPN alternatives: BC547, 2N3904'],
    common_values: '2N2222, BC547, 2N3904',
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=2N2222+NPN+transistor+arduino',
  },
  {
    id: 'diode-1n4007',
    name: 'Rectifier Diode (1N4007)',
    category: 'Passive',
    icon: Zap,
    what_it_is: 'A one-way valve for electricity. Current flows from anode (+) to cathode (−) but not the other direction.',
    how_it_works: 'The diode has a ~0.7V forward voltage drop when conducting. Used as a flyback diode across motors/relays to absorb the voltage spike when they are switched off.',
    typical_uses: ['Flyback protection on motors and relays', 'Reverse polarity protection', 'Rectifying AC to DC'],
    pins: ['Anode (A) — positive side (no stripe)', 'Cathode (K) — negative side (silver stripe)'],
    tips: ['Silver stripe = cathode', 'Place across motor terminals with cathode to +V to clamp back-EMF', 'Forward voltage is ~0.7V — factor this into your design'],
    common_values: '1N4007 (1A 1000V), 1N4148 (signal diode)',
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=1N4007+diode+kit+arduino',
  },
  {
    id: 'dc-motor-l298n',
    name: 'DC Motor + L298N Driver',
    category: 'Output',
    icon: Fan,
    what_it_is: 'A DC motor spins continuously when powered. The L298N driver lets you control speed and direction from an Arduino without frying it.',
    how_it_works: 'The L298N is an H-bridge driver. Two direction pins (IN1/IN2) control spin direction; an enable pin with PWM controls speed. The driver handles the high current the motor needs.',
    typical_uses: ['Robot wheels', 'Conveyor belts', 'Fan control'],
    pins: ['IN1, IN2 — direction control to Arduino digital pins', 'ENA — speed PWM from Arduino', 'OUT1, OUT2 — connect to motor terminals', 'VCC/GND — motor power supply'],
    tips: ['Use a separate power supply for the motor, not Arduino 5V', 'IN1=HIGH IN2=LOW spins one way; swap for other direction', 'analogWrite(ENA, 0–255) to control speed'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=L298N+motor+driver+module+arduino',
  },
  {
    id: 'oled-ssd1306',
    name: 'OLED Display (SSD1306)',
    category: 'Output',
    icon: Monitor,
    what_it_is: 'A crisp 128×64 pixel black-and-white display that connects via I2C using just two wires.',
    how_it_works: 'Uses the SSD1306 controller over I2C. Wire SDA to A4 and SCL to A5. The Adafruit SSD1306 library gives you functions to draw text, shapes, and bitmaps.',
    typical_uses: ['Sensor dashboards', 'Menus and UI', 'Portable device displays'],
    pins: ['SDA — A4 on Uno', 'SCL — A5 on Uno', 'VCC — 3.3V (some accept 5V)', 'GND'],
    tips: ['Default I2C address is 0x3C (some boards use 0x3D)', 'Call oled.display() after drawing to push buffer to screen', 'Use oled.clearDisplay() then redraw to avoid ghosting'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=SSD1306+OLED+128x64+I2C+arduino',
  },
  {
    id: 'bluetooth-hc05',
    name: 'Bluetooth Module (HC-05)',
    category: 'Communication',
    icon: Wifi,
    what_it_is: 'A Bluetooth 2.0 serial module that lets your Arduino communicate wirelessly with a phone or PC.',
    how_it_works: 'The HC-05 creates a serial port over Bluetooth. It connects to Arduino TX/RX pins. Your phone app sends data that appears on Serial as if it were typed — no extra coding.',
    typical_uses: ['Wireless sensor monitoring', 'Phone-controlled robot', 'Serial data logging'],
    pins: ['VCC — 5V', 'GND', 'TXD — connect to Arduino RX (pin 0 or SoftwareSerial)', 'RXD — connect to Arduino TX via voltage divider (5V→3.3V)'],
    tips: ['Default baud rate: 9600. Default pairing PIN: 1234', 'Use a 1kΩ/2kΩ voltage divider on the Arduino TX line to the HC-05 RX pin', 'Use SoftwareSerial to avoid conflicts with the USB serial port'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=HC-05+bluetooth+module+arduino',
  },
  {
    id: 'rfid-rc522',
    name: 'RFID Reader (RC522)',
    category: 'Communication',
    icon: CreditCard,
    what_it_is: 'Reads and writes 13.56 MHz RFID cards and key fobs. Used for access control, identification, and tagging.',
    how_it_works: 'The RC522 communicates with Arduino over SPI. Each card has a unique 4-byte UID. The MFRC522 library reads the UID in a few lines of code.',
    typical_uses: ['Access control', 'Attendance systems', 'Object identification'],
    pins: ['SDA → pin 10 (SPI CS)', 'SCK → pin 13', 'MOSI → pin 11', 'MISO → pin 12', 'RST → pin 9', 'VCC → 3.3V', 'GND'],
    tips: ['Power from 3.3V NOT 5V — the RC522 is not 5V tolerant', 'Install the MFRC522 library from Library Manager', 'Each card UID is permanent and unique'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=RC522+RFID+reader+module+arduino',
  },
  {
    id: 'soil-moisture',
    name: 'Soil Moisture Sensor',
    category: 'Input',
    icon: Sprout,
    what_it_is: 'Two probes measure the resistance of soil. Wet soil conducts better, so a lower resistance means more moisture.',
    how_it_works: 'Current flows between the two probes through the soil. The module outputs an analog voltage proportional to moisture and a digital output when moisture drops below a threshold (set by the onboard trim pot).',
    typical_uses: ['Automatic plant watering', 'Garden monitoring', 'Soil science experiments'],
    pins: ['VCC — 3.3V or 5V', 'GND', 'A0 — analog output (0=wet, 1023=dry)', 'D0 — digital threshold output'],
    tips: ['Read analog for precise values; digital for simple wet/dry', 'The probes corrode over time — use stainless steel probes for longevity', 'Map 0–1023 to a percentage: map(val, 0, 1023, 100, 0)'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=soil+moisture+sensor+module+arduino',
  },
  {
    id: 'mpu6050',
    name: 'MPU-6050 Gyro/Accelerometer',
    category: 'Input',
    icon: Target,
    what_it_is: 'A 6-axis IMU that measures acceleration on X/Y/Z axes and rotation rate on X/Y/Z axes, all over I2C.',
    how_it_works: 'Connects via I2C (address 0x68). Raw 16-bit values represent g-force and degrees/second. Libraries like MPU6050 or I2Cdev handle the math for you.',
    typical_uses: ['Self-balancing robot', 'Drone flight controller', 'Gesture detection'],
    pins: ['SDA → A4', 'SCL → A5', 'VCC → 3.3V or 5V', 'GND', 'INT → optional interrupt pin'],
    tips: ['Default I2C address is 0x68 (AD0 LOW) or 0x69 (AD0 HIGH)', 'Calibrate offsets before use — the sensor drifts without calibration', 'Use the Mahony or Madgwick filter for stable angle estimation'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=MPU-6050+gyroscope+accelerometer+arduino',
  },
  {
    id: 'neopixel-ws2812b',
    name: 'NeoPixel (WS2812B)',
    category: 'Output',
    icon: Sparkles,
    what_it_is: 'An addressable RGB LED strip where each LED has its own controller chip. Control thousands of LEDs with a single Arduino pin.',
    how_it_works: 'Data is sent as a serial stream of RGB values. Each LED reads its own color and passes the rest down the chain. The FastLED or Adafruit NeoPixel library abstracts all timing.',
    typical_uses: ['Animated lighting effects', 'Status strips', 'Decorative projects'],
    pins: ['DIN — data in to any Arduino digital pin', 'VCC — 5V (external power for >10 LEDs)', 'GND'],
    tips: ['Add a 300–500Ω resistor in series with the data line', 'Add a 1000µF capacitor across power to prevent voltage spikes', 'Each LED draws up to 60mA at full white — use external power for long strips'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=WS2812B+NeoPixel+LED+strip+arduino',
  },
  {
    id: 'joystick-module',
    name: 'Joystick Module',
    category: 'Input',
    icon: Gamepad2,
    what_it_is: 'A two-axis analog joystick with a built-in click button. Outputs X and Y voltages plus a digital select signal.',
    how_it_works: 'Two potentiometers inside track X and Y position (0–1023 on each axis, 512 at center). The center button outputs LOW when pressed. Connect to two analog pins and one digital pin.',
    typical_uses: ['Robot control', 'Game controllers', 'Pan/tilt camera movement'],
    pins: ['VCC — 5V', 'GND', 'VRX — X axis to analog pin (A0)', 'VRY — Y axis to analog pin (A1)', 'SW — button to digital pin (INPUT_PULLUP)'],
    tips: ['Center reading is ~512 — add a dead zone of ±50 to ignore drift', 'SW pin uses internal pull-up — reads LOW when pressed', 'Use map() to convert 0–1023 to your desired range'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=joystick+module+arduino+analog',
  },
  {
    id: 'seven-segment',
    name: '7-Segment Display',
    category: 'Output',
    icon: Calculator,
    what_it_is: 'A display with 7 LED segments arranged to show digits 0–9 and some letters.',
    how_it_works: 'Each segment is an individual LED. Common cathode type: shared GND, each segment has its own pin. Turn segments on/off in the right pattern to show a digit. Use a shift register (74HC595) or MAX7219 for multiple digits.',
    typical_uses: ['Score counters', 'Clocks and timers', 'Numeric readouts'],
    pins: ['a–g — one pin per segment (with 220Ω resistors)', 'Common cathode — GND (or common anode — 5V)'],
    tips: ['Common cathode: segment pin HIGH = on. Common anode: segment pin LOW = on', 'Use a MAX7219 driver to control 8 digits with just 3 Arduino pins', 'Segment pattern for "0": a,b,c,d,e,f on, g off'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=7+segment+display+arduino+MAX7219',
  },
  {
    id: 'keypad-4x4',
    name: '4×4 Matrix Keypad',
    category: 'Input',
    icon: Database,
    what_it_is: 'A 16-button keypad (4 rows × 4 columns) that uses only 8 Arduino pins via matrix scanning.',
    how_it_works: 'Rows are outputs, columns are inputs with pull-ups. The Arduino sets one row LOW at a time and checks which column reads LOW — that tells you which button is pressed.',
    typical_uses: ['PIN entry', 'Calculator interface', 'Menu navigation'],
    pins: ['R1–R4 — row pins to Arduino digital outputs', 'C1–C4 — column pins to Arduino digital inputs'],
    tips: ['Use the Keypad library — it handles all the scanning for you', 'Keypad k(keymap, rowPins, colPins, 4, 4) — define your key layout', 'Add debounce by checking getKey() returns a char before acting'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=4x4+matrix+keypad+membrane+arduino',
  },
  {
    id: 'sd-card-module',
    name: 'SD Card Module',
    category: 'Storage',
    icon: Database,
    what_it_is: 'Lets your Arduino read and write files on a standard micro SD card over SPI.',
    how_it_works: 'Uses the SPI bus (pins 10–13 on Uno). The SD library provides File objects — open, read, write, and close like a basic file system.',
    typical_uses: ['Data logging', 'Config file storage', 'Audio file playback'],
    pins: ['CS → pin 10 (SPI chip select)', 'MOSI → pin 11', 'MISO → pin 12', 'CLK → pin 13', 'VCC → 5V', 'GND'],
    tips: ['Format the SD card as FAT32 before use', 'Always close files after writing to prevent corruption', 'SD.begin(10) initializes with CS on pin 10'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=micro+SD+card+module+arduino+SPI',
  },
  {
    id: 'ds3231-rtc',
    name: 'DS3231 Real-Time Clock',
    category: 'Storage',
    icon: Clock,
    what_it_is: 'A battery-backed clock module that keeps accurate time (±2 ppm) even when your Arduino is powered off.',
    how_it_works: 'Connects via I2C. Stores seconds, minutes, hours, day, date, month, and year in internal registers. The coin cell battery keeps it running for years without Arduino power.',
    typical_uses: ['Timestamping sensor logs', 'Alarm clocks', 'Scheduled automation'],
    pins: ['SDA → A4', 'SCL → A5', 'VCC → 3.3V–5.5V', 'GND', 'SQW — optional 1Hz square wave output'],
    tips: ['Install the RTClib library by Adafruit', 'Set time once: RTC.adjust(DateTime(F(__DATE__), F(__TIME__)))', 'DS3231 is far more accurate than the DS1307 — worth the small price difference'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=DS3231+real+time+clock+module+arduino',
  },
  {
    id: 'mq2-gas-sensor',
    name: 'MQ-2 Gas Sensor',
    category: 'Input',
    icon: Wind,
    what_it_is: 'Detects combustible gases (LPG, propane, methane) and smoke. Useful for safety and air quality projects.',
    how_it_works: 'A heated metal-oxide sensing element changes resistance when exposed to certain gases. The module outputs an analog voltage proportional to gas concentration and a digital alarm when a threshold is reached.',
    typical_uses: ['Gas leak detector', 'Smoke alarm', 'Air quality monitor'],
    pins: ['VCC — 5V', 'GND', 'A0 — analog gas concentration output', 'D0 — digital alarm output (threshold set by trim pot)'],
    tips: ['Allow 20–30 seconds warm-up time for accurate readings', 'Use analog output for concentration; digital output for threshold alarm', 'Adjust the onboard trim pot to set the alarm threshold'],
    amazon_search: 'https://www.amazon.com/s?tag=circuitpath-20&k=MQ-2+gas+sensor+module+arduino',
  },
]

const CATEGORIES = ['All', 'Input', 'Output', 'Passive', 'Communication', 'Storage']

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
            const IconComponent = comp.icon
            return (
              <div key={comp.id} className="bg-white border border-slate-200 rounded-md overflow-hidden">
                {/* Card header — always visible */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : comp.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl leading-none shrink-0">
                    <IconComponent className="w-6 h-6 text-slate-600" />
                  </span>
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
                      <AffiliateLink
                        href={comp.amazon_search}
                        product={`component:${comp.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
                      >
                        Buy on Amazon →
                      </AffiliateLink>
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
