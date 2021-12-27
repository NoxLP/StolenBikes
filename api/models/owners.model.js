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
      ref: Bikes,
    },
  ],
  created_at: {
    type: Number,
    default: Date.now(),
  },
})

// compound text index
ownersSchema.index({ name: 'text', surname: 'text' })

/**
 * Get bike owner profile to send to front-end
 * @returns Owner profile object
 */
ownersSchema.methods.getProfile = async function () {
  console.log('owner profile')
  const owner = await this.populate('bikes').execPopulate()

  return {
    name: owner.name,
    surname: owner.surname,
    email: owner.email,
    mobile_number: owner.mobile_number,
    address: owner.address,
    bikes: owner.bikes,
  }
}

const ownersModel = mongoose.model('owners', ownersSchema)
module.exports = ownersModel
