import { Router } from 'express'
import { requireAdminAuth } from '../lib/adminAuth.js'
import legacyAdmin from './admin.js'
import adminHome from './adminHome.js'
import adminDiscover from './adminDiscover.js'
import adminService from './adminService.js'
import adminMap from './adminMap.js'
import adminMall from './adminMall.js'
import adminOrders from './adminOrders.js'

const router = Router()
router.use(requireAdminAuth)
router.use(legacyAdmin)
router.use('/home', adminHome)
router.use('/discover', adminDiscover)
router.use('/map', adminMap)
router.use('/mall', adminMall)
router.use('/orders', adminOrders)
router.use(adminService)

export default router
