import { type Request, type Response } from 'express';
import type {NextFunction} from "express";
import {insertRecord, RecordSchema} from "./record.model.ts";
import {serverErrorResponse, zodErrorResponse} from "../../utils/response.utils.ts";

/**
 * Express controller for creating a new record
 * @endpoint POST/apis/record
 * @param request an object containing the body with record data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the record creation was successful */
export async function postRecordController (request: Request, response: Response): Promise<void> {
  try {
    // validate the full record object from the request body
    const validationResult = RecordSchema.safeParse(request.body);

    // if the validation is unsuccessful, return a preformatted response to the client
    if (!validationResult.success) {
      zodErrorResponse(response, validationResult.error)
      return
    }
    // // get the user id from the session
    // const userFromSession = request.session?.user
    // const idFromSession = userFromSession?.id
    // // get the new data from the request body
    // const { userId } = validationResult.data
    // // if the userId from the request body does not match the user id from the session, return a preformatted response to the client
    // if (userId !== idFromSession) {
    //   response.json ({
    //     status: 403,
    //     data: null,
    //     message: 'Forbidden:  You cannot create a record for another user.'
    //   })
    //   return
    // }

    // insert the new record data into the database
    const insertedRecord = await insertRecord(validationResult.data)

    // return the success response to the client
    response.json({
      status:200,
      data: null,
      message: insertedRecord
    })

  } catch (error: any) {
    console.error(error)
    serverErrorResponse(response, error.message)
  }
}

/**
 * Express controller for updating a record
 * @endpoint PUT/apis/record/id
 * @param request an object containing the body with the record data
 * @param response an object modeling the response that will be sent to the client
 * @returns response to the client indicating whether the folder update was successful */
export async function updateRecordController (request: Request, response: Response): Promise<void> {
  try {
    // validate the record id coming from the request parameters
    const validationResultForRequestParams = RecordSchema.pick({ id : true }).safeParse({ id: request.params.id})

  } catch {}
}










