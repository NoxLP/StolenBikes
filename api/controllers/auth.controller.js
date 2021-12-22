const UserModel = require('../models/users.model')
const OwnersModel = require('../models/owners.model')
const OfficersModel = require('../models/police_officers.model')
const DepartmentsModel = require('../models/departments.model')
const { compareSync, hashSync } = require('bcrypt')
const jwt = require('jsonwebtoken')
const { handleError } = require('../utils')
const { createToken } = require('../utils/auth')

exports.signUp = (req, res) => {
  const encryptedPwd = hashSync(req.body.password, 10)
  console.log(req.body)
  UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: encryptedPwd,
  })
    .then((user) => {
      const data = { email: user.email, name: user.name }
      const token = jwt.sign(data, process.env.SECRET, { expiresIn: '24h' })

      res.status(200).json({ token: token, ...data })
    })
    .catch((err) => res.status(500).json(err))
}
exports.ownersLogin = async (req, res) => {
  try {
    const owner = await OwnersModel.findOne({ email: req.body.email })
    if (!owner) return res.status(403).json({ msg: 'wrong email' })

    if (owner && compareSync(req.body.password, owner.password)) {
      return res.status(200).json({
        token: createToken(owner),
        user: await owner.getProfile(),
      })
    }

    return res.status(403).json({ msg: 'wrong email/password' })
  } catch (err) {
    return handleError(err, res)
  }
}
exports.officersLogin = async (req, res) => {
  try {
    const officer = await OfficersModel.findOne({ email: req.body.email })
    if (!officer) return res.status(403).json({ msg: 'wrong email' })

    if (officer && compareSync(req.body.password, officer.password)) {
      return res.status(200).json({
        token: createToken(officer),
        user: await officer.getOfficerProfile(),
      })
    }

    return res.status(403).json({ msg: 'wrong email/password' })
  } catch (err) {
    return handleError(err, res)
  }
}
