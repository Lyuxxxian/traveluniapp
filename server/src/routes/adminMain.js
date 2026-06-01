import { Router } from 'express'
import { requireAdminAuth } from '../lib/adminAuth.js'
import legacyAdmin from './admin.js'
import adminHome from './adminHome.js'
import adminDiscover from './adminDiscover.js'
import adminService from './adminService.js'

const router = Router()
router.use(requireAdminAuth)
router.use(legacyAdmin)
router.use('/home', adminHome)
router.use('/discover', adminDiscover)
router.use(adminService)

export default router
