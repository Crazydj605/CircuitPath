import json, urllib.request, time

import os
TOKEN = os.environ.get("DISCORD_BOT_TOKEN") or ""
if not TOKEN:
    raise SystemExit("Set DISCORD_BOT_TOKEN env var before running.")

def post(channel_id, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"https://discord.com/api/v10/channels/{channel_id}/messages",
        data=data,
        headers={"Authorization": f"Bot {TOKEN}", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as r:
            json.load(r)
            print(f"  posted to {channel_id}")
    except Exception as e:
        print(f"  error {channel_id}: {e}")
    time.sleep(0.9)

# rules
print("rules...")
post("1502886540374839378", {"content": (
    "# Server Rules\n\n"
    "**1. Be respectful** — No harassment or personal attacks. Everyone was a beginner once.\n\n"
    "**2. Stay on topic** — Arduino/electronics in #help, code in #code-share, projects in #showcase.\n\n"
    "**3. No spam** — Don't flood the chat or ping people without reason.\n\n"
    "**4. No self-promotion** — Don't advertise servers or products without permission.\n\n"
    "**5. Help each other** — If you know the answer, share it. This is a learning community.\n\n"
    "**6. Search before asking** — Check if your question has already been answered in #help.\n\n"
    "React with in <#1502886553662259290> to verify and unlock the server!"
)})

# verify-here
print("verify-here...")
post("1502886553662259290", {"embeds": [{
    "color": 0x22C55E,
    "title": "Verify to unlock CircuitPath",
    "description": (
        "Welcome! React with below to get the Free Member role and unlock all channels.\n\n"
        "By verifying you agree to follow the rules in <#1502886540374839378>."
    ),
    "footer": {"text": "CircuitPath - circuitpath.net"}
}]})

# announcements
print("announcements...")
post("1502884074908553296", {"embeds": [{
    "color": 0xF59E0B,
    "title": "Welcome to the CircuitPath Discord!",
    "description": (
        "The official community for CircuitPath learners is now live!\n\n"
        "This is your place to:\n"
        "- Get help with your Arduino projects\n"
        "- Share your builds in #showcase\n"
        "- Pick up daily tips in #daily-tip\n"
        "- Compete in weekly build challenges\n\n"
        "Head to circuitpath.net to start your free lessons."
    ),
    "footer": {"text": "CircuitPath - circuitpath.net"}
}]})

post("1502884074908553296", {"embeds": [{
    "color": 0x3B82F6,
    "title": "This Week's Challenge — Reaction Timer",
    "description": (
        "Build a reaction timer using a button and an LED.\n\n"
        "The LED turns on after a random delay. Press the button as fast as you can "
        "and read your reaction time on the Serial Monitor. Try to beat 200ms!"
    ),
    "fields": [{"name": "Difficulty", "value": "Beginner", "inline": True}],
    "footer": {"text": "Submit your solution at circuitpath.net"}
}]})

# daily-tip
print("daily-tip...")
post("1502884077710086174", {"embeds": [{
    "color": 0xF59E0B,
    "title": "Daily Arduino Tip",
    "description": (
        "Use millis() instead of delay() to keep your loop running while waiting. "
        "delay() completely freezes your code — nothing else can run. "
        "millis() lets you check timing without stopping everything."
    ),
    "footer": {"text": "CircuitPath - circuitpath.net"}
}]})

post("1502884077710086174", {"embeds": [{
    "color": 0xF59E0B,
    "title": "Daily Arduino Tip",
    "description": (
        "Always put a 220 ohm resistor in series with an LED. "
        "Without it you are sending too much current through the LED "
        "and it will burn out fast, or worse, damage your Arduino pin."
    ),
    "footer": {"text": "CircuitPath - circuitpath.net"}
}]})

post("1502884077710086174", {"embeds": [{
    "color": 0xF59E0B,
    "title": "Daily Arduino Tip",
    "description": (
        "INPUT_PULLUP mode activates a built-in resistor so you do not need "
        "an external one for buttons.\n\n"
        "pinMode(BTN, INPUT_PULLUP) — button reads HIGH when not pressed, LOW when pressed."
    ),
    "footer": {"text": "CircuitPath - circuitpath.net"}
}]})

# introductions
print("introductions...")
post("1502886546368499773", {"content": (
    "**Welcome to #introductions!**\n\n"
    "Tell us about yourself:\n"
    "- How long have you been into Arduino / electronics?\n"
    "- What is the coolest thing you have built?\n"
    "- What are you hoping to learn?\n\n"
    "Don't be shy — everyone here started at zero!"
)})

# general
print("general...")
post("1502884082026156175", {"content": (
    "Welcome everyone! Glad to have you in the CircuitPath community.\n\n"
    "This is your main chat. Talk about projects, ask quick questions, or just hang out.\n"
    "For detailed help head to <#1502884084794527875>. "
    "For code use <#1502886548780093492>. "
    "For project photos use <#1502884087768285264>."
)})

post("1502884082026156175", {"content": (
    "Quick tip for new members: the best way to learn Arduino is to just start building something. "
    "Pick a simple project, follow along on circuitpath.net, and ask questions here when you get stuck. "
    "That is literally it. You will be surprised how fast it clicks."
)})

# help
print("help...")
post("1502884084794527875", {"content": (
    "**How to get the best help here:**\n\n"
    "**1. Describe what you are trying to do**\n"
    "\"I am trying to make an LED blink every second\" is better than \"it doesn't work\"\n\n"
    "**2. Share your code**\n"
    "Post it in <#1502886548780093492> and link back here\n\n"
    "**3. Describe what is actually happening**\n"
    "What do you see? What did you expect? Any error messages?\n\n"
    "**4. Share a photo if it is a wiring issue**\n"
    "Most Arduino problems are wiring problems!\n\n"
    "Someone will help you out. We have all been stuck before."
)})

# showcase
print("showcase...")
post("1502884087768285264", {"embeds": [{
    "color": 0xF59E0B,
    "title": "Featured Project — Temperature Display",
    "description": (
        "A DHT11 sensor reading temperature and humidity, displayed live on a 16x2 LCD screen.\n\n"
        "Built in under an hour using a starter kit. The display updates every 2 seconds "
        "and shows both celsius and a heat index.\n\n"
        "Components: Arduino Uno, DHT11, 16x2 LCD, 10k potentiometer"
    ),
    "footer": {"text": "Share your builds here!"}
}]})

post("1502884087768285264", {"embeds": [{
    "color": 0x3B82F6,
    "title": "Featured Project — Mini Weather Station",
    "description": (
        "Combined a BMP180 pressure sensor with a DHT11 to build a weather station "
        "that logs temperature, humidity, and pressure to the Serial Monitor every 10 seconds.\n\n"
        "Next step is adding an SD card to save the data to a CSV file."
    ),
    "footer": {"text": "Share your builds here!"}
}]})

# code-share
print("code-share...")
post("1502886548780093492", {"content": (
    "**Non-blocking blink with millis() — the right way to handle timing:**\n"
    "```cpp\n"
    "const int LED_PIN = 13;\n"
    "unsigned long lastToggle = 0;\n"
    "bool ledState = false;\n"
    "\n"
    "void setup() {\n"
    "  pinMode(LED_PIN, OUTPUT);\n"
    "}\n"
    "\n"
    "void loop() {\n"
    "  if (millis() - lastToggle >= 1000) {\n"
    "    lastToggle = millis();\n"
    "    ledState = !ledState;\n"
    "    digitalWrite(LED_PIN, ledState);\n"
    "  }\n"
    "  // other code can run here without being blocked\n"
    "}\n"
    "```\n"
    "Unlike delay(1000) this lets your loop keep running while you wait."
)})

post("1502886548780093492", {"content": (
    "**Button debounce — stops false triggers:**\n"
    "```cpp\n"
    "const int BTN_PIN = 2;\n"
    "unsigned long lastPress = 0;\n"
    "\n"
    "void setup() {\n"
    "  pinMode(BTN_PIN, INPUT_PULLUP);\n"
    "  Serial.begin(9600);\n"
    "}\n"
    "\n"
    "void loop() {\n"
    "  if (digitalRead(BTN_PIN) == LOW && millis() - lastPress > 50) {\n"
    "    lastPress = millis();\n"
    "    Serial.println(\"Button pressed!\");\n"
    "  }\n"
    "}\n"
    "```\n"
    "The > 50 check ignores the noisy bounce right after a press."
)})

print("\nDone! Server is now populated.")
