const OwnersModel = require('../models/owners.model')
const OfficersModel = require('../models/police_officers.model')
const jwt = require('jsonwebtoken')
const { handleError } = require('./index')

// Authenticate Middleware
exports.authOwners = (req, res, next) => {
  if (!req.headers.token) {
    handleError('No Token found', res, 403)
  } else {
    jwt.verify(req.headers.token, process.env.SECRET, (err, token) => {
      if (err) {
        handleError('Token not valid', res, 403)
      }

      OwnersModel.findOne({ email: token.email })
        .then((owner) => {
          res.locals.owner = { name: owner.name, email: owner.email }
          next()
        })
        .catch((err) => handleError('owner not found', res, 404))
    })
  }
}
exports.authOfficers = (req, res, next) => {
  if (!req.headers.token) {
    handleError('No Token found', res, 403)
  } else {
    jwt.verify(req.headers.token, process.env.SECRET, (err, token) => {
      if (err) {
        handleError('Token not valid', res, 403)
      }

      OfficersModel.findOne({ email: token.email })
        .then((officer) => {
          res.locals.officer = { name: officer.name, email: officer.email }
          next()
        })
        .catch((err) => handleError('owner not found', res, 404))
    })
  }
}
exports.authUser = (req, res, next) => {
  if (!req.headers.token) {
    handleError('No Token found', res, 403)
  } else {
    jwt.verify(req.headers.token, process.env.SECRET, (err, token) => {
      if (err) {
        handleError('Token not valid', res, 403)
      }

      const email = { email: token.email }

      OwnersModel.findOne(email)
        .then((owner) => {
          res.locals.owner = { name: owner.name, email: owner.email }
          next()
        })
        .catch((err) => {
          OfficersModel.findOne(email)
            .then((officer) => {
              res.locals.officer = { name: officer.name, email: officer.email }
              next()
            })
            .catch((err) => handleError('owner not found', res, 404))
        })
    })
  }
}

exports.createToken = (user) => {
  return jwt.sign({ email: user.email, id: user._id }, process.env.SECRET, {
    expiresIn: '24h',
  })
}
