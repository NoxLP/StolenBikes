const mongoose = require('mongoose')
const OfficersModel = require('../models/police_officers.model')
const DepartmentsModel = require('../models/departments.model')
const { handleError } = require('../utils')
const { hashSync } = require('bcrypt')

exports.createOfficer = async (req, res) => {
  try {
    // department is required
    const department = await DepartmentsModel.findById(
      res.locals.officer.department
    )
    if (!department) return handleError('department not found', res)

    // only admins of same department can create new officers
    if (department._id != req.body.department)
      return handleError('incorrect department', res)

    // later we need to add the officer to the department,
    // use a transaction so it all becomes an atomic operation
    const session = await mongoose.startSession()
    await session.withTransaction(async () => {
      const encryptedPwd = hashSync(req.body.password, 10)

      const officerData = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: encryptedPwd,
        police_license_number: req.body.police_license_number,
        role: req.body.role,
        department: req.body.department,
      }
      const officer = await OfficersModel.create(officerData)

      department.officers.push(officer)
      await department.save()
    })
    session.endSession()

    return res.status(200).json({ msg: 'new officer created' })
  } catch (err) {
    handleError(err, res)
  }
}
