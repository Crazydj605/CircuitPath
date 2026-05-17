import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js'

const TOKEN      = process.env.DISCORD_TOKEN
const GID        = process.env.DISCORD_GUILD_ID    || '1502876977512714240'
const CH_ANN     = process.env.CH_ANNOUNCEMENTS    || '1502884074908553296'
const CH_TIP     = process.env.CH_DAILY_TIP        || '1502884077710086174'
const CH_GEN     = process.env.CH_GENERAL          || '1502884082026156175'
const CH_VERIFY  = process.env.CH_VERIFY           || '1502886553662259290'
const CH_MODLOG  = process.env.CH_MODLOG           || '1502897735676985364'
const VERIFY_MSG = process.env.VERIFY_MSG_ID       || '1502886556191424562'
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Channels where links are allowed
const LINK_OK_CHANNELS = new Set([
  '1502884087768285264', // showcase
  '1502886548780093492', // code-share
])

// Roles that can post links anywhere
const LINK_OK_ROLES = new Set([
  '1502881482832744518', // Max Member
  '1502881484804194354', // Pro Member
])

const TIPS = [
  "Use `millis()` instead of `delay()` to keep your loop running while waiting. `delay()` freezes everything!",
  "Always put a 220Ω resistor in series with an LED to protect it from burning out.",
  "The Arduino Uno has 6 PWM pins: 3, 5, 6, 9, 10, 11. Only these can use `analogWrite()`.",
  "Use `Serial.begin(9600)` in setup() and `Serial.println()` to debug without a screen.",
  "Pull-down resistor trick: connect a 10kΩ resistor from your button pin to GND for a stable LOW when not pressed.",
  "The `map()` function is super useful: `map(val, 0, 1023, 0, 255)` rescales an analog read to a PWM range.",
  "Always double-check your power pins — plugging 5V into an analog pin by mistake can damage your board.",
  "Use `const` for pin numbers at the top of your sketch: `const int LED_PIN = 13;` — it makes code readable.",
  "`INPUT_PULLUP` mode activates a built-in resistor so you don't need an external one for buttons.",
  "Capacitors across your power rails (100µF + 100nF) reduce noise, especially important with motors.",
  "The `tone(pin, frequency, duration)` function plays a note on a buzzer without blocking your code.",
  "EEPROM on the Uno can store 1024 bytes that survive power-off. Use `EEPROM.put()` and `EEPROM.get()`.",
  "Servos need their own power supply when using more than one — drawing from Arduino 5V causes resets.",
  "Use `volatile` for variables shared between your main code and an ISR (interrupt service routine).",
  "The I2C bus only needs 2 wires (SDA + SCL) to connect up to 127 different sensors at once.",
  "Debounce buttons in software: check `millis() - lastPress > 50` before acting on a press.",
  "When measuring temperature with DHT11, always wait 2 seconds between readings — it updates that slowly.",
  "Use `analogReference(INTERNAL)` for more precise readings from low-voltage sensors.",
  "A 1N4007 diode across a motor (cathode to +) protects your Arduino from back-EMF voltage spikes.",
  "Use `Serial.print()` with no newline for inline values: `Serial.print(x); Serial.print(', '); Serial.println(y);`",
  "State machines make complex programs easy — use an `enum` and `switch/case` instead of nested if/else.",
  "The HC-SR04 ultrasonic sensor measures distance: `cm = pulseIn(ECHO, HIGH) * 0.0343 / 2`.",
  "Keep your ISR functions tiny — set a flag and handle the real work in `loop()`.",
  "Wire your Arduino project on a breadboard first, then solder it once you know it works.",
  "The `constrain(val, min, max)` function clamps a value to a range — great for PWM and servo angles.",
  "RGB LEDs have 4 legs: one common cathode (longest) and one for each color — red, green, blue.",
  "Use `F()` macro to store strings in flash memory: `Serial.println(F(\"Hello\"))` saves RAM on Uno.",
  "A logic level converter is needed when connecting 3.3V sensors (like HC-05 RX) to 5V Arduino pins.",
]

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ]
})

// ── Scheduled task state ─────────────────────────────────────────────────────
let lastTipDay       = -1
let lastWeekDay      = -1
let lastLessonCheck  = 0
let knownLessonSlugs = new Set()

// ── Moderation state ─────────────────────────────────────────────────────────
const spamTracker = new Map()  // userId -> array of timestamps
const warnCounts  = new Map()  // userId -> warn count

// ── Moderation helpers ───────────────────────────────────────────────────────
async function modLog(color, title, fields) {
  try {
    const ch = await client.channels.fetch(CH_MODLOG)
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .addFields(fields)
      .setTimestamp()
    await ch.send({ embeds: [embed] })
  } catch (e) { console.error('modLog error:', e.message) }
}

async function warn(member, reason) {
  const userId = member.id
  const count  = (warnCounts.get(userId) || 0) + 1
  warnCounts.set(userId, count)

  await modLog(0xF59E0B, '⚠️ Member Warned', [
    { name: 'User',   value: `<@${userId}> (${member.user.tag})`, inline: true },
    { name: 'Warns',  value: `${count}`,                          inline: true },
    { name: 'Reason', value: reason },
  ])

  try {
    if (count === 2) {
      await member.timeout(10 * 60 * 1000, `Auto-mod: ${count} warnings`)
      await modLog(0xEF4444, '🔇 Auto-Muted (10 min)', [
        { name: 'User',   value: `<@${userId}>`, inline: true },
        { name: 'Reason', value: `Reached ${count} warnings` },
      ])
    } else if (count === 3) {
      await member.timeout(60 * 60 * 1000, `Auto-mod: ${count} warnings`)
      await modLog(0xEF4444, '🔇 Auto-Muted (1 hour)', [
        { name: 'User',   value: `<@${userId}>`, inline: true },
        { name: 'Reason', value: `Reached ${count} warnings` },
      ])
    } else if (count === 5) {
      await member.kick(`Auto-mod: ${count} warnings`)
      await modLog(0xDC2626, '👢 Auto-Kicked', [
        { name: 'User',   value: member.user.tag, inline: true },
        { name: 'Reason', value: `Reached ${count} warnings` },
      ])
    } else if (count >= 7) {
      await member.ban({ reason: `Auto-mod: ${count} warnings` })
      await modLog(0x991B1B, '🔨 Auto-Banned', [
        { name: 'User',   value: member.user.tag, inline: true },
        { name: 'Reason', value: `Reached ${count} warnings` },
      ])
    }
  } catch (e) { console.error('Escalation error:', e.message) }
}

// ── Profanity / slur word list ───────────────────────────────────────────────
const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'cock',
  'pussy', 'whore', 'slut', 'faggot', 'fag', 'nigger', 'nigga', 'chink',
  'spic', 'kike', 'tranny', 'retard', 'retarded', 'rape', 'raping',
]
const BAD_WORD_REGEX = new RegExp(`\\b(${BAD_WORDS.join('|')})\\b`, 'i')

// ── Message moderation ───────────────────────────────────────────────────────
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return
  if (!message.guild)     return

  const member    = message.member
  const content   = message.content
  const channelId = message.channelId
  const userId    = message.author.id
  const now       = Date.now()

  console.log(`MSG [${message.author.tag}] content="${content}" mentions=${message.mentions.users.size}`)

  // Spam: 5+ messages in 5 seconds
  const stamps = (spamTracker.get(userId) || []).filter(t => now - t < 5000)
  stamps.push(now)
  spamTracker.set(userId, stamps)
  if (stamps.length >= 5) {
    spamTracker.set(userId, [])
    try {
      const recent   = await message.channel.messages.fetch({ limit: 10 })
      const userMsgs = recent.filter(m => m.author.id === userId)
      await message.channel.bulkDelete(userMsgs)
    } catch {}
    await warn(member, 'Spam — 5+ messages in 5 seconds')
    return
  }

  // Profanity / slur filter — delete + warn
  if (BAD_WORD_REGEX.test(content)) {
    await message.delete().catch(() => {})
    await warn(member, 'Used a banned word or slur')
    return
  }

  // Link filter — catches https://, www., discord.gg/, and bare domains like google.com
  const hasLink = /https?:\/\/|discord\.gg\/|www\.|[\w-]+\.(com|net|org|io|co|gg|tv|me|app|dev|xyz|gg)\b/i.test(content)
  if (hasLink && !LINK_OK_CHANNELS.has(channelId)) {
    const hasAllowedRole = member.roles.cache.some(r => LINK_OK_ROLES.has(r.id))
    if (!hasAllowedRole) {
      await message.delete().catch(() => {})
      await warn(member, 'Posted a link outside of #code-share or #showcase')
      return
    }
  }

  // Caps filter: delete if >3 letters and >70% uppercase
  if (content.length > 3) {
    const letters = content.replace(/[^a-zA-Z]/g, '')
    const upper   = content.replace(/[^A-Z]/g, '')
    if (letters.length >= 3 && upper.length / letters.length > 0.70) {
      await message.delete().catch(() => {})
      return
    }
  }

  // Mention spam: 4+ unique user mentions
  if (message.mentions.users.size >= 4) {
    await message.delete().catch(() => {})
    await warn(member, `Mention spam — ${message.mentions.users.size} mentions in one message`)
    return
  }
})

// ── Log deleted messages ─────────────────────────────────────────────────────
client.on(Events.MessageDelete, async (message) => {
  if (!message.author || message.author.bot) return
  if (message.channelId === CH_MODLOG)       return
  await modLog(0x6B7280, '🗑️ Message Deleted', [
    { name: 'User',    value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
    { name: 'Channel', value: `<#${message.channelId}>`,                         inline: true },
    { name: 'Content', value: message.content?.slice(0, 1000) || '*(no content)*' },
  ])
})

// ── Verification reaction ────────────────────────────────────────────────────
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return
  if (reaction.message.id !== VERIFY_MSG) return
  if (reaction.emoji.name !== '✅') return
  try {
    const guild    = await client.guilds.fetch(GID)
    const member   = await guild.members.fetch(user.id)
    const freeRole = guild.roles.cache.find(r => r.name === 'Free Member')
    if (freeRole && !member.roles.cache.has(freeRole.id)) {
      await member.roles.add(freeRole)
      console.log(`✅ Verified: ${user.tag}`)
    }
  } catch (e) { console.error('Verify error:', e.message) }
})

// ── Welcome new members ──────────────────────────────────────────────────────
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const guild    = member.guild
    const freeRole = guild.roles.cache.find(r => r.name === 'Free Member')
    if (freeRole) await member.roles.add(freeRole)

    const genChannel = guild.channels.cache.get(CH_GEN)
    if (genChannel) {
      await genChannel.send(
        `👋 Welcome to CircuitPath, <@${member.id}>!\n` +
        `Start learning Arduino for free at **circuitpath.net** 🔗\n` +
        `Ask questions in <#${CH_GEN}> — we're here to help!`
      )
    }
  } catch (e) { console.error('Welcome error:', e.message) }
})

// ── Scheduled tasks (check every minute) ────────────────────────────────────
setInterval(async () => {
  const now  = new Date()
  const hour = now.getHours()
  const day  = now.getDate()
  const dow  = now.getDay()

  // Daily tip at 9am
  if (hour === 9 && day !== lastTipDay) {
    lastTipDay = day
    try {
      const tip   = TIPS[day % TIPS.length]
      const ch    = await client.channels.fetch(CH_TIP)
      const embed = new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle('⚡ Daily Arduino Tip')
        .setDescription(tip)
        .setFooter({ text: 'CircuitPath • circuitpath.net' })
        .setTimestamp()
      await ch.send({ embeds: [embed] })
      console.log('Daily tip posted')
    } catch (e) { console.error('Tip error:', e.message) }
  }

  // Weekly challenge — every Monday at 9am
  if (dow === 1 && hour === 9 && day !== lastWeekDay) {
    lastWeekDay = day
    try {
      if (SUPABASE_URL && SUPABASE_KEY) {
        const now_iso = new Date().toISOString()
        const res     = await fetch(`${SUPABASE_URL}/rest/v1/weekly_challenges?created_at=lte.${now_iso}&order=created_at.desc&limit=1`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        })
        const [challenge] = await res.json()
        if (challenge) {
          const ch    = await client.channels.fetch(CH_ANN)
          const embed = new EmbedBuilder()
            .setColor(0x3B82F6)
            .setTitle('🏆 Weekly Challenge')
            .setDescription(`**${challenge.title}**\n\n${challenge.description || ''}`)
            .addFields({ name: 'Difficulty', value: challenge.difficulty || 'Intermediate', inline: true })
            .setFooter({ text: 'Submit your solution at circuitpath.net' })
            .setTimestamp()
          await ch.send({ content: '@everyone New weekly challenge is live!', embeds: [embed] })
          console.log('Weekly challenge posted')
        }
      }
    } catch (e) { console.error('Challenge error:', e.message) }
  }

  // New lesson check every hour
  if (Date.now() - lastLessonCheck > 3_600_000 && SUPABASE_URL && SUPABASE_KEY) {
    lastLessonCheck = Date.now()
    try {
      const res     = await fetch(`${SUPABASE_URL}/rest/v1/learning_lessons?is_published=eq.true&select=slug,title,difficulty,required_tier`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      })
      const lessons = await res.json()

      if (knownLessonSlugs.size === 0) {
        lessons.forEach(l => knownLessonSlugs.add(l.slug))
        console.log(`Seeded ${knownLessonSlugs.size} known lessons`)
        return
      }

      const newLessons = lessons.filter(l => !knownLessonSlugs.has(l.slug))
      for (const lesson of newLessons) {
        knownLessonSlugs.add(lesson.slug)
        const ch        = await client.channels.fetch(CH_ANN)
        const tierEmoji = { free: '🆓', pro: '🔵', max: '💎' }[lesson.required_tier] || '📚'
        const embed     = new EmbedBuilder()
          .setColor(0xF59E0B)
          .setTitle(`📚 New Lesson: ${lesson.title}`)
          .setDescription(`A new **${lesson.difficulty}** lesson is now live on CircuitPath!`)
          .addFields(
            { name: 'Tier',       value: `${tierEmoji} ${lesson.required_tier}`, inline: true },
            { name: 'Difficulty', value: lesson.difficulty,                       inline: true },
          )
          .setURL(`https://circuitpath.net/learn/${lesson.slug}`)
          .setFooter({ text: 'circuitpath.net' })
          .setTimestamp()
        await ch.send({ content: '📢 New lesson just dropped!', embeds: [embed] })
        console.log(`New lesson announced: ${lesson.title}`)
      }
    } catch (e) { console.error('Lesson check error:', e.message) }
  }
}, 60_000)

client.once(Events.ClientReady, (c) => {
  console.log(`✅ CircuitPath bot online as ${c.user.tag}`)
})

client.login(TOKEN)
