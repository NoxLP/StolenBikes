const router = require('express').Router()

const authRouter = require('./auth.router')
const ownersRouter = require('./owners.router')
const officersRouter = require('./police_officers.router')
const bikesRouter = require('./bikes.router')
const departmentsRouter = require('./departments.router')
const { authOfficers, authOwners, authAnyUser } = require('../utils/auth') // Authenticated Route

router.use('/auth', authRouter)
router.use('/owners', authOwners, ownersRouter)
router.use('/officers', authOfficers, officersRouter)
router.use('/bikes', bikesRouter)
router.use('/departments', authOfficers, departmentsRouter)

router.get('/whoami', authAnyUser, (req, res) => {
  res.send(`hi there! ${res.locals.user.name}`)
})
router.get('/status', function (req, res) {
  return res.status(200).send("I'm alive and OK")
})

module.exports = router
