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
