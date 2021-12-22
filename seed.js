const seeder = require('mongoose-seed')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
require('dotenv').config()

const db = process.env.MONGO_URL + process.env.MONGO_DB

console.log('>>> Seeding...')

seeder.connect(db, function () {
  seeder.loadModels([
    './api/models/owners.model.js',
    './api/models/police_officers.model.js',
    './api/models/departments.model.js',
  ])
  seeder.clearModels(['owners', 'police_officers', 'departments'], function () {
    seeder.populateModels(data, function () {
      seeder.disconnect()
    })
  })
})

const officerId = mongoose.Types.ObjectId()
const departmentId = mongoose.Types.ObjectId()

const data = [
  {
    model: 'owners',
    documents: [
      {
        name: 'Norberto',
        surname: 'Sáez Perdomo',
        email: 'nox_nox_@hotmail.com',
        password: bcrypt.hashSync('123456', 10),
        mobile_number: '34555555555',
        address: 'c/My address here',
      },
    ],
  },
  {
    model: 'departments',
    documents: [
      {
        _id: departmentId,
        name: 'Robos distrito 1',
        officers: [officerId],
        assignments: 'robberies',
      },
    ],
  },
  {
    model: 'police_officers',
    documents: [
      {
        _id: officerId,
        name: 'Jose',
        surname: 'Santana Dominguez',
        email: 'jose.santana@police.com',
        password: bcrypt.hashSync('123456', 10),
        police_license_number: '358467A',
        role: 'regular',
        department: departmentId,
      },
    ],
  },
]
