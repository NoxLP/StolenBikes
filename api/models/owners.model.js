const mongoose = require('mongoose')
const Bikes = require('./bikes.model')
const { createEdgeNGrams } = require('../utils/index')

const ownersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  surname: {
    type: String,
    required: [true, 'Surname is required'],
  },
  search_names: {
    type: String,
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

/**
 * This will add search_name and search_surname to a document every time
 * the document will be saved.
 * Partial searches must be done through this fields, nor with original ones,
 * see createEdgeNGrams function at utils/index.js.
 * Note that with mongoose update functions, only updateOne will do it right,
 * with the rest (findOneAndUpdate, findByIdAnd...) 'this' is not the document,
 * but the query itself, therefore it could be bad...
 * It's ok for the scope of this API because I'm only using the wrong functions
 * with departments resource, but it's something that everyone developing the
 * API should be aware of, or to be taken care of here.
 */
ownersSchema.pre('save', function (next) {
  try {
    this.search_names = createEdgeNGrams(this.name + ' ' + this.surname)
  } catch (err) {
    // catch this and simply log it... I don't have the time to test this
    // thouroughly, so just ensure this will not shut down the server because
    // an unhandled exception
    console.log('>>> owners pre save ERROR:', err)
  }
  next()
})

// compound text index
ownersSchema.index({ search_names: 'text' })

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
