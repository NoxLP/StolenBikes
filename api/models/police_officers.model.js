const mongoose = require('mongoose')

const policeOfficersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  surname: {
    type: String,
    required: [true, 'Name is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  police_license_number: {
    type: String,
    required: [true, 'License number is required'],
  },
  role: {
    type: String,
    enum: ['regular', 'admin'],
    default: 'regular',
  },
  bike: {
    type: mongoose.Types.ObjectId,
    required: [true, 'Bike is required'],
    ref: 'bikes',
  },
  department: {
    type: mongoose.Types.ObjectId,
    required: [true, 'Departments is required'],
    ref: 'departments',
  },
})

const policeOfficersModel = mongoose.model(
  'police_officers',
  policeOfficersSchema
)
module.exports = policeOfficersModel
