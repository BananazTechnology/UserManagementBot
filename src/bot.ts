import { Client, Message } from 'discord.js'
import * as dotenv from 'dotenv'
import path from 'path'
import interactionCreate from './hooks/interactionCreate'
import ready from './hooks/ready'
import * as fs from 'fs'

dotenv.config({ path: path.resolve('./config.env') })
const token = process.env.DSCRD_BOT_TK

console.log('Bot is starting...')

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS']
})

const emojiMapping = readConfig()
console.log(emojiMapping)

ready(client)
interactionCreate(client)

client.login(token)
client.on('messageCreate', message => {
  // if (message.channelId === '875900347145682944') {
  //   applyReactions(message)
  // }
  if (message.channelId === '936494511054520390' || message.channelId === '936497596510388294') {
    hypeItUp(message)
  }
})

// function applyReactions (message : Message) {
//   console.log('New Sale')
//   console.log('Title')
//   console.log(message.embeds[0].author ? message.embeds[0].author.name : 'null')
//   const reactions = ['psych_sip', 'DF_Salute', 'df_bull']
//   reactions.forEach(reaction => {
//     if (message.guild) {
//       const react = message.guild.emojis.cache.find(emoji => emoji.name === reaction)
//       if (react) {
//         message.react(react.id)
//       }
//     }
//   })
// }

function hypeItUp (message : Message) {
  const lc = message.content.toLowerCase()
  emojiMapping.keyValues.forEach((kv: { key: string, emojis: string[] }) => {
    // lower case version of message content searching reaction key values for a match
    if (lc.includes(kv.key)) {
      console.log(`Triggering hype it up! ${kv.key}`)
      // if a match is found, grab the array of emojis
      kv.emojis.forEach((emoji) => {
        if (message.guild) {
          // map those emojics to the guild's cache and apply by using the id
          const reaction = message.guild.emojis.cache.find(c => c.name === emoji)
          if (reaction) {
            message.react(reaction.id)
          } else {
            message.react(`:${emoji}:`)
          }
        }
      })
    }
  })
}

function readConfig () {
  console.log('Reading in reactions file ...')
  // eslint-disable-next-line no-undef
  const data = fs.readFileSync(path.join(__dirname, 'reactions.json'))
  return JSON.parse(data.toString())
}
