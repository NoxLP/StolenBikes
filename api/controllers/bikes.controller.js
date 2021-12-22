const mongoose = require('mongoose')
const OwnersModel = require('../models/owners.model')
const BikesModel = require('../models/bikes.model')
const OfficersModel = require('../models/police_officers.model')
const DepartmentsModel = require('../models/departments.model')
const { handleError } = require('../utils')

exports.reportStolenBike = async (req, res) => {
  try {
    // later we need to add the officer to the bike and other things,
    // use a transaction so it all becomes an atomic operation
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const owner = res.locals.owner
      const bikeData = {
        ...req.body,
        owner: owner._id,
      }
      const bike = await BikesModel.create(bikeData)
      owner.bikes.push(bike)
      await owner.save()

      // Assign automatically a free officer to a stolen bike
      // get officers of robberies departments
      const robberiesOfficers = await DepartmentsModel.aggregate([
        {
          $match: {
            assignments: 'robberies',
          },
        },
        {
          $unwind: {
            path: '$officers',
          },
        },
        {
          $group: {
            _id: '$assignments',
            officers: {
              $push: '$officers',
            },
          },
        },
      ])

      if (robberiesOfficers && robberiesOfficers.length > 0) {
        console.log('> robOfs ok')
        // get first free officer within robberies officers
        const officersIds = robberiesOfficers[0].officers.map((id) => {
          console.log(id)
          return new mongoose.Types.ObjectId(id)
        })
        console.log('> ids: ', officersIds)
        const freeOfficers = await OfficersModel.find({
          _id: {
            $in: officersIds,
          },
          bike: null,
        }).limit(1)

        if (freeOfficers && freeOfficers.length == 1) {
          // free officer found, assign
          const firstFreeOfficer = freeOfficers[0]
          console.log('> firstFreeOfficer: ', firstFreeOfficer)
          firstFreeOfficer.bike = bike._id
          bike.officer = firstFreeOfficer._id
          bike.status = 'assigned'

          await Promise.all([firstFreeOfficer.save(), bike.save()])

          await session.commitTransaction()
          return res
            .status(200)
            .json({ msg: 'bike created and assigned', bike })
        } else {
          // free officer NOT found
          await session.commitTransaction()
          return res
            .status(200)
            .json({ msg: 'bike created but NOT assigned', bike })
        }
      }
    } catch (err) {
      handleError(err, res)
    } finally {
      session.endSession()
    }
  } catch (err) {
    // this should catch the transaction errors
    handleError(err, res)
  }
}
