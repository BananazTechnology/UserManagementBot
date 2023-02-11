import axios from 'axios'
import { Message } from 'discord.js'

export class User {
  // User attributes. Should always be private as updating information will need to be reflected in the db
  private id: number;
  private discordID: string;
  private discordName: string;
  private walletAddress?: string;

  // constructor is private. User object sould be created by one of the get or create commands
  private constructor (id: number, discordID: string, discordName: string, walletAddress: string|undefined) {
    this.id = id
    this.discordID = discordID.replace(/'/g, '')
    this.discordName = discordName.replace(/'/g, '')
    this.walletAddress = walletAddress ? walletAddress.replace(/'/g, '') : ''
  }

  getId () {
    return this.id
  }

  getDiscordId () {
    return this.discordID
  }

  getDiscordName () {
    return this.discordName
  }

  getWalletAddress () {
    return this.walletAddress
  }

  // sets wallet address and updates db
  async setWalletAddress (walletAddress: string|undefined) {
    this.walletAddress = walletAddress
    return await this.update()
  }

  // checks to see if user has specific role
  // async checkRole (role: bigint, interaction: BaseCommandInteraction): Promise<boolean> {
  //   if (!interaction.guild) {
  //     return new Promise((resolve, reject) => {
  //       resolve(false)
  //     })
  //   }
  //   const discordRole = await interaction.guild.roles.fetch(`${role}`)
  //   if (!discordRole) {
  //     return new Promise((resolve, reject) => {
  //       resolve(false)
  //     })
  //   }
  //   const members = discordRole.members
  //   return new Promise((resolve, reject) => {
  //     if (members.find(m => m.id === interaction.user.id)) {
  //       resolve(true)
  //     } else {
  //       resolve(false)
  //     }
  //   })
  // }

  // grabs user object and updates db to match
  private async update (): Promise<User> {
    const reqURL = `${process.env.userAPI}/user/${this.id}`
    console.log(`Request to UserAPI: PUT - ${reqURL}`)
    console.debug(`Data: { discordID: ${this.discordID}, discordName: ${this.discordName}, walletAddress: ${this.walletAddress} }`)

    return new Promise((resolve, reject) => {
      const discordID = this.discordID
      const discordName = this.discordName
      const walletAddress = this.walletAddress
      axios
        .put(reqURL, { discordID, discordName, walletAddress })
        .then(res => {
          const data = res.data.data
          if (data) {
            const user: User = new User(data.id, data.discordID, data.discordName, data.walletAddress)
            resolve(user)
          } else {
            reject(new Error('User Update Unsuccessful'))
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  // gets user by discord id. Also checks basic data to ensure records match discord and updates if not
  static async getByDiscordId (discordID: string, message: Message): Promise<User|undefined> {
    const reqURL = `${process.env.userAPI}/user/getByDiscord/${discordID}`
    console.debug(`Request to UserAPI: GET - ${reqURL}`)

    return new Promise((resolve, reject) => {
      axios
        .get(reqURL)
        .then(res => {
          const data = res.data.data
          if (data) {
            const user: User = new User(data.id, data.discordID, message.author.username, data.walletAddress)
            resolve(user)
            // if discord info does not match db then update
            if ((message.author.id === user.discordID) && (message.author.username !== user.discordName)) {
              user.discordName = message.author.username
              user.update()
            }
          } else {
            resolve(undefined)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  // creates a new user and returns a user object
  static async create (discordID: string, discordName: string, walletAddress: string|undefined): Promise<User> {
    const reqURL = `${process.env.userAPI}/user`
    console.debug(`Request to UserAPI: POST - ${reqURL}`)
    console.debug(`Data: { discordID: ${discordID}, discordName: ${discordName}, walletAddress: ${walletAddress} }`)

    return new Promise((resolve, reject) => {
      axios
        .post(reqURL, { discordID, discordName, walletAddress })
        .then(res => {
          const data = res.data.data
          if (data) {
            const user: User = new User(data.id, data.discordID, data.discordName, data.walletAddress)
            resolve(user)
          } else {
            reject(new Error('User Creation Unsuccessful'))
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}
