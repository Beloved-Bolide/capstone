import {Router} from "express";
import {getCategoryByCategoryIdController, postCategoryController} from "./category.controller.ts";
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";

const basePath = '/api/category' as const
const router = Router()

router.route('/')
.post(isLoggedInController, postCategoryController)

router.route('/:id')
.get(isLoggedInController, getCategoryByCategoryIdController)

export const categoryRoute = { basePath, router }

