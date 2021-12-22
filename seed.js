const seeder = require('mongoose-seed')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const OwnersModel = require('./api/models/owners.model')
require('dotenv').config()

const db = process.env.MONGO_URL + process.env.MONGO_DB

console.log('>>> Seeding...')

seeder.connect(db, function () {
  seeder.loadModels(['./api/models/owners.model.js'])
  seeder.clearModels(['owners'], function () {
    seeder.populateModels(data, function () {
      seeder.disconnect()
    })
  })
})

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
]
