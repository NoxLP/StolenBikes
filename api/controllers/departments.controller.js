const DepartmentsModel = require('../models/departments.model')
const { handleError } = require('../utils')

exports.createDepartment = async (req, res) => {
  try {
    const department = await DepartmentsModel.create(req.body)

    return res.status(200).json({ msg: 'department created' })
  } catch (err) {
    handleError(err, res)
  }
}

exports.getDepartment = async (req, res) => {
  try {
    const department = await DepartmentsModel.findById(
      req.params.departmentId
    ).lean()

    return res.status(200).json(department)
  } catch (err) {
    handleError(err, res)
  }
}

exports.updateDepartment = async (req, res) => {
  try {
    // officers shouldn't be able to change department through this endpoint
    // see endpoint at officers resource
    const department = await DepartmentsModel.findByIdAndUpdate(
      req.params.departmentId,
      {
        name: req.body.name,
        assignments: req.body.assignments,
        max_bike_cases: req.body.max_bike_cases,
      },
      {
        returnDocument: 'after',
      }
    ).lean()

    return res.status(200).json({ msg: 'department updated' })
  } catch (err) {
    handleError(err, res)
  }
}

exports.removeDepartment = async (req, res) => {
  try {
    const department = await DepartmentsModel.findById(req.params.departmentId)
    if (!department) return handleError('department not found', res, 404)

    // don't remove the department if it have any officers
    if (department.officers.length > 0)
      return handleError('can not remove a department with officers', res)

    await DepartmentsModel.findByIdAndDelete(req.params.departmentId)
    return res.status(200).json({ msg: 'department removed' })
  } catch (err) {
    handleError(err, res)
  }
}
