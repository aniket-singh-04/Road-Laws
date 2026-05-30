import express from 'express'
import adminRoutes from './adminRoutes.js'
import challanRoutes from './challanRoutes.js'
import complianceRoutes from './complianceRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import driveLegalPlanApiRoutes from './driveLegalPlanApiRoutes.js'
import geoRoutes from './geoRoutes.js'
import lawRoutes from './lawRoutes.js'
import routeCheckRoutes from './routeCheckRoutes.js'

const router = express.Router()

router.use(lawRoutes)
router.use(dashboardRoutes)
router.use(challanRoutes)
router.use(geoRoutes)
router.use(complianceRoutes)
router.use(routeCheckRoutes)
router.use(adminRoutes)
router.use(driveLegalPlanApiRoutes)

export default router
