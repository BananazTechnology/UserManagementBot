import { Client, Message, MessageEmbed } from 'discord.js'
import * as dotenv from 'dotenv'
import path from 'path'
import ready from './hooks/ready'
import { User } from './classes/user'

dotenv.config({ path: path.resolve('./config.env') })
const token = process.env.DSCRD_BOT_TK

console.log('Bot is starting...')

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS']
})

ready(client)

client.login(token)
client.on('messageCreate', message => {
  console.log(message.content)
  if (message.author.id === client.user?.id) return
  if (message.channelId === process.env.GAME_CHANNEL) {
    processUserInfo(message)
  } else if (message.channelId === process.env.GAME_CHANNEL1) {
    processUserInfo(message)
  } else if (message.channelId === process.env.GAME_CHANNEL2) {
    processUserInfo(message)
  }
  // process.env.GAME_CHANNEL?.split(',').forEach(channel => {
  //   if (message.channelId === channel) {
  //     processUserInfo(message)
  //   }
  // })
})

async function processUserInfo (message: Message) {
  const text = message.content.toLowerCase().replace(/\s\s+/g, ' ').split(' ')
  const command = text[0]
  const wallet = text[1]
  if (command !== '!user') return
  let user = await User.getByDiscordId(message.author.id, message)
  if (wallet) {
    if (!user) {
      user = await User.create(message.author.id, message.author.username, wallet)
      displayUserInfo(message, user, 'create')
    } else {
      user = await user.setWalletAddress(wallet)
      displayUserInfo(message, user, 'update')
    }
  } else {
    if (user) displayUserInfo(message, user)
  }
}

function displayUserInfo (message: Message, user: User, status?: string) {
  const embed = new MessageEmbed()
    .setTitle(`DFZ LABS SUBJECT INFORMATION: ${user.getDiscordName()}`)
    .addFields(
      { name: 'Discord ID', value: `${user.getDiscordId()}`, inline: true },
      { name: 'Discord Name', value: `${user.getDiscordName()}`, inline: true },
      { name: 'ETH Wallet', value: `${user.getWalletAddress()}`, inline: true })
    .setColor('#003300')
    .setThumbnail(message.author.avatarURL() || '')
  if (status) {
    const embedStatus = new MessageEmbed()
      .setTitle(`SUCCESSFULLY ${status === 'create' ? 'CREATED' : 'UPDATED'} PROFILE`)
    message.reply({ embeds: [embedStatus, embed] })
  } else {
    message.reply({ embeds: [embed] })
  }
}
