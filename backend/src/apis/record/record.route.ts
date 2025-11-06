import {Router} from "express";
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";
import {getRecordByRecordIdController, postRecordController, updateRecordController} from "./record.controller.ts";


const basePath = '/apis/record' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postRecordController)

router.route('/id/:id')
  .get(isLoggedInController, getRecordByRecordIdController)
  .put(isLoggedInController, updateRecordController)

export const recordRoute = { basePath, router }