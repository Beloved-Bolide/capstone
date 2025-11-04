import {Router} from "express";
import {getCategoryByCategoryIdController} from "./category.controller.ts";

const basePath = '/api/category' as const
const router = Router()

router.route('/:id')
.get(getCategoryByCategoryIdController)

export const categoryRoute = { basePath, router }

