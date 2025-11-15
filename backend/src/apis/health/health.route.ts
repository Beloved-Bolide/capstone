import { Router } from 'express'
import { healthCheckController } from './health.controller.ts'

const basePath = '/apis/health' as const
const router = Router()

router.route('/')
	.get(healthCheckController)

export const healthRoute = { basePath, router }