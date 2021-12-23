const mongoose = require('mongoose')
const OfficersModel = require('../models/police_officers.model')
const DepartmentsModel = require('../models/departments.model')
const { handleError } = require('../utils')
const { hashSync } = require('bcrypt')

exports.createOfficer = async (req, res) => {
  try {
    // later we need to add the officer to the department,
    // use a transaction so it all becomes an atomic operation
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      // only admins of same department can create new officers
      console.log(res.locals.officer.department, req.body.department)
      if (res.locals.officer.department != req.body.department)
        return handleError('incorrect department', res)

      // existing department is required
      const department = await DepartmentsModel.findById(
        res.locals.officer.department
      ).session(session)
      if (!department) return handleError('department not found', res)

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
      const officer = new OfficersModel(officerData)
      await officer.save()

      department.officers.push(officer)
      await department.save()

      await session.commitTransaction()
      return res.status(200).json({ msg: 'new officer created' })
    } catch (err) {
      handleError(err, res)
    } finally {
      session.endSession()
    }
  } catch (err) {
    // this should catch the transaction and session creation errors
    handleError(err, res)
  }
}

exports.updateOfficer = async (req, res) => {
  try {
    // use a transaction so it all becomes an atomic operation
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const promises = [] // will await this at the end with promise.all

      const officer = await OfficersModel.findById(
        req.params.officerId
      ).session(session)
      if (!officer) return handleError('officer not found', res, 404)

      // if department is being changed we must reorganize origin and target departments
      if (req.body.department) {
        const targetDepartment = await DepartmentsModel.findById(
          req.body.department
        ).session(session)
        const originDepartment = await DepartmentsModel.findById(
          officer.department
        ).session(session)

        if (officer.bike) {
          if (targetDepartment.assignments !== 'robberies') {
            return handleError(
              "can't change officer to a non robberies department while solving a stolen bike case",
              res
            )
          }

          // check if a new officer will break the max bike cases rule
          if (
            targetDepartment.bike_officers.length <
            targetDepartment.max_bike_cases
          ) {
            originDepartment.bike_officers.pull(officer)
            targetDepartment.bike_officers.push(officer)
          } else {
            return handleError(
              'target department have already reached max stolen bike cases',
              res
            )
          }
        }

        originDepartment.officers.pull(officer)
        targetDepartment.officers.push(officer)
        officer.department = targetDepartment._id

        promises.push(originDepartment.save())
        promises.push(targetDepartment.save())
      }

      //password, bike and department can't be changed here
      officer.name = req.body.name ?? officer.name
      officer.surname = req.body.surname ?? officer.surname
      officer.email = req.body.email ?? officer.email
      officer.police_license_number =
        req.body.police_license_number ?? officer.police_license_number
      officer.role = req.body.role ?? officer.role

      promises.push(officer.save())
      await Promise.all(promises)

      await session.commitTransaction()
      return res.status(200).json({ msg: 'officer updated' })
    } catch (err) {
      handleError(err, res)
    } finally {
      session.endSession()
    }
  } catch (err) {
    handleError(err, res)
  }
}
