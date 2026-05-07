-- CircuitPath — Lesson Content Upgrade
-- Run this in the Supabase SQL Editor AFTER the initial rebuild migration.
-- It replaces thin placeholder content with real, educational lessons
-- and adds 3 new lessons to the library.

-- ─────────────────────────────────────────────────────────────────
-- 1. UPSERT LESSON METADATA (updates existing + adds new)
-- ─────────────────────────────────────────────────────────────────
insert into learning_lessons
  (slug, title, summary, difficulty, estimated_minutes, order_index, required_tier, is_published)
values
  (
    'blink-led',
    'Blink an LED',
    'Your very first Arduino project. Make an LED flash on and off, learn why resistors protect components, and understand the structure that every Arduino sketch follows.',
    'beginner', 20, 1, 'free', true
  ),
  (
    'button-input',
    'Read a Button',
    'Wire a pushbutton and detect presses in code. Learn why pull-down resistors exist, use digitalRead, and print live data to the Serial Monitor.',
    'beginner', 25, 2, 'pro', true
  ),
  (
    'pwm-fade-led',
    'Fade an LED with PWM',
    'Use Pulse Width Modulation to smoothly dim an LED from fully off to fully on. Learn how Arduino creates the illusion of analog output using rapid on/off switching.',
    'beginner', 25, 3, 'pro', true
  ),
  (
    'serial-monitor',
    'Serial Monitor Basics',
    'Send data from your Arduino to your computer in real time. An essential skill every maker needs — the Serial Monitor is your window into what your code is actually doing.',
    'beginner', 15, 4, 'free', true
  ),
  (
    'servo-motor',
    'Control a Servo Motor',
    'Make a servo arm rotate to any angle with a single line of code. Learn how servo motors differ from regular motors and drive them with the built-in Servo library.',
    'intermediate', 30, 5, 'pro', true
  ),
  (
    'analog-sensor',
    'Read an Analog Sensor',
    'Wire a potentiometer and read its value as a number from 0 to 1023. Learn what analog-to-digital conversion means and how to scale sensor readings into useful ranges.',
    'intermediate', 30, 6, 'pro', true
  )
on conflict (slug) do update set
  title             = excluded.title,
  summary           = excluded.summary,
  difficulty        = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  order_index       = excluded.order_index,
  required_tier     = excluded.required_tier,
  is_published      = excluded.is_published,
  updated_at        = timezone('utc', now());

-- ─────────────────────────────────────────────────────────────────
-- 2. CLEAR OLD STEPS (clean re-insert with rich content)
-- ─────────────────────────────────────────────────────────────────
delete from learning_lesson_steps
where lesson_id in (
  select id from learning_lessons
  where slug in (
    'blink-led', 'button-input', 'pwm-fade-led',
    'serial-monitor', 'servo-motor', 'analog-sensor'
  )
);

-- ─────────────────────────────────────────────────────────────────
-- 3. INSERT STEPS — LESSON: blink-led
-- ─────────────────────────────────────────────────────────────────
with lesson as (select id from learning_lessons where slug = 'blink-led')
insert into learning_lesson_steps
  (lesson_id, step_index, title, instruction_md, code_snippet,
   checkpoint_prompt, checkpoint_answer, troubleshooting_md, expected_outcome)
values

-- Step 1 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 1,
  'Meet Your Parts',
  E'Before you touch any wire, get familiar with every component on your desk. Knowing what each part does — and why it is there — separates a builder from someone who just follows steps without understanding.\n\nArduino Uno — Think of this as a tiny computer that runs one program on repeat, forever. Along the top edge you have 14 digital pins (numbered 0–13). Each pin can output either 5 V (HIGH) or 0 V (LOW). You will use pin 9 in this project.\n\nLED (Light Emitting Diode) — Unlike a regular light bulb, an LED only allows electricity to flow in ONE direction. If wired backwards it simply stays dark — it will not be damaged. Look closely at your LED: the LONG leg is the positive side (called the anode). The SHORT leg is negative (called the cathode). Rule to memorise: Long = Plus.\n\nResistor (220 Ω) — A safety device that controls how much current flows through the LED. Without it, too much current burns the LED out in seconds. Your resistor has coloured bands: Red – Red – Brown – Gold = 220 ohms. Hold it up to the light and read all four bands before continuing.\n\nBreadboard — A prototyping board with hidden metal rails inside the plastic. Each numbered row of five holes on either side of the centre gap is connected underneath. Current flows freely between all five holes in the same row. The long rails down each edge (marked + and −) are for power and ground.\n\nJumper Wires — Flexible patch cables. Use red for power connections, black for ground, and any other colour for signal wires. This convention is used universally and will save you confusion in every project you ever build.\n\nPick up each component, look at it closely, and set it back down before moving on.',
  null,
  'What does the LONG leg of an LED connect to?',
  'positive',
  E'Cannot find a 220 Ω resistor?\nLook for values between 150 Ω and 470 Ω — any of them will work safely. The LED will just be slightly brighter or dimmer.\n\nOrange – Orange – Brown – Gold bands = 330 Ω, which is also perfectly fine.\n\nNever skip the resistor entirely. An LED without current limiting will burn out in seconds — sometimes taking the Arduino pin with it.',
  'You can identify and name every component on your desk.'
),

-- Step 2 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 2,
  'Why the Resistor Is Not Optional',
  E'This step teaches the single most important safety rule in electronics: always protect LEDs with a current-limiting resistor. Understanding the reason will help you remember it forever.\n\nHere is what happens without a resistor:\nYour Arduino pin outputs 5 V. The LED uses about 2 V to light up. If you connect the LED directly from pin to GND, the full 3 V excess pushes hundreds of milliamps through the tiny LED. It lights up brilliantly for a fraction of a second — then burns out permanently. Sometimes the Arduino pin burns with it.\n\nThe maths — Ohm''s Law (simpler than it sounds):\nOhm''s Law: Current = Voltage ÷ Resistance\n\nThe resistor "sees" the voltage the LED does not use: 5 V − 2 V = 3 V.\nWe want about 20 mA (0.020 A) of current — the safe maximum for most LEDs.\n\nResistance needed = 3 V ÷ 0.020 A = 150 Ω minimum.\n\nWe use 220 Ω because it is a common value and gives a comfortable safety margin. The LED runs at about 14 mA — slightly dimmer, but it will last for years.\n\nKey principle:\nEvery LED circuit you build for the rest of your life follows this exact rule. The resistor is not there to make things complicated — it is there to keep your components alive. When in doubt about which resistor to use, always choose the higher value.',
  null,
  'What does Ohm''s Law calculate?',
  'current',
  E'Not sure which resistor to use?\nWhen in doubt always pick the higher value. A slightly dimmer LED is far better than a burned-out one and a damaged Arduino pin.\n\nNever connect an LED directly from a power pin to GND without a resistor — even "just to test for a second." That second is all it takes.',
  'You understand why a resistor is essential and can explain the principle in your own words.'
),

-- Step 3 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 3,
  'Wire the Circuit',
  E'Now you will build the circuit. Work through each sub-step slowly — wrong wiring is the number one reason things do not work on the first try.\n\nA. Orient the breadboard.\nPlace it horizontally in front of you with the numbered rows facing you. Notice the centre gap that runs down the middle — this gap electrically separates the left and right halves of each row.\n\nB. Place the LED.\nInsert the LED across the centre gap.\nLong leg (anode) → right side of the gap, any row — say row 10.\nShort leg (cathode) → left side of the gap, same row 10.\nThe two legs must be on DIFFERENT sides of the gap so they are not connected to each other.\n\nC. Place the 220 Ω resistor.\nBoth legs stay on the RIGHT side of the breadboard.\nOne leg in the same hole-row as the LED''s long leg (row 10).\nOther leg four or five rows up — say row 5, same column.\n\nD. Red jumper wire (power signal).\nFrom: the row where the resistor''s upper leg sits (row 5, right side).\nTo: Digital pin 9 on the Arduino board.\n\nE. Black jumper wire (ground).\nFrom: the same row as the LED''s short leg (row 10, left side).\nTo: Any GND pin on the Arduino. There are three GND pins — any one works.\n\nBefore plugging in USB, trace the full path with your finger:\nArduino pin 9 → red wire → resistor → LED long leg → LED short leg → black wire → GND.\nEvery connection must physically exist.\n\nNow plug in your USB cable. If you smell burning or see smoke, unplug immediately and re-check step B for reversed LED polarity.',
  null,
  'Which leg of the LED connects to GND?',
  'short',
  E'LED does not light after uploading code:\n· Check polarity — the short leg must face GND, long leg toward the resistor and pin 9. Reversed polarity is the #1 beginner wiring mistake.\n· Make sure jumper wires are firmly seated. A wire that looks inserted might not be making contact. Pull it out and push it back in firmly.\n· Confirm both legs of the resistor are on the SAME side of the centre gap.\n\nBreadboard connection tip:\nIf a circuit does not work and you have checked polarity and pin numbers, try pulling each wire out one at a time and re-seating it firmly. Loose breadboard connections are surprisingly common and hard to see.',
  'LED and resistor are correctly wired between pin 9 and GND, ready for code.'
),

-- Step 4 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 4,
  'Write and Upload Your First Sketch',
  E'Open the Arduino IDE on your computer. If you do not have it installed, download it free at arduino.cc/en/software — choose the version for your operating system.\n\nSet up the IDE:\n1. Go to Tools → Board → Arduino AVR Boards → Arduino Uno.\n2. Go to Tools → Port and select the port that shows "Arduino Uno" (Windows) or "/dev/cu.usbmodem" (Mac). If you see multiple ports, unplug the Arduino, check which port disappears, then plug it back in.\n\nCreate a new sketch with File → New. Delete everything in the editor and paste the code below.\n\nRead the comments — they explain every single line:\n\nvoid setup() runs ONCE when the Arduino powers on or is reset. Use it for one-time configuration work.\n\npinMode(9, OUTPUT) tells pin 9: "you are going to send voltage out, not receive it." Without this the pin is in an undefined state and may not work reliably.\n\nvoid loop() runs forever after setup() finishes — over and over until you unplug the board. Everything your program does continuously lives here.\n\ndigitalWrite(9, HIGH) sends 5 V to pin 9. The LED circuit is now complete and current flows — the LED lights up.\n\ndelay(1000) freezes the program for exactly 1000 milliseconds (one second). The pin holds its current state during the pause.\n\ndigitalWrite(9, LOW) drops pin 9 to 0 V. No voltage, no current — LED turns off.\n\nClick the Upload button (the right-arrow icon). You will see orange progress text at the bottom of the IDE, then "Done uploading." Your LED should start blinking once per second.',
  E'// Runs ONCE when the Arduino powers on or resets\nvoid setup() {\n  // Tell pin 9 it will be sending voltage (output)\n  pinMode(9, OUTPUT);\n}\n\n// Runs FOREVER in a loop after setup() finishes\nvoid loop() {\n  digitalWrite(9, HIGH);  // Pin 9 → 5V, LED turns ON\n  delay(1000);            // Wait 1000 ms (1 second)\n  digitalWrite(9, LOW);   // Pin 9 → 0V, LED turns OFF\n  delay(1000);            // Wait 1 second, then repeat\n}',
  'What function runs forever after setup() finishes?',
  'loop',
  E'Upload fails — "Port not found" or "Board not connected":\n· Try a different USB cable. Many cheap cables are charge-only and cannot transfer data.\n· On Windows, open Device Manager → Ports (COM & LPT). The Arduino should appear here. If it does not, reinstall the driver from arduino.cc.\n· Close any other applications that might have the serial port open (e.g., Serial Monitor from a previous session).\n\nLED does not blink after successful upload:\n· Verify your circuit is still connected — confirm the red wire goes to pin 9 on the Arduino board, not another pin.\n· Re-read step 3 and trace the path: Pin 9 → resistor → LED long leg → LED short leg → GND.\n\nCompiler error "expected ; before }":\n· Every statement inside setup() and loop() must end with a semicolon.\n· Copy the code above exactly — even one missing character causes a compiler error.',
  'The LED blinks on and off once per second with no errors.'
),

-- Step 5 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 5,
  'Experiment: Make It Yours',
  E'Your LED is blinking. Now make it do what YOU want — this is how real engineers learn.\n\nExperiment 1 — Change the speed.\nChange both 1000 values in your code to 150. Click Upload.\nThe LED now blinks about six times per second. Try 50 — it will flicker so fast it looks permanently half-on.\n\nExperiment 2 — Asymmetric timing.\nSet the first delay to 900 and the second to 100.\nThe LED stays ON for 0.9 seconds and OFF for just 0.1 seconds — it looks "almost always on."\nReverse them (100 and 900) and it looks "almost always off."\nThis principle of varying the ratio of on-time to off-time is called duty cycle. It is the exact foundation of how PWM dimming works — which you will learn in the Fade an LED lesson.\n\nExperiment 3 — Use variables (write better code).\nPaste the sketch below. It does exactly the same thing as before but uses named variables at the top. A variable is a named container that holds a value. Now you can change the timing in one place without hunting through the code.\nThis is one of the fundamental habits of good programming.',
  E'int onTime  = 300;   // ms the LED stays ON\nint offTime = 700;   // ms the LED stays OFF\n\nvoid setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(9, HIGH);\n  delay(onTime);\n  digitalWrite(9, LOW);\n  delay(offTime);\n}',
  'Did changing the delay values change the blink speed?',
  'yes',
  E'Speed did not change after modifying delay values:\n· You must click the Upload button after every change. Saving the file alone does not send new code to the board.\n· Wait for "Done uploading" to appear in the IDE status bar before checking the LED.\n\nThis experiment teaches a core principle: the Arduino runs whatever code was last uploaded. If nothing changed, the old code is still running.',
  'You can control blink speed confidently and understand the structure of an Arduino sketch.'
);

-- ─────────────────────────────────────────────────────────────────
-- 4. INSERT STEPS — LESSON: button-input
-- ─────────────────────────────────────────────────────────────────
with lesson as (select id from learning_lessons where slug = 'button-input')
insert into learning_lesson_steps
  (lesson_id, step_index, title, instruction_md, code_snippet,
   checkpoint_prompt, checkpoint_answer, troubleshooting_md, expected_outcome)
values

-- Step 1 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 1,
  'How Pushbuttons Work',
  E'A pushbutton is one of the simplest components in electronics, but understanding how it works electrically will save you hours of debugging.\n\nMechanically, a pushbutton is a normally-open (NO) switch. "Normally open" means the circuit is broken by default — no current flows. When you press the button, two metal contacts touch and close the circuit.\n\nYour pushbutton has four legs. They are arranged in two pairs:\n· Legs on the LEFT side of the button are connected to each other internally.\n· Legs on the RIGHT side are connected to each other internally.\n· Pressing the button bridges LEFT and RIGHT — completing the circuit.\n\nWhen you insert the button on your breadboard, it sits across the centre gap. One side of the button ends up on each half of the board — this is intentional. It means left and right sides are always separated unless the button is physically pressed.\n\nWhen pressed: current flows, Arduino pin reads 5 V → digitalRead returns 1 (HIGH).\nWhen released: circuit is open, current stops → but what does the pin read?\n\nThis is where it gets interesting — and where most beginners get tripped up. You will find out in the next step.',
  null,
  'What does normally-open mean for a pushbutton?',
  'circuit is broken',
  E'Not sure which orientation to insert the button?\nLook at the button from above — the four legs form a rectangle. Insert it across the centre gap of the breadboard so two legs are on each side. If the button does not sit flat or wobbles, it is oriented the wrong way — rotate it 90 degrees.\n\nButtons with only two legs work the same way — just simpler to wire.',
  'You understand that a pushbutton closes a circuit only when physically pressed.'
),

-- Step 2 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 2,
  'The Floating Input Problem',
  E'When a pushbutton is NOT pressed, the wire connected to the Arduino input pin is disconnected from everything. That pin is "floating" — it is not connected to 5 V or to GND.\n\nA floating input behaves unpredictably. Electrical noise from your body, nearby components, radio frequencies, and even the USB cable cause the pin to randomly read 0 or 1. You press nothing, and your code thinks the button is being randomly pressed dozens of times per second.\n\nThe fix: a pull-down resistor.\n\nA 10 kΩ resistor connected between the input pin and GND gives the pin a definite, stable LOW when the button is not pressed. Here is why it works:\n\nButton NOT pressed:\nThe 10 kΩ resistor pulls the pin gently to GND (0 V). Pin reads 0. Stable.\n\nButton PRESSED:\n5 V connects directly to the pin through the button. 5 V easily overpowers the 10 kΩ pull-down. Pin reads 1. Stable.\n\nWhy 10 kΩ specifically?\nHigh enough that very little current is wasted to ground when the button is pressed (only 0.5 mA). Low enough to hold the pin firmly at 0 V when not pressed. This is the standard pull-down value used in electronics worldwide.\n\nNote: Arduino has built-in pull-UP resistors you can enable in software (using INPUT_PULLUP). You will learn that technique later. For now, the external pull-DOWN gives you the full picture of why they exist.',
  null,
  'What problem does a pull-down resistor solve?',
  'floating input',
  E'If you see random 0s and 1s in the Serial Monitor even without touching the button, your pull-down resistor is likely missing, the wrong value, or not properly connected.\n\nAlso check: is the resistor connected from the INPUT PIN to GND, or from 5V to the pin? It must go from the pin to GND. From 5V to the pin would be a pull-UP resistor — different behaviour.',
  'You can explain floating inputs and why pull-down resistors prevent them.'
),

-- Step 3 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 3,
  'Wire the Button Circuit',
  E'Now build the button circuit with a pull-down resistor. Take your time with each connection.\n\nParts needed:\nPushbutton, 10 kΩ resistor (Brown-Black-Orange-Gold), jumper wires (red, black, yellow or any colour for signal), breadboard.\n\nA. Insert the button across the centre gap of the breadboard.\nThe button bridges the gap — two legs on each side. Say the left legs land on column E, rows 8 and 10, and the right legs land on column F, rows 8 and 10. Exact rows do not matter, just that it straddles the gap.\n\nB. Wire power to the button (red wire).\nConnect one red wire from the Arduino 5V pin to the row of one of the button''s legs on the RIGHT side (e.g., row 8, right).\n\nC. Wire the signal to Arduino pin 2 (yellow wire).\nConnect a wire from that SAME right-side leg row to Arduino digital pin 2.\n\nD. Add the 10 kΩ pull-down resistor.\nOne leg of the resistor in the same row as pin 2 and the button right-side leg (row 8).\nOther leg of the resistor into the ground rail (−) on the breadboard.\n\nE. Ground rail to Arduino GND (black wire).\nConnect the breadboard − rail to any GND pin on the Arduino.\n\nTrace the path when button is pressed:\nArduino 5V → button → pin 2 and also resistor → GND.\nWhen button is open: pin 2 → only the 10 kΩ resistor → GND (pin reads 0).',
  null,
  'Where does the pull-down resistor connect?',
  'pin to gnd',
  E'Readings are always 1, even when not pressing:\n· The pull-down resistor may be missing or not connected to GND.\n· Check that the resistor goes from the signal line to GND, not to 5V.\n\nReadings are always 0, even when pressing:\n· The 5V wire may be missing or not connected to the correct button leg.\n· Try pressing harder — some cheap buttons need more force.\n\nRandom readings jumping between 0 and 1:\n· The pull-down is not making solid contact. Re-seat both legs of the resistor firmly.\n· Confirm the resistor ground leg is in the − rail and the − rail is connected to Arduino GND.',
  'Button is correctly wired with a pull-down resistor, ready to read in code.'
),

-- Step 4 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 4,
  'Code: Read and Print Button State',
  E'Now write the code to read your button and display its state in real time on your computer.\n\nUpload the sketch below, then open the Serial Monitor:\nTools → Serial Monitor (or Ctrl+Shift+M on Windows, Cmd+Shift+M on Mac).\nMake sure the baud rate in the bottom-right of the Serial Monitor is set to 9600.\n\nWhat every line does:\n\nSerial.begin(9600) in setup() opens a communication channel between the Arduino and your computer at 9600 bits per second. The baud rate in the IDE Serial Monitor must match this number exactly.\n\ndigitalRead(2) reads the voltage on pin 2 and returns either 1 (HIGH, 5V, button pressed) or 0 (LOW, 0V, button not pressed).\n\nSerial.print(buttonState) sends that number to your computer — you see it appear in the Serial Monitor in real time.\n\nSerial.println("") prints a blank line after each value so the output is readable. (println means "print line" — it adds a line break at the end.)\n\ndelay(100) slows the output to 10 readings per second. Without it, numbers scroll too fast to read.\n\nWith the Serial Monitor open, press and hold the button. The 0s should change to 1s. Release — back to 0s. If you see this, you have successfully read a digital input.',
  E'void setup() {\n  pinMode(2, INPUT);      // Pin 2 receives signal (input)\n  Serial.begin(9600);     // Open serial at 9600 baud\n}\n\nvoid loop() {\n  int buttonState = digitalRead(2);  // Read pin 2 (0 or 1)\n  Serial.print("Button: ");\n  Serial.println(buttonState);       // Print value + new line\n  delay(100);                        // 10 readings per second\n}',
  'What value does digitalRead return when the button is pressed?',
  '1',
  E'Serial Monitor is blank:\n· Verify you clicked Upload and got "Done uploading" before opening Serial Monitor.\n· Check the baud rate in the Serial Monitor dropdown — it must be 9600 to match Serial.begin(9600).\n· On some systems you need to close and reopen the Serial Monitor after uploading.\n\nAlways reads 0, button does nothing:\n· Confirm your 5V wire goes to the button and that the button signal wire goes to pin 2.\n· Swap to using INPUT_PULLUP in the pinMode call and connect button between pin 2 and GND instead — this uses the Arduino''s internal pull-up and inverts the logic (1 = not pressed, 0 = pressed).\n\nRandom values when not pressing:\n· Pull-down resistor issue — go back to step 3 and re-check the resistor placement.',
  'Serial Monitor shows 0 when released and 1 when the button is pressed.'
);

-- ─────────────────────────────────────────────────────────────────
-- 5. INSERT STEPS — LESSON: pwm-fade-led
-- ─────────────────────────────────────────────────────────────────
with lesson as (select id from learning_lessons where slug = 'pwm-fade-led')
insert into learning_lesson_steps
  (lesson_id, step_index, title, instruction_md, code_snippet,
   checkpoint_prompt, checkpoint_answer, troubleshooting_md, expected_outcome)
values

-- Step 1 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 1,
  'What Is PWM?',
  E'PWM stands for Pulse Width Modulation. It is how a microcontroller like the Arduino creates the illusion of a variable voltage when it can only output fully ON (5 V) or fully OFF (0 V).\n\nHere is the trick:\nThe pin switches on and off extremely fast — about 490 times per second on the Arduino Uno. Your eye cannot see individual flashes that fast, so it averages them. If the pin is on 50% of the time and off 50% of the time, the LED appears to be at 50% brightness. If it is on 75% of the time, the LED appears 75% bright.\n\nThe percentage of time the signal is HIGH is called the duty cycle:\n\n  0% duty cycle  →  LED is off\n 50% duty cycle  →  LED appears half bright\n100% duty cycle  →  LED is at full brightness\n\nAnalogy:\nImagine a light switch you flip 500 times per second. If you flip it on for 1ms then off for 1ms, the room looks half-lit. Flip it on for 1.5ms and off for 0.5ms — the room looks 75% bright. You are not changing the bulb — just changing the ratio of on/off time.\n\nPWM is used everywhere:\n· Dimming LEDs\n· Controlling motor speed\n· Positioning servo motors\n· Generating audio tones\n\nYou are about to use it with a single function call.',
  null,
  'What does PWM stand for?',
  'pulse width modulation',
  E'It can be hard to visualise PWM by looking at an LED alone.\nIf you have a smartphone, try searching "PWM visualizer" — there are apps that show you the waveform as a bar graph. Some oscilloscope apps can show you the actual signal switching on and off.\n\nFor now, just hold the concept in your head: ON/OFF very fast = appears as a middle brightness to your eye.',
  'You can explain what PWM is and how it creates the illusion of variable brightness.'
),

-- Step 2 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 2,
  'Which Pins Support PWM',
  E'Not all digital pins on the Arduino Uno can do PWM. Only six of the fourteen digital pins have the hardware necessary to generate a PWM signal.\n\nLook at your Arduino Uno board. On the digital pins along the top edge, find the ones that have a small tilde symbol (~) printed next to their number:\n\nPWM-capable pins on the Uno: 3, 5, 6, 9, 10, 11\n\nPins WITHOUT a tilde (like pins 2, 4, 7, 8, etc.) can only do full ON or full OFF using digitalWrite. If you call analogWrite on a non-PWM pin, it will not produce a true PWM signal — it may just lock to full ON or OFF.\n\nFor this lesson, use pin 9 — it already has your LED from the Blink lesson if you kept your circuit together.\n\nIf you took your circuit apart after the Blink lesson, rebuild the LED circuit now:\n· Long LED leg (anode) → 220 Ω resistor → pin 9\n· Short LED leg (cathode) → GND\n\nThe circuit is identical to the Blink lesson. The only difference will be in the code — instead of digitalWrite, you will use analogWrite.',
  null,
  'Is pin 9 a PWM-capable pin?',
  'yes',
  E'If you are not sure which pin you are on, count from the end of the Arduino: starting from the USB end, the first digital pin is 0, the next is 1, and so on. Pin 9 is the tenth digital pin from that end.\n\nThe ~ symbol is small and can be hard to read. Under good light, look for it printed in white alongside the pin number.',
  'LED circuit is wired on a PWM-capable pin and ready for analogWrite.'
),

-- Step 3 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 3,
  'analogWrite: The 0–255 Scale',
  E'To control brightness with PWM, you use analogWrite() instead of digitalWrite().\n\nThe function signature is:\nanalogWrite(pin, value)\n\nWhere value is any whole number from 0 to 255:\n\n  0   → 0% duty cycle  → LED is completely off\n 127  → 50% duty cycle → LED appears half bright\n 255  → 100% duty cycle → LED is at full brightness\n\nWhy 255?\nArduino''s PWM timer uses 8 bits. An 8-bit number can hold 256 different values (0 through 255). That gives you 256 brightness levels — far more than your eye can distinguish. For reference, professional light dimmers in theatre use 16-bit for 65,536 levels, but 256 is perfectly smooth for everyday use.\n\nTry this quick test:\nUpload the three-line sketch below. It sets pin 9 to exactly 25% brightness.\nChange 64 to 200 and upload again — it should be noticeably brighter.\nChange it to 0 — LED off. Change it to 255 — full brightness.\n\nThis single function — analogWrite — will be the building block for controlling motor speed, servo position, LED strips, and much more in your future projects.',
  E'void setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  // Set LED to 25% brightness (64 out of 255)\n  // Try changing 64 to 200 or 0 and re-uploading\n  analogWrite(9, 64);\n}',
  'What analogWrite value produces full brightness?',
  '255',
  E'LED only flickers or blinks instead of holding steady brightness:\n· Make sure you are using analogWrite, not digitalWrite.\n· Confirm pin 9 is a PWM-capable pin (it has a ~ next to its number on the board).\n\nNo visible change when you change the value:\n· Remember to click Upload after every code change.\n· Very small values (1–10) may appear completely off to your eye even though the pin is technically PWM-ing. Try values above 30 to see a visible difference.',
  'You can set any brightness level between 0 and 255 using analogWrite.'
),

-- Step 4 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 4,
  'Write the Smooth Fade Loop',
  E'Now you will combine everything to produce a smooth fade — the LED gradually brightens from fully off to fully on, then fades back down, over and over.\n\nUpload the sketch below and watch your LED.\n\nHow the for loops work:\n\nfor (int b = 0; b <= 255; b++) means:\n  · Start with b = 0\n  · Do the body of the loop\n  · Add 1 to b (b++ means b = b + 1)\n  · Repeat as long as b is less than or equal to 255\nSo this loop runs 256 times, with b going from 0 to 255.\n\nInside the loop:\nanalogWrite(9, b) sets the brightness to the current value of b.\ndelay(8) waits 8 milliseconds before the next step.\n\n256 steps × 8 ms each = 2048 ms ≈ 2 seconds per fade direction.\n\nThe second for loop does the same in reverse — b starts at 255 and counts down to 0 — fading the LED back out.\n\nExperiment:\n· Change delay(8) to delay(3) — the fade will be noticeably faster.\n· Change delay(8) to delay(20) — very slow, hypnotic fade.\n· Change b++ to b += 5 in the first loop — it will jump in steps of 5, making the fade slightly visible in steps. This shows how finer control (smaller increments) creates smoother results.',
  E'void setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  // Fade UP: brightness 0 to 255\n  for (int b = 0; b <= 255; b++) {\n    analogWrite(9, b);\n    delay(8);  // 8ms per step = ~2 second fade\n  }\n\n  // Fade DOWN: brightness 255 to 0\n  for (int b = 255; b >= 0; b--) {\n    analogWrite(9, b);\n    delay(8);\n  }\n}',
  'What PWM value produces zero brightness (LED off)?',
  '0',
  E'LED only turns on and off abruptly instead of fading:\n· Confirm you used analogWrite inside the loop, not digitalWrite.\n· Make sure pin 9 is PWM-capable (~ symbol on the board next to pin 9).\n\nFade is visible but looks "stepped" — not perfectly smooth:\n· This is normal if you increased the step size in the for loop (b += 2 or larger). Reduce back to b++ (single steps) for maximum smoothness.\n\nLoop runs but LED only hits full brightness with no fade:\n· Check the condition in the first for loop — it must be b <= 255, not b == 255.',
  'LED fades smoothly from off to full brightness and back, continuously.'
);

-- ─────────────────────────────────────────────────────────────────
-- 6. INSERT STEPS — LESSON: serial-monitor
-- ─────────────────────────────────────────────────────────────────
with lesson as (select id from learning_lessons where slug = 'serial-monitor')
insert into learning_lesson_steps
  (lesson_id, step_index, title, instruction_md, code_snippet,
   checkpoint_prompt, checkpoint_answer, troubleshooting_md, expected_outcome)
values

-- Step 1 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 1,
  'Your Window Into the Arduino',
  E'One of the most frustrating things about working with a microcontroller is that it is silent. You cannot "see" what it is thinking. When your code does not work, you have no idea if the problem is in your wiring, your logic, or your numbers.\n\nThe Serial Monitor solves this.\n\nIt is a terminal window built into the Arduino IDE. Your Arduino can send text and numbers through the USB cable to this window in real time, while your program is running. You can watch sensor values change as you move a dial. You can print debug messages to see which part of your code is executing. You can log data over hours to spot patterns.\n\nEvery professional who works with Arduino or any embedded system uses serial output constantly. It is not a beginner crutch — it is a fundamental tool.\n\nHow it works at a high level:\nThe Arduino has a hardware serial port connected to pins 0 (RX) and 1 (TX). When you plug in USB, a USB-to-serial chip on the board routes those pins to your computer''s virtual COM port. The Arduino IDE''s Serial Monitor reads from that COM port and displays whatever the Arduino sends.\n\nBaud rate:\nBoth sides must agree on how fast data is transmitted, measured in bits per second (baud). The most common rate is 9600. You set it in code with Serial.begin(9600) and in the Serial Monitor dropdown (bottom right of the monitor window).\n\nIn this lesson you will go from "nothing visible" to printing live data from your board. You will use this skill in every single advanced lesson from here.',
  null,
  'What tool lets you see data sent from your Arduino?',
  'serial monitor',
  E'No hardware needed for this lesson beyond an Arduino and USB cable. You do not need any external components.\n\nIf you see garbled characters in the Serial Monitor (random symbols instead of readable text), the baud rate in the IDE monitor does not match Serial.begin() in your code. They must be the same number.',
  'You understand what the Serial Monitor is and why every maker uses it.'
),

-- Step 2 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 2,
  'Send Your First Serial Message',
  E'Upload the sketch below. Then open the Serial Monitor with Tools → Serial Monitor (or press Ctrl+Shift+M).\n\nSet the baud rate dropdown in the bottom-right of the Serial Monitor to 9600.\n\nYou should see numbers counting up from 0 in the monitor window.\n\nWhat every line does:\n\nSerial.begin(9600) in setup() — initialises the serial hardware at 9600 bits per second. This must be called before any other Serial commands. The 9600 must match the baud rate in your Serial Monitor.\n\nint counter = 0 in setup() — creates a variable called counter and sets it to 0. We declared it outside loop() so it keeps its value between loop iterations.\n\nSerial.print("Count: ") — sends the text Count: to the monitor. print() does NOT add a line break at the end.\n\nSerial.println(counter) — sends the number stored in counter, then moves to the next line. println stands for "print line" — it adds a carriage return after the value.\n\ncounter++ — adds 1 to counter. After one full loop, counter is 1. After two loops, it is 2. And so on.\n\ndelay(500) — waits half a second between each count so the output is readable.\n\nWatch the numbers climb in real time. This is your Arduino talking to you.',
  E'int counter = 0;  // Keeps its value between loop() runs\n\nvoid setup() {\n  Serial.begin(9600);  // Start serial at 9600 baud\n}\n\nvoid loop() {\n  Serial.print("Count: ");    // Print label (no new line)\n  Serial.println(counter);    // Print number + new line\n  counter++;                  // Add 1 to counter\n  delay(500);                 // Wait half a second\n}',
  'What does println do differently from print?',
  'adds new line',
  E'Serial Monitor shows nothing:\n· Confirm you clicked Upload and got "Done uploading" before opening the Serial Monitor.\n· The baud rate in the Serial Monitor dropdown MUST be 9600 — change it if needed.\n· On some computers you need to close and reopen the Serial Monitor after uploading.\n\nGarbled text (symbols instead of numbers):\n· Baud rate mismatch. Check Serial.begin() in your code and the dropdown in the monitor — they must match.\n\nNumbers appear but do not increment:\n· Confirm counter++ is inside the loop() function, not inside setup().',
  'Serial Monitor shows "Count: 0", "Count: 1", "Count: 2" counting up every half second.'
),

-- Step 3 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 3,
  'Print Multiple Values on One Line',
  E'Real projects usually need to print several pieces of information at once — a sensor value and its label, two sensor readings side by side, or a formatted status message. Here is the correct technique.\n\nThe key insight: You can chain multiple print() and println() calls. Everything sent with print() stays on the same line. Only println() moves to the next line. By mixing them you can build up any output format you want.\n\nUpload the sketch below. The output should look like:\nTemperature: 23 C   |   Humidity: 60 %\nTemperature: 24 C   |   Humidity: 61 %\n\n(The temperature and humidity are just incrementing variables — not real sensors. In a real project you would replace the variable with an actual sensor reading.)\n\nNotice the pattern:\n  Serial.print(label)     → prints text, stays on same line\n  Serial.print(value)     → prints number, stays on same line\n  Serial.print(separator) → prints spacing or symbols\n  Serial.println(value)   → prints final value AND moves to next line\n\nThis pattern works for any combination of text and numbers.\n\nChallenge: Before moving on, modify the sketch to also print a third value: a "pressure" variable that starts at 1013 and increases by 1 each loop. Add it to the same line with a " | " separator. This kind of multi-value logging is exactly how real sensor projects work.',
  E'int temp     = 20;  // Simulated sensor values\nint humidity = 55;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  // Build the output line piece by piece\n  Serial.print("Temperature: ");\n  Serial.print(temp);\n  Serial.print(" C   |   Humidity: ");\n  Serial.print(humidity);\n  Serial.println(" %");  // println adds the line break\n\n  temp++;\n  humidity++;\n  delay(800);\n}',
  'Which Serial function moves the cursor to the next line?',
  'println',
  E'Output appears jumbled on one very long line:\n· Make sure the last item in each group uses println(), not print(). Without a println(), all output merges into one continuous line.\n\nOutput disappears after a few seconds:\n· This is normal — the Serial Monitor scrolls. Scroll up to see earlier output.\n· To pause scrolling, uncheck "Autoscroll" in the Serial Monitor toolbar.\n\nNumbers count too fast to read:\n· Increase the delay value. delay(1000) gives you one output per second which is easy to follow.',
  'Serial Monitor displays two labelled values on each line, updating every 800 ms.'
);

-- ─────────────────────────────────────────────────────────────────
-- 7. INSERT STEPS — LESSON: servo-motor
-- ─────────────────────────────────────────────────────────────────
with lesson as (select id from learning_lessons where slug = 'servo-motor')
insert into learning_lesson_steps
  (lesson_id, step_index, title, instruction_md, code_snippet,
   checkpoint_prompt, checkpoint_answer, troubleshooting_md, expected_outcome)
values

-- Step 1 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 1,
  'How Servo Motors Work',
  E'A servo motor is one of the most satisfying components to work with because it does exactly what you tell it: move to this angle, and stay there.\n\nHow it differs from a regular motor:\nA regular DC motor just spins continuously when you apply power. You cannot easily tell it to stop at a specific angle.\n\nA servo motor has three things a regular motor does not:\n1. An internal position sensor (a potentiometer attached to the output shaft)\n2. A control circuit (tiny PCB inside the housing)\n3. Gears that reduce speed and increase torque\n\nThis combination lets the servo constantly compare its actual position to the target angle you set, and correct any difference. Send it to 90 degrees, and it goes to 90 degrees — precisely — and holds there even if you try to push the arm.\n\nServos understand a PWM signal at 50 Hz (50 times per second). The pulse width (duration the signal is HIGH each cycle) encodes the desired angle:\n· 1 ms pulse → 0 degrees\n· 1.5 ms pulse → 90 degrees (centre)\n· 2 ms pulse → 180 degrees\n\nYou do NOT have to deal with any of this manually. The Arduino Servo library handles all of it. You just say myServo.write(90) and the library generates the correct signal.\n\nServos have three wires:\n· Red → Power (5V)\n· Brown or Black → Ground (GND)\n· Orange, Yellow, or White → Signal (PWM from Arduino)\n\nSmall hobby servos (SG90, MG90S) run fine on Arduino''s 5V. Larger servos need an external 5V or 6V power supply.',
  null,
  'How many wires does a hobby servo motor have?',
  '3',
  E'If you have a servo but are unsure which wire is which, the standard colour coding is:\nRed = Power, Brown/Black = Ground, Orange/Yellow/White = Signal.\n\nAlways double-check before connecting — wrong polarity will not necessarily damage a servo, but a reversed signal wire can cause it to jitter or run hot.',
  'You can explain how a servo motor knows its position and what the three wires are for.'
),

-- Step 2 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 2,
  'Wire the Servo to Arduino',
  E'Wiring a servo is refreshingly simple compared to building a breadboard circuit from scratch.\n\nParts needed:\nHobby servo (SG90 or similar), three jumper wires (red, black, yellow), Arduino Uno.\n\nOption A — Direct connection (works for small servos only):\n\nRed wire → Arduino 5V pin\nBlack or Brown wire → Arduino GND pin\nSignal wire (yellow/orange/white) → Arduino digital pin 9\n\nThat is it. Three wires, three pins. No breadboard required.\n\nOption B — Using a breadboard (cleaner for multi-component projects):\nConnect the 5V and GND rails on the breadboard to Arduino 5V and GND.\nPlug the servo wires into the breadboard rows connected to those rails.\nRun a wire from the servo signal column to pin 9.\n\nImportant power note:\nSmall servos (SG90) draw about 100–200 mA when moving. The Arduino''s 5V pin can supply up to 500 mA total, which is enough for one small servo.\nIf the servo causes your Arduino to reset, reboot, or behave strangely, the servo is drawing too much current. In that case, power the servo from an external 5V source and connect only the grounds together (Arduino GND and external supply GND must share a common ground).\n\nTest your wiring:\nOnce connected, plug in the USB cable. Many servos will twitch slightly as they receive power — this is normal. If the servo vibrates continuously, the signal wire may be disconnected.',
  null,
  'Which Arduino pin gets the servo signal wire?',
  '9',
  E'Servo twitches or vibrates continuously after wiring but before uploading code:\n· The signal wire may be floating (not connected). Confirm the signal wire is firmly in pin 9.\n· This is normal if the pin has no defined state yet — uploading the sketch in the next step will fix it.\n\nArduino keeps resetting while the servo moves:\n· The servo is drawing more current than the Arduino 5V pin can supply.\n· Power the servo from a separate 5V source (a USB phone charger with a wire-tapped 5V/GND works well). Connect the grounds together but keep the servo power separate from the Arduino.',
  'Servo is connected with three wires: power, ground, and signal on pin 9.'
),

-- Step 3 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 3,
  'Use the Servo Library',
  E'The Arduino IDE includes the Servo library by default — you do not need to install anything.\n\nUpload the sketch below. The servo arm should rotate slowly from 0 degrees to 180 degrees.\n\nLine-by-line explanation:\n\n#include <Servo.h> — this loads the Servo library. It gives you a set of functions written by someone else that handle all the PWM timing automatically. You get to stand on their shoulders instead of reinventing the wheel.\n\nServo myServo — creates a Servo object named myServo. Think of it as a variable that represents your physical servo motor. You can name it anything; myServo is just a convention.\n\nmyServo.attach(9) in setup() — tells the library which pin your servo signal wire is on. From this point, the library manages pin 9 automatically.\n\nmyServo.write(angle) — sends the servo to the specified angle (0 to 180 degrees). This is the only function you need for most projects. The library converts the angle to the correct 50 Hz PWM pulse width internally.\n\ndelay(15) between position changes — gives the servo time to physically move before you command the next position. For a slow, smooth sweep, 15 ms is good. For faster movement, you can reduce it, but moving faster than the servo can mechanically follow causes it to skip positions.\n\nChange the 1 in angle++ to 5 and re-upload. The servo will now step 5 degrees at a time — you will notice the movement is choppier. This is a good visual demonstration of resolution.',
  E'#include <Servo.h>     // Load the Servo library\n\nServo myServo;           // Create a Servo object\n\nvoid setup() {\n  myServo.attach(9);     // Signal wire is on pin 9\n}\n\nvoid loop() {\n  // Sweep from 0 to 180 degrees\n  for (int angle = 0; angle <= 180; angle++) {\n    myServo.write(angle);\n    delay(15);           // Wait for servo to reach position\n  }\n\n  delay(500);            // Pause at 180 before reversing\n\n  // Sweep back from 180 to 0\n  for (int angle = 180; angle >= 0; angle--) {\n    myServo.write(angle);\n    delay(15);\n  }\n\n  delay(500);            // Pause at 0 before repeating\n}',
  'What function sets the servo to a specific angle?',
  'write',
  E'Servo buzzes or vibrates at certain angles but does not move:\n· The servo may be mechanically blocked at the end of its travel range. Some servos have a physical range of only 120–160 degrees even though the library accepts 0–180.\n· Try limiting the range to 10–170 and see if the buzzing stops.\n\nServo moves but not to the correct angles (off by many degrees):\n· Some cheap servos are not well-calibrated. You can use myServo.writeMicroseconds(1500) for centre, 1000 for one end, and 2000 for the other — this gives more precise control than write().\n\nNothing happens at all:\n· Confirm the signal wire is in pin 9 and myServo.attach(9) matches.',
  'Servo arm sweeps smoothly from 0 to 180 degrees and back, continuously.'
),

-- Step 4 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 4,
  'Position on Demand',
  E'A servo that just sweeps back and forth is not very useful. Real projects need the servo to go to a specific position when triggered — when a button is pressed, a sensor threshold is crossed, or a command is received.\n\nUpload the sketch below. Each time you open the Serial Monitor and type an angle number (0–180) and press Enter, the servo will move to that exact angle and hold it.\n\nHow it works:\n\nSerial.available() returns how many bytes are waiting to be read from the serial buffer. If it is greater than 0, there is data to read.\n\nSerial.parseInt() reads the waiting data and interprets it as an integer. When you type "90" and press Enter, this returns 90.\n\nconstrain(angle, 0, 180) clamps the value to the valid range. If you accidentally type 200, constrain limits it to 180. This prevents you from commanding an impossible position.\n\nmyServo.write(angle) sends the servo to the position.\n\nSerial.println() confirms the angle back to you — this is good practice so you can verify the command was received correctly.\n\nTry typing:\n0 (arm goes to fully one side)\n90 (arm goes to centre)\n180 (arm goes to the other side)\n45, 135 — quarter and three-quarter positions\n\nYou now have interactive servo control over USB. This same pattern works with buttons, sensors, or any other input — you just replace the Serial.parseInt() with a sensor reading.',
  E'#include <Servo.h>\n\nServo myServo;\n\nvoid setup() {\n  myServo.attach(9);\n  Serial.begin(9600);\n  Serial.println("Type an angle (0-180) and press Enter:");\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {\n    int angle = Serial.parseInt();         // Read typed number\n    angle = constrain(angle, 0, 180);      // Clamp to valid range\n    myServo.write(angle);                  // Move servo\n    Serial.print("Moving to: ");\n    Serial.println(angle);\n  }\n}',
  'What does constrain(value, 0, 180) do?',
  'limits range',
  E'Servo moves to random positions without you typing anything:\n· Serial.parseInt() returns 0 when there is no valid number to read. Wrapping the call inside if (Serial.available() > 0) prevents spurious reads — make sure that check is in your code.\n\nTyping in Serial Monitor does nothing:\n· Confirm baud rate is 9600 in both the code and the monitor dropdown.\n· Make sure you press Enter (not just type) in the Serial Monitor input box.\n\nServo jumps to 0 when you type a non-number:\n· parseInt returns 0 for non-numeric input. Only type whole numbers between 0 and 180.',
  'Servo moves to any typed angle on demand via Serial Monitor.'
);

-- ─────────────────────────────────────────────────────────────────
-- 8. INSERT STEPS — LESSON: analog-sensor
-- ─────────────────────────────────────────────────────────────────
with lesson as (select id from learning_lessons where slug = 'analog-sensor')
insert into learning_lesson_steps
  (lesson_id, step_index, title, instruction_md, code_snippet,
   checkpoint_prompt, checkpoint_answer, troubleshooting_md, expected_outcome)
values

-- Step 1 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 1,
  'Digital vs Analog: What''s the Difference?',
  E'You have worked with digital signals — either ON or OFF, 0 or 1, 0V or 5V. Digital is like a light switch: two states only.\n\nAnalog signals are different. They can be any value within a range — like a dimmer switch that can be set anywhere from fully off to fully on, and every brightness in between.\n\nThe real world is mostly analog:\n· Temperature is not just "hot" or "cold" — it is 23.4 degrees.\n· Light is not just "bright" or "dark" — it has infinite shades.\n· Sound is a continuously varying pressure wave.\n\nTo read these values, the Arduino has six analog input pins: A0 through A5 on the bottom edge of the board.\n\nThese pins contain an Analog-to-Digital Converter (ADC) — a circuit that measures the voltage on the pin and converts it to a digital number. The Arduino Uno uses a 10-bit ADC:\n\n10 bits = 2^10 = 1024 possible values (0 through 1023)\n\n0 V on the pin → analogRead returns 0\n5 V on the pin → analogRead returns 1023\n2.5 V on the pin → analogRead returns approximately 512\n\nEvery voltage between 0 and 5 V maps to a number in that 0–1023 range. Your job is to read that number and make sense of it.\n\nThis lesson uses a potentiometer — a knob that changes resistance as you turn it. It is the simplest possible analog input and a perfect way to see the ADC in action.',
  null,
  'What range of numbers does analogRead return?',
  '0 to 1023',
  E'The Arduino Uno ADC resolution is 10 bits (0–1023). Some other microcontrollers have 12-bit ADCs (0–4095) or higher. The Arduino Due and Zero have 12-bit ADCs.\n\nThe reference voltage (the "full scale") on the Uno is 5V by default. You can change it with analogReference() for applications requiring higher precision, but the default 5V reference is appropriate for most projects.',
  'You can explain the difference between digital and analog signals and know the analogRead range.'
),

-- Step 2 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 2,
  'Wire a Potentiometer',
  E'A potentiometer (often called a "pot") is a variable resistor. It has three pins and a rotating shaft. As you turn the shaft, an internal wiper slides along a resistive track, changing the ratio of resistance on each side.\n\nThe three pins work like a voltage divider:\n\nLeft pin  → connect to 5V (or GND — it depends on which direction you want "up")\nRight pin → connect to GND (or 5V)\nMiddle pin (wiper) → connect to Arduino analog pin A0\n\nHow it creates a variable voltage:\nWhen the wiper is at the left end, the middle pin is directly connected to the left pin (5V). Middle pin = 5V. analogRead returns ~1023.\nWhen the wiper is at the right end, it is connected to the right pin (GND). Middle pin = 0V. analogRead returns ~0.\nIn the middle, it is 2.5V. analogRead returns ~512.\n\nTurning the knob linearly moves the wiper and linearly changes the voltage — and therefore linearly changes what analogRead returns.\n\nWiring steps:\nA. Insert the potentiometer into the breadboard (three pins, straddles the centre gap or goes in one side).\nB. Left pin → 5V rail → Arduino 5V.\nC. Right pin → GND rail → Arduino GND.\nD. Middle pin → wire to Arduino A0.\n\nOnce wired, turn the knob a few times. No code needed yet — you are just confirming the pot moves freely and is mechanically undamaged.',
  null,
  'Which pot pin connects to the Arduino analog input?',
  'middle',
  E'Potentiometer only reads two values (0 and 1023, never in between):\n· The wiper (middle) pin may not be connected. Check the wire from the pot''s middle pin to A0.\n· Some breadboard insertions miss a row — pull the pot out and re-seat it firmly.\n\nAnalog readings are stable at one end but jump erratically near the other:\n· One side of the pot track may be worn (common in old or cheap pots). Try a different unit.\n\nNot sure which pin is the middle pin?\nLook at the pot from the front — with the shaft facing you, the three pins are usually visible below. The middle leg of the three is the wiper. If unsure, use a multimeter in resistance mode: measure between middle and one side while turning the shaft — the value should change.',
  'Potentiometer is correctly wired to A0, ready to read analog values.'
),

-- Step 3 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 3,
  'Read and Print the Analog Value',
  E'Upload the sketch below. Open the Serial Monitor at 9600 baud. Slowly turn the potentiometer from one end to the other.\n\nYou should see numbers changing in real time — from near 0 at one end of rotation to near 1023 at the other end.\n\nWhat the code does:\n\nanalogRead(A0) reads the voltage on analog pin A0 and converts it to a 0–1023 integer. This single function call does everything — the ADC hardware handles the conversion automatically.\n\nSerial.print("Sensor: ") — labels the output so you can read it easily.\n\nSerial.println(sensorValue) — prints the number and moves to the next line.\n\ndelay(50) — 50 ms between readings gives you 20 readings per second. Fast enough to feel responsive, slow enough to read the numbers.\n\nThings to observe while turning the knob:\n· The reading should change smoothly and linearly — not in jumps.\n· If you hold the knob perfectly still, the reading will fluctuate by ±1 or ±2 — this is normal electrical noise called ADC jitter. For most projects it does not matter.\n· If the reading goes to maximum without touching the pot, the wiper pin is floating (disconnected).\n\nThis is what real sensor data looks like. Every analog sensor — temperature, light, pressure, humidity — produces a variable voltage that you read with analogRead and interpret by understanding what values mean in the real world.',
  E'void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int sensorValue = analogRead(A0);  // Read A0 (0-1023)\n  Serial.print("Sensor: ");\n  Serial.println(sensorValue);\n  delay(50);  // 20 readings per second\n}',
  'What is the maximum value analogRead can return?',
  '1023',
  E'Reading is always 0 regardless of knob position:\n· The 5V wire to the pot may be missing or not connected to the 5V pin on the Arduino.\n· Check the pot orientation — try swapping the 5V and GND connections. If it was backwards, readings will now go from 1023 to 0 as you turn left — that is fine, just re-wire to get the direction you prefer.\n\nReading is always 1023:\n· The GND wire to the pot is likely missing.\n· Or the wiper (middle pin) is not connected — A0 is floating high.\n\nReading jumps between 0 and 1023 randomly:\n· The wiper pin connection is intermittent. Re-seat all three pot connections.',
  'Serial Monitor shows smooth 0–1023 readings as you turn the potentiometer.'
),

-- Step 4 ─────────────────────────────────────────────────────────
(
  (select id from lesson), 4,
  'Map Values to Any Range',
  E'Reading raw 0–1023 values is useful for debugging, but real projects need meaningful numbers. You want the pot to control brightness (0–255), servo angle (0–180), a temperature display (like 18–35 degrees), or anything else.\n\nArduino has a built-in function for this: map()\n\nmap(value, fromLow, fromHigh, toLow, toHigh)\n\nIt takes a number in one range and scales it to another range:\n\n  map(sensorValue, 0, 1023, 0, 255)   → scales to LED brightness range\n  map(sensorValue, 0, 1023, 0, 180)   → scales to servo angle range\n  map(sensorValue, 0, 1023, 18, 35)   → scales to temperature display range\n\nThe mapping is linear — if the input is at 50%, the output is at 50% of the new range.\n\nUpload the sketch below. It uses the potentiometer to control your LED brightness in real time. Make sure your LED circuit from the Blink lesson is still on pin 9, or rebuild it.\n\nTurn the knob slowly — the LED should get brighter and dimmer as you turn.\n\nThis is the complete sensor-to-output loop:\n1. Read sensor (analogRead)\n2. Scale to useful range (map)\n3. Act on the value (analogWrite)\n\nThis three-step pattern is the foundation of almost every sensor project you will ever build. Swap the sensor for temperature, light level, or distance. Swap the output for a servo, a buzzer, or a display. The pattern stays the same.',
  E'void setup() {\n  pinMode(9, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int raw    = analogRead(A0);           // Read pot (0-1023)\n  int bright = map(raw, 0, 1023, 0, 255); // Scale to PWM range\n\n  analogWrite(9, bright);                // Set LED brightness\n\n  Serial.print("Raw: ");\n  Serial.print(raw);\n  Serial.print("  ->  Brightness: ");\n  Serial.println(bright);\n\n  delay(30);\n}',
  'What Arduino function scales a value from one range to another?',
  'map',
  E'LED does not change brightness when turning the knob:\n· Confirm the LED circuit is on pin 9 (PWM pin) with a 220Ω resistor.\n· Add a Serial.println(bright) to verify map() is returning different values. If it is always 0 or always 255, the pot wiring has an issue — go back to step 2.\n\nLED only has two states (on or off, no dimming):\n· You may have used digitalWrite instead of analogWrite. Confirm the code uses analogWrite(9, bright).\n· Confirm pin 9 is a PWM pin (the ~ symbol should be next to 9 on the board).\n\nValues in Serial Monitor do not change when turning the knob:\n· The pot wiper wire to A0 may be loose. Re-seat it firmly.',
  'Turning the potentiometer smoothly controls the LED brightness in real time.'
);
