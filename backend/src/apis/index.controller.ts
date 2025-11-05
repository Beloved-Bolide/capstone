import type {Request, Response} from 'express'


// define a function to handle the index route
export function indexController (request: Request, response: Response): void {
  response.json('🤯 😬 😱 :3')
}