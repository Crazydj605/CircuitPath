-- CircuitPath Phase D — Arduino Boards reference section
-- Adds the arduino_boards table + seeds 6 boards across the tier ladder.

create table if not exists arduino_boards (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  manufacturer text not null,
  blurb text not null,
  description_md text,
  microcontroller text,
  clock_speed_mhz integer,
  flash_kb integer,
  ram_kb integer,
  eeprom_kb integer,
  digital_pins integer,
  analog_pins integer,
  pwm_pins integer,
  operating_voltage text,
  input_voltage text,
  price_usd numeric(6,2),
  has_wifi boolean default false,
  has_bluetooth boolean default false,
  has_usb_c boolean default false,
  dimensions text,
  weight_g numeric(6,2),
  release_year integer,
  good_for text[],
  not_for text[],
  common_projects text[],
  image_url text,
  pinout_pins jsonb,
  amazon_url text,
  required_tier text not null check (required_tier in ('free','pro','max')),
  order_index integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_boards_published on arduino_boards (is_published, order_index);
alter table arduino_boards enable row level security;

drop policy if exists "anyone reads boards" on arduino_boards;
create policy "anyone reads boards" on arduino_boards
  for select using (is_published = true);

-- ─────────────────────────────────────────────────────────────────
-- Seed 6 boards
-- ─────────────────────────────────────────────────────────────────

insert into arduino_boards (
  slug, name, manufacturer, blurb, description_md,
  microcontroller, clock_speed_mhz, flash_kb, ram_kb, eeprom_kb,
  digital_pins, analog_pins, pwm_pins, operating_voltage, input_voltage,
  price_usd, has_wifi, has_bluetooth, has_usb_c, dimensions, weight_g, release_year,
  good_for, not_for, common_projects,
  pinout_pins, amazon_url, required_tier, order_index
)
values

-- 1. Arduino Uno R3 (FREE)
(
  'uno-r3', 'Arduino Uno R3', 'Arduino',
  'The classic. The board you should start with — bulletproof, beginner-friendly, and every tutorial on the internet assumes you have one.',
  E'The Arduino Uno R3 is the most popular microcontroller board in the world. Powered by the ATmega328P chip, it runs at 16 MHz with 32 KB of program memory and 2 KB of RAM — plenty for thousands of beginner and intermediate projects.\n\nWhat makes the Uno special isn''t the specs (they''re modest) — it''s the ecosystem. Almost every Arduino tutorial, library, and shield you will ever find is written assuming you have a Uno. If you''re new to electronics, start here.\n\nThe Uno has 14 digital pins (6 of which support PWM) and 6 analog input pins. It runs at 5V, which makes it tolerant of beginner mistakes that would fry more sensitive 3.3V boards.',
  'ATmega328P', 16, 32, 2, 1,
  14, 6, 6, '5V', '7-12V',
  27.60, false, false, false, '68.6 × 53.4 mm', 25, 2010,
  ARRAY['Your first project', 'Learning Arduino fundamentals', 'Following any online tutorial', 'Shields and add-on boards', '5V sensor projects'],
  ARRAY['WiFi or Bluetooth projects', 'Battery-powered designs (high power draw)', 'High-performance math or audio'],
  ARRAY['Blink an LED', 'Read a button', 'Servo control', 'Temperature logger', 'Traffic light state machine'],
  '[
    {"label":"D0 (RX)","x":85,"y":12,"type":"serial","description":"Hardware serial receive pin. Used for uploading code and Serial.read()."},
    {"label":"D1 (TX)","x":85,"y":19,"type":"serial","description":"Hardware serial transmit pin. Used for Serial.print()."},
    {"label":"D2","x":85,"y":26,"type":"digital","description":"General-purpose digital I/O. Supports external interrupts."},
    {"label":"D3 ~","x":85,"y":33,"type":"pwm","description":"Digital I/O + PWM output (analogWrite 0-255)."},
    {"label":"D4","x":85,"y":40,"type":"digital","description":"General-purpose digital I/O."},
    {"label":"D5 ~","x":85,"y":47,"type":"pwm","description":"Digital I/O + PWM output."},
    {"label":"D6 ~","x":85,"y":54,"type":"pwm","description":"Digital I/O + PWM output."},
    {"label":"D7","x":85,"y":61,"type":"digital","description":"General-purpose digital I/O."},
    {"label":"D8","x":85,"y":68,"type":"digital","description":"General-purpose digital I/O."},
    {"label":"D9 ~","x":85,"y":75,"type":"pwm","description":"Digital I/O + PWM output. The classic LED-blink pin."},
    {"label":"D10 ~ (SS)","x":85,"y":82,"type":"spi","description":"PWM + SPI Slave Select."},
    {"label":"D11 ~ (MOSI)","x":85,"y":89,"type":"spi","description":"PWM + SPI Master Out Slave In."},
    {"label":"D12 (MISO)","x":78,"y":89,"type":"spi","description":"SPI Master In Slave Out."},
    {"label":"D13 (SCK)","x":71,"y":89,"type":"spi","description":"SPI Clock + built-in LED."},
    {"label":"A0","x":15,"y":89,"type":"analog","description":"Analog input 0. analogRead returns 0-1023."},
    {"label":"A1","x":22,"y":89,"type":"analog","description":"Analog input 1."},
    {"label":"A2","x":29,"y":89,"type":"analog","description":"Analog input 2."},
    {"label":"A3","x":36,"y":89,"type":"analog","description":"Analog input 3."},
    {"label":"A4 (SDA)","x":43,"y":89,"type":"i2c","description":"Analog input + I²C SDA data line."},
    {"label":"A5 (SCL)","x":50,"y":89,"type":"i2c","description":"Analog input + I²C SCL clock line."},
    {"label":"5V","x":29,"y":75,"type":"power","description":"5V power output. Source for sensors and LEDs."},
    {"label":"3.3V","x":22,"y":75,"type":"power","description":"3.3V regulated output (50 mA max)."},
    {"label":"GND","x":36,"y":75,"type":"ground","description":"Ground. Connect every circuit''s negative return here."},
    {"label":"Vin","x":43,"y":75,"type":"power","description":"Input voltage when powered from external supply (7-12V)."},
    {"label":"RESET","x":15,"y":75,"type":"special","description":"Pull LOW to reset the board."},
    {"label":"AREF","x":78,"y":12,"type":"special","description":"Analog reference voltage for analogRead()."}
  ]'::jsonb,
  'https://www.amazon.com/dp/B01D8KOZF4?tag=circuitpath-20',
  'free', 10
),

-- 2. Arduino Nano (FREE)
(
  'nano', 'Arduino Nano', 'Arduino',
  'Same brain as the Uno, fits on a postage stamp. Solders right into a breadboard. The go-to for permanent projects.',
  E'The Arduino Nano is the Uno''s tiny twin. Same ATmega328P chip, same 32 KB of program memory, same 5V logic — but in a footprint smaller than a USB stick.\n\nThe key difference is form factor. The Nano has header pins that plug straight into a breadboard, making it perfect for projects you actually want to keep. Most makers prototype on a Uno and then transfer the final design to a Nano to make it portable and battery-friendly.\n\nOne quirk: cheaper Nano clones often use the CH340 USB chip instead of the official FT232, which means you may need to install a driver before your computer recognizes the board.',
  'ATmega328P', 16, 32, 2, 1,
  14, 8, 6, '5V', '7-12V',
  24.00, false, false, false, '45 × 18 mm', 7, 2008,
  ARRAY['Permanent breadboard projects', 'Wearables and small enclosures', 'Battery-powered builds', 'When you want a "real" project, not a prototype', 'Anything the Uno does, but smaller'],
  ARRAY['WiFi or Bluetooth projects', 'High pin-count needs', 'Cases that don''t fit a breadboard form factor'],
  ARRAY['Wearable LED badges', 'Small robot brains', 'Sensor data loggers', 'MIDI controllers', 'Battery-powered timers'],
  null,
  'https://www.amazon.com/s?k=arduino+nano+3+pack&tag=circuitpath-20',
  'free', 20
),

-- 3. Arduino Mega 2560 (PRO)
(
  'mega-2560', 'Arduino Mega 2560', 'Arduino',
  'The big brother. Quadruple the pins, eight times the memory. For projects that outgrew the Uno.',
  E'When your project needs more pins than the Uno offers, the Mega 2560 is the obvious upgrade. It has 54 digital pins (15 PWM), 16 analog inputs, and 256 KB of flash memory — eight times what the Uno carries.\n\nThe Mega runs the ATmega2560 chip at the same 16 MHz as the Uno, so existing code generally just works — you just have far more I/O to play with. It also has four hardware serial ports (the Uno has one), which is huge for projects that talk to multiple modules at once: GPS, Bluetooth, an LCD, and a debug monitor all running simultaneously without software-serial hacks.\n\nDownside: it''s bigger, more expensive, and overkill for blink-LED projects. If you''re wondering whether you need a Mega, you probably don''t yet.',
  'ATmega2560', 16, 256, 8, 4,
  54, 16, 15, '5V', '7-12V',
  48.00, false, false, false, '101.5 × 53.3 mm', 37, 2010,
  ARRAY['CNC machines and 3D printers', 'Projects with many sensors or motors', '4-line LCDs + buttons + relays at once', 'Robots with arms, drivetrain, and sensors', 'When the Uno runs out of pins'],
  ARRAY['Portable/wearable projects', 'Quick prototypes (overkill)', 'Battery builds (high power draw)'],
  ARRAY['3D printer firmware (Marlin)', 'CNC controller (GRBL Mega)', '16-channel servo robot', 'Multi-room sensor hub', 'Aquarium controller'],
  null,
  'https://www.amazon.com/s?k=arduino+mega+2560+r3&tag=circuitpath-20',
  'pro', 30
),

-- 4. ESP32 DevKit (PRO)
(
  'esp32-devkit', 'ESP32 DevKit', 'Espressif',
  'The internet-connected powerhouse. Built-in WiFi + Bluetooth, 8× the speed of the Uno, $10. Almost too good to be true.',
  E'The ESP32 changed the game. It''s a dual-core processor running at 240 MHz with built-in WiFi and Bluetooth, and a developer-friendly board (the DevKit) costs about $10 — less than half what an official Uno costs.\n\nIt runs the same Arduino IDE and most Arduino libraries with minor tweaks. Once you discover the ESP32 and start building WiFi-connected projects (web servers, MQTT, OTA updates, Home Assistant integrations), it''s hard to go back to the Uno.\n\nKey gotcha: the ESP32 runs at 3.3V, not 5V. Sensors and modules that need 5V (or 5V logic levels) will not work directly — you''ll need level shifters. Many beginners get tripped up by this when porting an Uno project.',
  'Tensilica Xtensa LX6 (dual-core)', 240, 4096, 520, 0,
  34, 18, 16, '3.3V', '5V (USB)',
  10.00, true, true, false, '51 × 28 mm', 8, 2016,
  ARRAY['Anything that talks to WiFi', 'Bluetooth gadgets', 'Home automation (Home Assistant, ESPHome)', 'Web servers on a tiny device', 'Battery projects (deep-sleep modes)'],
  ARRAY['5V sensors without level-shifting', 'Tutorials that assume 5V logic', 'Pure analog audio (DAC is limited)'],
  ARRAY['WiFi weather station with web UI', 'Smart light controller', 'Bluetooth game controller', 'IoT mailbox notifier', 'OTA-updated sensor mesh'],
  null,
  'https://www.amazon.com/s?k=ESP32+DevKit+v1&tag=circuitpath-20',
  'pro', 40
),

-- 5. Raspberry Pi Pico (PRO)
(
  'pi-pico', 'Raspberry Pi Pico', 'Raspberry Pi Foundation',
  'A $4 dual-core ARM chip from the Raspberry Pi team. Programmable in MicroPython or Arduino. Punches way above its weight.',
  E'The Raspberry Pi Pico is the Pi Foundation''s first microcontroller (not a single-board computer). It uses their custom RP2040 chip — a dual-core ARM Cortex-M0+ running at 133 MHz with 264 KB of RAM and 2 MB of flash. At $4, it has no business being this powerful.\n\nThe Pico is fundamentally different from a classic Arduino in three ways: (1) it runs at 3.3V like the ESP32, (2) it has Programmable I/O (PIO) — tiny state machines that can do timing-critical work without using CPU cycles, and (3) it natively supports MicroPython, so you can also program it without C++.\n\nThere''s a Pico W variant that adds WiFi for $6. For most makers in 2025+, the Pico W is the new "default" board for new projects.',
  'RP2040 (dual ARM Cortex-M0+)', 133, 2048, 264, 0,
  26, 3, 16, '3.3V', '1.8-5.5V',
  4.00, false, false, false, '51 × 21 mm', 3, 2021,
  ARRAY['Budget-friendly projects', 'MicroPython learners', 'Precise timing (PIO blocks)', 'Battery builds (low power)', 'When you need raw speed cheap'],
  ARRAY['5V Arduino shields', 'Anything that needs a true UNO pinout', 'Heavy floating-point math (no FPU)'],
  ARRAY['LED matrix displays', 'Mechanical keyboard firmware (KMK)', 'Drone flight controllers', 'Synth modules', 'Logic analyzer'],
  null,
  'https://www.amazon.com/s?k=raspberry+pi+pico&tag=circuitpath-20',
  'pro', 50
),

-- 6. Arduino Portenta H7 (MAX)
(
  'portenta-h7', 'Arduino Portenta H7', 'Arduino Pro',
  'Industrial-grade. Dual cores (Cortex-M7 + M4), WiFi/Bluetooth/USB-C, runs ARM Mbed OS, Arduino IDE, Python, or TensorFlow Lite.',
  E'The Portenta H7 is Arduino''s flagship industrial board. It runs an STM32H747 with two cores — a Cortex-M7 at 480 MHz alongside a Cortex-M4 at 240 MHz — both of which can run separate programs simultaneously. You can have one core handling real-time motor control while the other runs a web server or a vision model.\n\nIt''s designed for edge AI, industrial IoT, and prototypes that need to go to production. It supports the standard Arduino IDE, but also ARM Mbed OS, MicroPython, and TensorFlow Lite for on-device machine learning.\n\nAt around $100, this is not a hobbyist board for blinking LEDs. It''s for makers who have outgrown the Mega and ESP32, or for teams prototyping commercial products.',
  'STM32H747XI (Cortex-M7 + M4)', 480, 2048, 1024, 0,
  22, 8, null, '3.3V', '5V (USB-C)',
  103.40, true, true, true, '66 × 25 mm', 11, 2020,
  ARRAY['Edge AI and machine learning (TensorFlow Lite)', 'Industrial IoT', 'Dual-core real-time + WiFi simultaneously', 'Camera and computer-vision projects', 'Commercial prototypes'],
  ARRAY['Your first Arduino project', 'Anything a Uno can do', 'Tight budgets'],
  ARRAY['On-device gesture recognition', 'Predictive maintenance sensors', 'Camera-based object detection', 'Multi-protocol industrial gateway', 'Dual-core robotics controller'],
  null,
  'https://store-usa.arduino.cc/products/portenta-h7',
  'max', 60
)

on conflict (slug) do update set
  name = excluded.name,
  manufacturer = excluded.manufacturer,
  blurb = excluded.blurb,
  description_md = excluded.description_md,
  microcontroller = excluded.microcontroller,
  clock_speed_mhz = excluded.clock_speed_mhz,
  flash_kb = excluded.flash_kb,
  ram_kb = excluded.ram_kb,
  eeprom_kb = excluded.eeprom_kb,
  digital_pins = excluded.digital_pins,
  analog_pins = excluded.analog_pins,
  pwm_pins = excluded.pwm_pins,
  operating_voltage = excluded.operating_voltage,
  input_voltage = excluded.input_voltage,
  price_usd = excluded.price_usd,
  has_wifi = excluded.has_wifi,
  has_bluetooth = excluded.has_bluetooth,
  has_usb_c = excluded.has_usb_c,
  dimensions = excluded.dimensions,
  weight_g = excluded.weight_g,
  release_year = excluded.release_year,
  good_for = excluded.good_for,
  not_for = excluded.not_for,
  common_projects = excluded.common_projects,
  pinout_pins = excluded.pinout_pins,
  amazon_url = excluded.amazon_url,
  required_tier = excluded.required_tier,
  order_index = excluded.order_index;
