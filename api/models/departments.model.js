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
      ref: 'police_officers',
    },
  ],
  bike_officers: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'police_officers',
    },
  ],
  assignments: {
    type: String,
    enum: ['robberies', 'crimes', 'drugs'],
    required: [true, 'Assignment is required'],
  },
  max_bike_cases: {
    type: Number,
    required: [true, 'Max bike cases is required'],
  },
  created_at: {
    type: Number,
    default: Date.now(),
  },
})

const departmentsModel = mongoose.model('departments', departmentsSchema)
module.exports = departmentsModel
