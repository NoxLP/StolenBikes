const seeder = require('mongoose-seed')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const db = process.env.MONGO_URL
console.log(db)

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

const robberyOfficerId = mongoose.Types.ObjectId('61c4ae1692dc294b7a6a59af')
const robberyAdminId = mongoose.Types.ObjectId('61c4ae1892dc294b7a6a59c3')
const crimeOfficerId = mongoose.Types.ObjectId('61c4ae1692dc294b7a6a59b1')
const robberyDepartmentId = mongoose.Types.ObjectId('61c4ae1692dc294b7a6a59b2')
const crimeDepartmentId = mongoose.Types.ObjectId('61c4ae1692dc294b7a6a59b3')

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
        _id: robberyDepartmentId,
        name: 'Robos distrito 1',
        officers: [robberyOfficerId, robberyAdminId],
        assignments: 'robberies',
        max_bike_cases: 1,
      },
      {
        _id: crimeDepartmentId,
        name: 'Crimen distrito 1',
        officers: [crimeOfficerId],
        assignments: 'crimes',
        max_bike_cases: 0,
      },
    ],
  },
  {
    model: 'police_officers',
    documents: [
      {
        _id: robberyOfficerId,
        name: 'Jose',
        surname: 'Santana Dominguez',
        email: 'jose.santana@police.com',
        password: bcrypt.hashSync('123456', 10),
        police_license_number: '358467A',
        role: 'regular',
        department: robberyDepartmentId,
      },
      {
        _id: robberyAdminId,
        name: 'Pedro',
        surname: 'Rodríguez Arcas',
        email: 'pedro.rodriguez@police.com',
        password: bcrypt.hashSync('123456', 10),
        police_license_number: '358621B',
        role: 'admin',
        department: robberyDepartmentId,
      },
      {
        _id: crimeOfficerId,
        name: 'María',
        surname: 'Pérez Santana',
        email: 'maria.perez@police.com',
        password: bcrypt.hashSync('123456', 10),
        police_license_number: '354127G',
        role: 'regular',
        department: crimeDepartmentId,
      },
    ],
  },
]
