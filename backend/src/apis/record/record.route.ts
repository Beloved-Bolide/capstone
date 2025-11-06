import {Router} from "express";
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";
import {
  getRecordByFolderIdController,
  getRecordByRecordIdController,
  postRecordController,
  updateRecordController
} from "./record.controller.ts";


const basePath = '/apis/record' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postRecordController)

router.route('/id/:id')
  .get(isLoggedInController, getRecordByRecordIdController)
  .put(isLoggedInController, updateRecordController)

router.route('/folder/:id')
  .get(isLoggedInController, getRecordByFolderIdController)

export const recordRoute = { basePath, router }