import {Router} from "express";
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";
import {
  getRecordByCategoryIdController,
  getRecordByFolderIdController,
  getRecordByRecordIdController,
  postRecordController,
  updateRecordController
} from "./record.controller.ts";


const basePath = '/apis/record' as const
const router = Router()

router.route('/')
  .post(isLoggedInController, postRecordController)

router.route('/:id')
  .get(isLoggedInController, getRecordByRecordIdController)
  .put(isLoggedInController, updateRecordController)

router.route('/folder/:folderId')
  .get(isLoggedInController, getRecordByFolderIdController)

router.route('/category/:categoryId')
  .get(isLoggedInController, getRecordByCategoryIdController)

export const recordRoute = {basePath, router}