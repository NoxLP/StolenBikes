const OwnersModel = require('../models/owners.model')
const OfficersModel = require('../models/police_officers.model')
const DepartmentsModel = require('../models/departments.model')
const { compareSync, hashSync } = require('bcrypt')
const jwt = require('jsonwebtoken')
const { handleError } = require('../utils')
const { createToken } = require('../utils/auth')

exports.signUp = async (req, res) => {
  try {
    const encryptedPwd = hashSync(req.body.password, 10)

    const ownerData = {
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      password: encryptedPwd,
      mobile_number: req.body.mobile_number,
      address: req.body.address,
    }
    const owner = await OwnersModel.create(ownerData)

    return res.status(200).json({
      token: createToken(owner),
      user: await owner.getProfile(),
    })
  } catch (err) {
    handleError(err, res)
  }
}
exports.ownersLogin = async (req, res) => {
  try {
    const owner = await OwnersModel.findOne({ email: req.body.email })
    if (!owner) return handleError('wrong email', res, 403)

    if (owner && compareSync(req.body.password, owner.password)) {
      return res.status(200).json({
        token: createToken(owner),
        user: await owner.getProfile(),
      })
    }

    return handleError('wrong email/password', res, 403)
  } catch (err) {
    return handleError(err, res)
  }
}
exports.officersLogin = async (req, res) => {
  try {
    const officer = await OfficersModel.findOne({ email: req.body.email })
    if (!officer) return handleError('wrong email', res, 403)

    if (officer && compareSync(req.body.password, officer.password)) {
      return res.status(200).json({
        token: createToken(officer),
        user: await officer.getOfficerProfile(),
      })
    }

    return handleError('wrong email/password', res, 403)
  } catch (err) {
    return handleError(err, res)
  }
}
