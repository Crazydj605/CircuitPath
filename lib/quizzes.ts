export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface LessonSummary {
  whatYouBuilt: string
  keyConcepts: Array<{ term: string; definition: string }>
}

export const LESSON_QUIZZES: Record<string, QuizQuestion[]> = {
  'blink-led': [
    {
      question: 'Which leg of an LED is the anode (positive side)?',
      options: ['The short leg', 'The long leg', 'Both legs are the same', 'The bent leg'],
      correctIndex: 1,
      explanation: 'The long leg is the anode — the positive side. Connect it toward power through a resistor. "Long = Plus" is the rule to remember.'
    },
    {
      question: 'What happens if you wire an LED directly to a pin with no resistor?',
      options: ['It glows brighter than normal', 'Nothing — it is safe', 'It burns out from too much current', 'It blinks faster'],
      correctIndex: 2,
      explanation: 'Without a resistor, too much current flows through the LED and it burns out in seconds — sometimes damaging the Arduino pin with it.'
    },
    {
      question: 'What does the setup() function do in an Arduino sketch?',
      options: ['Runs forever in a loop', 'Runs once when the board powers on', 'Controls LED brightness', 'Opens a serial connection automatically'],
      correctIndex: 1,
      explanation: 'setup() runs exactly once when the Arduino powers on or is reset. Use it for one-time configuration tasks like pinMode().'
    },
    {
      question: 'What does delay(1000) do in your sketch?',
      options: ['Blinks the LED 1000 times', 'Waits 1 second (1000 ms)', 'Sets the pin to HIGH for 1000 cycles', 'Speeds up the loop 1000x'],
      correctIndex: 1,
      explanation: 'delay(1000) pauses the program for 1000 milliseconds, which equals exactly 1 second.'
    },
    {
      question: 'Which function sends 5V (HIGH) or 0V (LOW) to a digital pin?',
      options: ['analogWrite()', 'pinMode()', 'Serial.print()', 'digitalWrite()'],
      correctIndex: 3,
      explanation: 'digitalWrite(pin, HIGH) sends 5V to turn the LED on. digitalWrite(pin, LOW) drops to 0V to turn it off.'
    },
  ],
  'button-input': [
    {
      question: 'What does "normally open" mean for a pushbutton?',
      options: ['The button is always sending power', 'The circuit is broken by default — no current flows until pressed', 'The button is already held down', 'The input pin always reads HIGH'],
      correctIndex: 1,
      explanation: 'Normally open means the circuit is broken by default. No current flows until you physically press the button and close the circuit.'
    },
    {
      question: 'What happens when an input pin is "floating"?',
      options: ['The LED glows dimly', 'The pin randomly reads 0 or 1 from electrical noise', 'The code stops running', 'The Arduino resets automatically'],
      correctIndex: 1,
      explanation: 'A floating pin is not connected to anything, so electrical noise causes it to randomly flip between 0 and 1 — making it useless for reliable button detection.'
    },
    {
      question: 'Where does a pull-down resistor connect?',
      options: ['Between 5V and the input pin', 'Between the input pin and GND', 'Across the button legs', 'Between two signal pins'],
      correctIndex: 1,
      explanation: 'A pull-down resistor connects from the input pin to GND. It holds the pin at a stable LOW (0) when the button is not pressed.'
    },
    {
      question: 'What does digitalRead() return when the button is pressed (with a pull-down resistor)?',
      options: ['0', '1', '5', '255'],
      correctIndex: 1,
      explanation: 'When pressed, 5V connects directly to the pin — digitalRead returns 1 (HIGH). The pull-down holds it at 0 when not pressed.'
    },
    {
      question: 'What is the standard pull-down resistor value used in this lesson?',
      options: ['220 Ω', '1 kΩ', '10 kΩ', '100 kΩ'],
      correctIndex: 2,
      explanation: '10 kΩ is the standard value — high enough not to waste current, low enough to hold the pin firmly at 0V when the button is not pressed.'
    },
  ],
  'pwm-fade-led': [
    {
      question: 'What does PWM stand for?',
      options: ['Power Width Management', 'Pulse Width Modulation', 'Pin Write Mode', 'Programmable Waveform Module'],
      correctIndex: 1,
      explanation: 'PWM stands for Pulse Width Modulation — switching a pin on/off very fast to simulate different voltage levels.'
    },
    {
      question: 'How does PWM create the illusion of dimming an LED?',
      options: ['It physically reduces the pin voltage', 'It switches the pin on and off faster than your eye can detect', 'It uses a smaller resistor value', 'It changes the LED color filter'],
      correctIndex: 1,
      explanation: 'The pin switches on/off ~490 times per second. Your eye averages the on/off time and perceives it as a middle brightness. More on-time = brighter.'
    },
    {
      question: 'What analogWrite() value produces full LED brightness?',
      options: ['0', '127', '200', '255'],
      correctIndex: 3,
      explanation: 'analogWrite(pin, 255) means 100% duty cycle — the pin is always ON. This gives maximum brightness.'
    },
    {
      question: 'Which pins on the Arduino Uno support PWM?',
      options: ['All 14 digital pins', 'Only pins 0 and 1', 'Pins 3, 5, 6, 9, 10, 11', 'Only the analog pins A0–A5'],
      correctIndex: 2,
      explanation: 'Only 6 pins support PWM on the Uno: 3, 5, 6, 9, 10, and 11. They are marked with a ~ symbol on the board.'
    },
    {
      question: 'What is "duty cycle" in a PWM signal?',
      options: ['How many loop iterations run per second', 'The percentage of time the signal is HIGH in each cycle', 'The delay value between brightness steps', 'The number of LEDs the pin can drive'],
      correctIndex: 1,
      explanation: 'Duty cycle is the percentage of time the signal is ON (HIGH). 50% looks like 50% brightness. 100% is fully on, 0% is fully off.'
    },
  ],
  'serial-monitor': [
    {
      question: 'What is the Serial Monitor used for?',
      options: ['Uploading new code to the Arduino', 'Viewing data sent from the Arduino in real time', 'Drawing circuit schematics', 'Measuring current and voltage'],
      correctIndex: 1,
      explanation: 'The Serial Monitor is a terminal in the Arduino IDE. It displays text and numbers your Arduino sends through the USB cable while the program runs.'
    },
    {
      question: 'What must match between Serial.begin() in code and the Serial Monitor window?',
      options: ['The pin number', 'The baud rate', 'The variable name used', 'The delay() value'],
      correctIndex: 1,
      explanation: 'The baud rate (e.g. 9600) must be identical in both Serial.begin(9600) in your code and the baud dropdown in the Serial Monitor. A mismatch produces garbled symbols.'
    },
    {
      question: 'What does Serial.println() do differently from Serial.print()?',
      options: ['It prints in a larger font', 'It adds a line break after the output', 'It prints the output in reverse', 'It sends data to an LED instead'],
      correctIndex: 1,
      explanation: 'println() adds a line break after the output, moving to the next line. print() stays on the same line. Chain print() calls and end with one println().'
    },
    {
      question: 'What is the most commonly used baud rate in Arduino projects?',
      options: ['115200', '4800', '9600', '1200'],
      correctIndex: 2,
      explanation: '9600 baud is the standard starting point for Arduino serial communication. It works reliably on all boards and USB chipsets.'
    },
    {
      question: 'In the counting sketch, what does counter++ do each time loop() runs?',
      options: ['Resets the counter back to zero', 'Prints the counter to the serial monitor', 'Adds 1 to the counter variable', 'Multiplies the counter by 2'],
      correctIndex: 2,
      explanation: 'counter++ is shorthand for counter = counter + 1. Each loop iteration increments the counter by 1, producing the climbing numbers you see in the monitor.'
    },
  ],
  'servo-motor': [
    {
      question: 'How many wires does a standard hobby servo motor have?',
      options: ['2', '3', '4', '6'],
      correctIndex: 1,
      explanation: 'A servo has exactly 3 wires: Red (5V power), Brown or Black (GND), and Orange/Yellow/White (PWM signal).'
    },
    {
      question: 'What does myServo.attach(9) do in your sketch?',
      options: ['Moves the servo arm to 9 degrees', 'Tells the Servo library the signal wire is on pin 9', 'Connects the servo to a 9V power source', 'Sets the servo sweep speed to 9'],
      correctIndex: 1,
      explanation: 'attach() tells the Servo library which Arduino pin your servo signal wire is connected to. After this call, the library manages that pin automatically.'
    },
    {
      question: 'Which function moves a servo to a specific angle?',
      options: ['myServo.move()', 'myServo.set()', 'myServo.write()', 'myServo.go()'],
      correctIndex: 2,
      explanation: 'myServo.write(angle) commands the servo to rotate to the specified angle (0–180 degrees) and hold that position.'
    },
    {
      question: 'What does constrain(angle, 0, 180) do?',
      options: ['Locks the servo at 180 degrees', 'Limits the angle value to between 0 and 180', 'Speeds up the servo movement', 'Reverses the sweep direction'],
      correctIndex: 1,
      explanation: 'constrain() clamps a value within a min/max range. If you type 200, constrain(angle, 0, 180) returns 180 — preventing impossible commands.'
    },
    {
      question: 'What is the valid angle range for myServo.write()?',
      options: ['0 to 90 degrees', '0 to 255 degrees', '0 to 180 degrees', '1 to 360 degrees'],
      correctIndex: 2,
      explanation: 'myServo.write() accepts 0 to 180 degrees. 0 is one end of travel, 90 is centre, and 180 is the other end.'
    },
  ],
  'analog-sensor': [
    {
      question: 'What range of values does analogRead() return?',
      options: ['0 to 255', '0 to 512', '0 to 1023', '0 to 4095'],
      correctIndex: 2,
      explanation: 'analogRead returns 0 to 1023 — a 10-bit range. 0 = 0V on the pin, 1023 = 5V on the pin.'
    },
    {
      question: 'Which pin on a potentiometer connects to the Arduino analog input?',
      options: ['The left outer pin', 'The right outer pin', 'The middle pin (wiper)', 'Any of the three pins work'],
      correctIndex: 2,
      explanation: 'The middle pin is the wiper — it slides along the resistive track and produces a variable voltage as you turn the knob. The outer pins connect to 5V and GND.'
    },
    {
      question: 'What does the map() function do?',
      options: ['Displays a circuit diagram on the serial monitor', 'Scales a value from one numeric range to another', 'Reads an analog sensor value directly', 'Sets the LED brightness directly'],
      correctIndex: 1,
      explanation: 'map(value, fromLow, fromHigh, toLow, toHigh) scales a number from one range to another. For example, map(sensorValue, 0, 1023, 0, 180) converts a pot reading to a servo angle.'
    },
    {
      question: 'How many bits is the Arduino Uno\'s analog-to-digital converter (ADC)?',
      options: ['8 bits (0–255)', '10 bits (0–1023)', '12 bits (0–4095)', '16 bits (0–65535)'],
      correctIndex: 1,
      explanation: 'The Uno has a 10-bit ADC — 2^10 = 1024 possible values (0 through 1023). More bits means finer resolution and more precise readings.'
    },
    {
      question: 'What causes small ±1 or ±2 fluctuations in analogRead even when the pot is held still?',
      options: ['A loose potentiometer connection', 'Normal ADC jitter from electrical noise', 'The Arduino overheating', 'The baud rate being too high'],
      correctIndex: 1,
      explanation: 'ADC jitter is small fluctuations caused by normal electrical noise in the circuit and ADC hardware. It is expected and harmless for most practical projects.'
    },
  ],
}

export const LESSON_SUMMARIES: Record<string, LessonSummary> = {
  'blink-led': {
    whatYouBuilt: 'You built a circuit that blinks an LED on and off using an Arduino, a current-limiting resistor, and your first ever Arduino sketch.',
    keyConcepts: [
      { term: 'Anode (long leg)', definition: 'The positive side of an LED. Connect it toward power through a resistor. Short leg = cathode = GND.' },
      { term: 'Resistor', definition: 'Limits current flow to protect the LED from burning out. Without it, the LED fries in seconds.' },
      { term: 'Ohm\'s Law', definition: 'Current = Voltage ÷ Resistance. Used to calculate the correct resistor value for any LED circuit.' },
      { term: 'setup()', definition: 'Runs once when the Arduino powers on. Use it for one-time setup tasks like pinMode().' },
      { term: 'loop()', definition: 'Runs forever after setup() finishes. All repeating behavior lives here.' },
      { term: 'digitalWrite() / delay()', definition: 'digitalWrite sends HIGH (5V) or LOW (0V) to a pin. delay() pauses the program for a number of milliseconds.' },
    ]
  },
  'button-input': {
    whatYouBuilt: 'You wired a pushbutton with a pull-down resistor and printed its press state (0 or 1) to the Serial Monitor in real time.',
    keyConcepts: [
      { term: 'Normally Open (NO)', definition: 'Default state of a pushbutton — the circuit is broken. Current only flows when you press it.' },
      { term: 'Floating Input', definition: 'A pin not connected to anything. Electrical noise makes it randomly read 0 or 1 — unusable.' },
      { term: 'Pull-down Resistor (10 kΩ)', definition: 'Connects from the input pin to GND. Holds the pin at a stable 0V when the button is not pressed.' },
      { term: 'digitalRead()', definition: 'Reads a digital pin — returns 1 (HIGH) if 5V is present, or 0 (LOW) if connected to GND.' },
      { term: 'Serial Monitor', definition: 'A tool in the Arduino IDE for viewing live data from your board over the USB cable.' },
    ]
  },
  'pwm-fade-led': {
    whatYouBuilt: 'You made an LED smoothly fade from fully off to fully on and back — using PWM to simulate variable brightness from a pin that can only be fully on or fully off.',
    keyConcepts: [
      { term: 'PWM (Pulse Width Modulation)', definition: 'Rapidly switching a pin on and off to create the illusion of a voltage between 0V and 5V.' },
      { term: 'Duty Cycle', definition: 'The percentage of time the signal is HIGH. 50% duty cycle = LED appears 50% bright.' },
      { term: 'analogWrite(pin, value)', definition: 'Outputs a PWM signal. Value 0 = fully off, 255 = fully on, anything between = partial brightness.' },
      { term: 'PWM Pins', definition: 'Only pins 3, 5, 6, 9, 10, 11 on the Uno support PWM. They are marked with ~ on the board.' },
      { term: 'for loop', definition: 'Repeats a block of code a set number of times. Used here to count from 0 to 255 and create the smooth fade.' },
    ]
  },
  'serial-monitor': {
    whatYouBuilt: 'You sent live data from your Arduino to your computer using the Serial Monitor — a fundamental tool you will use in every single future project.',
    keyConcepts: [
      { term: 'Serial Monitor', definition: 'A terminal in the Arduino IDE. Displays text and numbers sent from your board over USB in real time.' },
      { term: 'Serial.begin(9600)', definition: 'Opens serial communication at 9600 bits per second. Must be called first in setup().' },
      { term: 'Baud Rate', definition: 'The speed of serial communication. Must match between Serial.begin() in your code and the dropdown in the Serial Monitor.' },
      { term: 'Serial.print()', definition: 'Sends data to the monitor and stays on the same line.' },
      { term: 'Serial.println()', definition: 'Sends data and moves to the next line. Use this as the last call when building a line of output.' },
    ]
  },
  'servo-motor': {
    whatYouBuilt: 'You connected a hobby servo and controlled its position precisely — first with an automatic sweep, then by typing target angles via the Serial Monitor.',
    keyConcepts: [
      { term: 'Servo Motor', definition: 'A motor with built-in position feedback. Tell it an angle and it rotates there and holds, even under resistance.' },
      { term: 'Servo Library', definition: 'A built-in Arduino library that handles PWM timing for servos automatically. Include with #include <Servo.h>.' },
      { term: 'myServo.attach(pin)', definition: 'Tells the Servo library which pin your signal wire is on. Call this in setup().' },
      { term: 'myServo.write(angle)', definition: 'Commands the servo to go to a specific angle from 0 to 180 degrees.' },
      { term: 'constrain(value, min, max)', definition: 'Clamps a value to a valid range. Prevents sending the servo an impossible position.' },
    ]
  },
  'analog-sensor': {
    whatYouBuilt: 'You read a potentiometer with analogRead(), scaled the raw values with map(), and used them to control LED brightness in real time — the complete sensor-to-output loop.',
    keyConcepts: [
      { term: 'Analog Signal', definition: 'A signal that can be any value in a range, not just 0 or 1. Like a dimmer switch vs. a regular on/off switch.' },
      { term: 'analogRead(A0)', definition: 'Reads voltage on an analog pin and returns 0 (0V) to 1023 (5V). Uses the onboard 10-bit ADC.' },
      { term: 'Potentiometer (wiper)', definition: 'A variable resistor. The middle (wiper) pin outputs a voltage that changes linearly as you turn the knob.' },
      { term: 'map(value, 0, 1023, 0, 255)', definition: 'Scales a sensor reading to any range you need. The same pattern works for servo angles, percentages, or any unit.' },
      { term: 'ADC Jitter', definition: 'Small ±1 or ±2 fluctuations in analogRead readings from electrical noise. Normal and harmless for most projects.' },
    ]
  },
}
