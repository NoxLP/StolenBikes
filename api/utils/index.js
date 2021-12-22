const jwt = require('jsonwebtoken')

// Return error with details in JSON
function handleError(err, res, status) {
  console.log(err)

  res.status(status ?? 500).json({ message: err })
}

module.exports = {
  handleError,
}
