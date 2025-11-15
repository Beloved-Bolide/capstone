import { App } from './App'
import { createClient } from 'redis'
import type { RedisClientType } from 'redis'
import type { PrivateUser } from './apis/user/user.model'


declare module 'express-session' {
  export interface SessionData {
    user: PrivateUser | undefined
    jwt: string | undefined
    signature: string | undefined
  }
}

// instantiate a new app and pass it a port as an argument to start with (4200)
let redisClient: RedisClientType | undefined

async function main (): Promise<void> {
  if (redisClient === undefined) {
    redisClient = createClient({ socket: { host: process.env.REDIS_HOST } })
    redisClient.connect().catch(console.error)
  }
  try {
    const app = new App(redisClient)
    app.listen()
  } catch (error) {
    console.log(error)
  }
}

main().catch(error => {
  console.error(error)
})