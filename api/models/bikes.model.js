const mongoose = require('mongoose')

const bikesSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  license_number: {
    type: String,
    required: [true, 'License number is required'],
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
  status: {
    type: String,
    enum: ['unassigned', 'assigned', 'solved'],
    default: 'unassigned',
  },
  officer: {
    type: mongoose.Types.ObjectId,
    ref: 'police_officers',
  },
})

const bikesModel = mongoose.model('bikes', bikesSchema)
module.exports = bikesModel
