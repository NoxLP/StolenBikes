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

/**
 * Get police officer profile to send to front-end
 * @returns Police officer profile object
 */
policeOfficersSchema.methods.getProfile = async function () {
  const officer = await this.populate('department').execPopulate()

  return {
    name: officer.name,
    surname: officer.surname,
    email: officer.email,
    police_license_number: officer.police_license_number,
    role: officer.role,
    bike: officer.bike,
    department: {
      name: officer.department.name,
      assignments: officer.department.assignments,
    },
  }
}

const policeOfficersModel = mongoose.model(
  'police_officers',
  policeOfficersSchema
)
module.exports = policeOfficersModel
