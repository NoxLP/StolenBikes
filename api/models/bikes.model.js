const mongoose = require('mongoose')

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
})

const bikesSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  // this type of official data usually have a way to build it, so it have a possible validation
  license_number: {
    type: String,
    required: [true, 'License number is required'],
    unique: [true, 'This license number is registered'],
  },
  owner: {
    type: mongoose.Types.ObjectId,
    required: [true, 'Owner is required'],
    ref: 'owners',
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
  },
  type: {
    type: String,
    enum: ['mountain', 'road', 'other'],
    default: 'other',
  },
  description: {
    type: String,
  },
  theft_desc: {
    type: String,
  },
  last_known_address: {
    type: String,
    required: [true, 'Last known address is required'],
  },
  last_known_coordinates: {
    type: pointSchema,
  },
  status: {
    type: String,
    enum: ['unassigned', 'assigned', 'solved'],
    default: 'unassigned',
  },
  officer: {
    type: mongoose.Types.ObjectId,
    ref: 'police_officers',
  },
  created_at: {
    type: Number,
    default: Date.now(),
  },
})

// compound text index
bikesSchema.index({ status: 'text' })

const bikesModel = mongoose.model('bikes', bikesSchema)
module.exports = bikesModel
