const mongoose = require('mongoose')

const departmentsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  officers: [
    {
      type: mongoose.Types.ObjectId,
      required: [true, 'Officer is required'],
      ref: 'officers',
    },
  ],
  assignments: {
    type: String,
    enum: ['robberies', 'crimes', 'drugs'],
    required: [true, 'Assignment is required'],
  },
})

const departmentsModel = mongoose.model('departments', departmentsSchema)
module.exports = departmentsModel
