const jwt = require('jsonwebtoken')
const UserModel = require('../models/users.model')

// Authenticate Middleware
function authUser(req, res, next) {
  if (!req.headers.token) {
    res.status(403).json({ error: 'No Token found' })
  } else {
    jwt.verify(req.headers.token, process.env.SECRET, (err, token) => {
      if (err) {
        res.status(403).json({ error: 'Token not valid' })
      }

      UserModel.findOne({ email: token.email })
        .then((user) => {
          res.locals.user = { name: user.name, email: user.email } //role tambien por ejemplo
          next()
        })
        .catch((err) => res.status(404).send('user not found'))
    })
  }
}

// Return error with details in JSON
function handleError(err, res, status) {
  console.log(err)

  res.status(status ?? 500).json({ message: err })
}

module.exports = {
  authUser,
  handleError,
}
