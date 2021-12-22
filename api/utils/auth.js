const jwt = require('jsonwebtoken')
const { handleError } = require('./index')

exports.createToken = (user) => {
  return jwt.sign({ email: user.email, id: user._id }, process.env.SECRET, {
    expiresIn: '24h',
  })
}
