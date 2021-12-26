const mongoose = require('mongoose')
const BikesModel = require('../models/bikes.model')
const DepartmentsModel = require('../models/departments.model')

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
  // this type of official data usually have a way to build it, so it have a possible validation
  police_license_number: {
    type: String,
    required: [true, 'License number is required'],
    unique: [true, 'This license number is registered'],
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
  created_at: {
    type: Number,
    default: Date.now(),
  },
})

/**
 * Get police officer profile to send to front-end
 * @returns Police officer profile object
 */
policeOfficersSchema.methods.getOfficerProfile = async function () {
  try {
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
  } catch (err) {
    console.log(err)
  }
}
/**
 * Set bike as assigned, set bike in this instance officer, set this officer
 * as a bike_officer in the correct department, and save all.
 * It's supposed to be used within a transaction, that's why the session parameter.
 * It saves the bike's owner too if it's passed (to use in te report stolen bike endpoint).
 * @param {object} bike Bike to assign
 * @param {ClientSession} session Mongoose session for the transaction being used
 * @param {object} owner Bike's owner if necessary (at report stolen bike endpoint)
 */
policeOfficersSchema.methods.assignBikeToOfficer = async function (
  bike,
  session,
  owner
) {
  try {
    // call DB to get department but don't wait here
    let department = DepartmentsModel.findById(this.department).session(session)
    this.bike = bike._id

    // set bike officer and status
    bike.officer = this._id
    bike.status = 'assigned'

    // wait DB and add to department's bike officers
    // TODO: this should be able to be done onthe below Promise.all in an arrow funtion f.i.
    //    but it won't work for some reason... study it if I have the time for it
    department = await department
    department.bike_officers.push(this)

    // save all
    const promises = [this.save(), department.save(), bike.save()]
    if (owner) promises.push(owner.save())
    await Promise.all(promises)
  } catch (err) {
    throw err
  }
}
/**
 * Search for unassigned bikes, if some are found, assign the first one
 * to this officer with mongoose instance method assignBikeToOfficer,
 * and returns the assigned bike.
 * If no unassigned bikes are found, just set this officer as null (this.bike=null)
 * and returns null.
 * It's supposed to be used within a transaction, that's why the session parameter.
 * @param {ClientSession} session Mongoose session if a transaction is being used
 * @returns bike | null
 */
policeOfficersSchema.methods.findUnassignedBikeOrFreeOfficer = async function (
  session
) {
  try {
    this.bike = null

    const firstUnassignedBike = await BikesModel.find({
      status: 'unassigned',
    })
      .sort({ date: 1 })
      .limit(1)
      .session(session)

    if (firstUnassignedBike && firstUnassignedBike.length > 0) {
      await this.assignBikeToOfficer(firstUnassignedBike[0], session)
      return firstUnassignedBike[0]
    } else {
      // no unassigned bikes, remove this officer from department bike_officers
      const department = await DepartmentsModel.findById(
        this.department
      ).session(session)
      department.bike_officers.pull({ _id: this._id })

      await Promise.all([this.save(), department.save()])
      return null
    }
  } catch (err) {
    throw err
  }
}

const policeOfficersModel = mongoose.model(
  'police_officers',
  policeOfficersSchema
)
module.exports = policeOfficersModel
