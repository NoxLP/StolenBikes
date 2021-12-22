const mongoose = require('mongoose')
const Bikes = require('./bikes.model')

const ownersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  surname: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    validate: {
      validator(value) {
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
          value
        )
      },
    },
    unique: [true, 'This is email is registered'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  mobile_number: {
    type: String,
    required: [true, 'Mobile_number is required'],
    validate: {
      validator(value) {
        return /^\d{8,12}$/.test(value)
      },
    },
    unique: [true, 'This mobile number is registered'],
  },
  address: {
    type: String,
    required: true,
  },
  bikes: [
    {
      type: mongoose.Types.ObjectId,
      required: [true, 'Bike is required'],
      ref: Bikes,
    },
  ],
})

/**
 * Get bike owner profile to send to front-end
 * @returns Owner profile object
 */
ownersSchema.methods.getProfile = async function () {
  const owner = await this.populate('bikes').execPopulate()

  return owner
}

const ownersModel = mongoose.model('owners', ownersSchema)
module.exports = ownersModel
