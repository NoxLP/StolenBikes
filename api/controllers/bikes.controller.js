const mongoose = require('mongoose')
const OwnersModel = require('../models/owners.model')
const BikesModel = require('../models/bikes.model')
const OfficersModel = require('../models/police_officers.model')
const DepartmentsModel = require('../models/departments.model')
const { handleError } = require('../utils')

exports.reportStolenBike = async (req, res) => {
  try {
    // use a transaction so it all becomes an atomic operation
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const bikeData = {
        ...req.body,
        owner: res.locals.owner._id,
      }
      // if it's a new bike, create it (upsert)
      // if the bike already exists AND is solved, update to unassigned
      let bike = await BikesModel.findOne({
        license_number: req.body.license_number,
      })
      if (!bike) {
        bike = new BikesModel(bikeData)
      } else if (bike && bike.status == 'solved') {
        bike.status = 'unassigned'
      } else {
        return handleError('already reported bike assigned', res)
      }

      // by not using res.locals.owner but retrieving it from the DB,
      // mongoose won't save the owner changes until the transaction is commited
      const owner = await OwnersModel.findById(res.locals.owner._id).session(
        session
      )
      owner.bikes.push(bike)

      // Assign automatically a free officer to a stolen bike

      // get officers of robberies departments
      const robberiesOfficers = await DepartmentsModel.aggregate([
        {
          $match: {
            assignments: 'robberies',
            $expr: {
              $lt: [
                {
                  $size: '$bike_officers',
                },
                '$max_bike_cases',
              ],
            },
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
      ]).session(session)

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
        })
          .limit(1)
          .session(session)

        if (freeOfficers && freeOfficers.length == 1) {
          // free officer found, assign
          const firstFreeOfficer = freeOfficers[0]

          // call DB to get department but don't wait here
          let department = DepartmentsModel.findById(
            firstFreeOfficer.department
          ).session(session)

          console.log('> firstFreeOfficer: ', firstFreeOfficer)
          firstFreeOfficer.bike = bike._id

          // set bike officer and status
          bike.officer = firstFreeOfficer._id
          bike.status = 'assigned'

          // wait DB and add to department's bike officers
          // TODO: this should be able to be done onthe below Promise.all in an arrow funtion f.i.
          //    but it won't work for some reason... study it if I have the time for it
          department = await department
          department.bike_officers.push(firstFreeOfficer)

          // save all
          await Promise.all([
            firstFreeOfficer.save(),
            department.save(),
            bike.save(),
            owner.save(),
          ])

          await session.commitTransaction()
          return res
            .status(200)
            .json({ msg: 'bike created and assigned', bike })
        } else {
          // free officer NOT found
          await Promise.all([bike.save(), owner.save()])
          await session.commitTransaction()
          return res
            .status(200)
            .json({ msg: 'bike created but NOT assigned', bike })
        }
      }

      // free officer NOT found
      await Promise.all([bike.save(), owner.save()])
      await session.commitTransaction()
      return res
        .status(200)
        .json({ msg: 'bike created but NOT assigned', bike })
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

exports.getBikesSearchDTOs = async (req, res) => {
  try {
    //bikes DTOs:
    //{id, license_number, owner_name, date, status, officer_name, department_name }
  } catch (err) {
    handleError(err, res)
  }
}
