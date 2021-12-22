const router = require('express').Router()
const { officerIsAdmin } = require('../utils/auth') // Authenticated Route
const {
  createDepartment,
  getDepartment,
  updateDepartment,
  removeDepartment,
} = require('../controllers/departments.controller')

router.post('/', officerIsAdmin, createDepartment)
router.get('/:departmentId', getDepartment)
router.put('/:departmentId', officerIsAdmin, updateDepartment)
router.delete('/:departmentId', officerIsAdmin, removeDepartment)

module.exports = router
