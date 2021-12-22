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
  } catch (err) {
    handleError(err, res)
  }
}

exports.updateDepartment = async (req, res) => {
  try {
  } catch (err) {
    handleError(err, res)
  }
}

exports.removeDepartment = async (req, res) => {
  try {
  } catch (err) {
    handleError(err, res)
  }
}
