const mongoose = require('mongoose')
const OwnersModel = require('../models/owners.model')
const BikesModel = require('../models/bikes.model')
const OfficersModel = require('../models/police_officers.model')
const DepartmentsModel = require('../models/departments.model')
const { handleError } = require('../utils')
const { sendEmailToOwnerBikeStatusChanged } = require('../utils/emails')
const { getAddressCoordinates } = require('../utils/geoapify')

exports.reportStolenBike = async (req, res) => {
  try {
    // use a transaction so it all becomes an atomic operation
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // if it's a new bike, create it (upsert)
      // if the bike already exists AND is solved, update to unassigned
      let bike = await BikesModel.findOne({
        license_number: req.body.license_number,
      })
      if (!bike) {
        const bikeData = {
          ...req.body,
          owner: res.locals.owner._id,
        }
        if (req.body.last_known_address) {
          const coordinates = await getAddressCoordinates(
            req.body.last_known_address
          )

          if (coordinates) bikeData.last_known_coordinates = coordinates
        }

        bike = new BikesModel(bikeData)
      } else if (bike && bike.status == 'solved') {
        bike.status = 'unassigned'
        bike.date = req.body.date ?? bike.date
        bike.owner =
          res.locals.owner._id !== bike.owner
            ? res.locals.owner._id
            : bike.owner
        bike.color = req.body.color ?? bike.color
        bike.description = req.body.description ?? bike.description
        bike.theft_desc = req.body.theft_desc ?? bike.theft_desc

        if (req.body.last_known_address) {
          bike.last_known_address = req.body.last_known_address

          const coordinates = await getAddressCoordinates(
            req.body.last_known_address
          )

          if (coordinates) bike.last_known_coordinates = coordinates
        }
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
        // get first free officer within robberies officers
        const officersIds = robberiesOfficers[0].officers.map((id) => {
          return new mongoose.Types.ObjectId(id)
        })
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
          await freeOfficers[0].assignBikeToOfficer(bike, session, owner)

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

      // Just fire and forget the email
      sendEmailToOwnerBikeStatusChanged(owner, bike)
      return res
        .status(200)
        .json({ msg: 'bike created but NOT assigned', bike })
    } catch (err) {
      throw err
    } finally {
      session.endSession()
    }
  } catch (err) {
    // this should catch the transaction and session creation errors
    handleError(err, res)
  }
}

/**
 * Build an object to use as search parameter in mongoose query when
 * user do not ask to search by owner or officer
 * @param {Object} query ExpresJs query object: req.query
 * @returns Mongoose query search parameter object
 */
const buildSearchObject = (query) => {
  const searchObject = {}
  if (query['license-number'])
    searchObject.license_number = query['license-number']
  if (query.color) searchObject.color = query.color
  if (query.type) searchObject.type = query.type
  if (query.date) searchObject.date = query.date
  if (query.address) searchObject.last_known_address = query.address
  if (query.status) {
    searchObject.$text = {
      $search: query.status,
      $caseSensitive: false,
      $diacriticSensitive: false,
    }
  }

  return searchObject
}
/**
 * Builds bike data transfer object out of a populated bike mongoose object
 * @param {Object} bike Populated bike model
 * @returns Bike data transfer object
 */
const buildBikeDTO = (bike) => {
  // - bikes data transfer objects:
  // {id, license_number, owner_id, owner_name, date,
  // status, officer_id, officer_name, department_id, department_name }
  const DTO = {
    id: bike._id,
    license_number: bike.license_number,
    owner_id: bike.owner._id,
    owner_name: bike.owner.name,
    date: bike.date,
    status: bike.status,
  }
  if (bike.officer) {
    DTO.officer_id = bike.officer._id
    DTO.officer_name = bike.officer.name
    DTO.department_id = bike.officer.department._id
    DTO.department_name = bike.officer.department.name
  }

  return DTO
}
/**
 * Do bikes search query to database when user ask to search by owner
 * and returns an array of the found bikes
 * @param {Object} query ExpresJs query object: req.query
 * @param {Number} limit Pagination. Max number of objects to return
 * @param {Number} skip Pagination. Number of objects to skip (page * (limit-1))
 * @returns Array of BikesModel
 */
const findBikesByOwnerAsync = async (query, limit, skip) => {
  try {
    const owners = await OwnersModel.find(
      {
        $text: {
          $search: query['owner-names'],
          $caseSensitive: false,
          $diacriticSensitive: false,
        },
      },
      { name: 1 }
    )
      .populate('bikes')
      .populate({
        path: 'bikes',
        populate: {
          path: 'officer',
          select: 'name',
          populate: {
            path: 'department',
            select: 'name',
          },
        },
      })
      .skip(skip)
      .limit(limit)
      .lean()

    const bikes = owners.reduce((acc, currentOwner) => {
      if (currentOwner.bikes) {
        const bikes = currentOwner.bikes.map((bike) => ({
          ...bike,
          owner: { _id: currentOwner._id, name: currentOwner.name },
        }))
        return [...acc, ...bikes]
      }

      return acc
    }, [])

    return bikes
  } catch (err) {
    throw err
  }
}
/**
 * Do bikes search query to database when user ask to search by officer
 * and returns an array of the found bikes
 * @param {Object} query ExpresJs query object: req.query
 * @param {Number} limit Pagination. Max number of objects to return
 * @param {Number} skip Pagination. Number of objects to skip (page * (limit-1))
 * @returns Array of BikesModel
 */
const findBikesByOfficerAsync = async (query, limit, skip) => {
  try {
    console.log('findBikesByOfficerAsync')
    const officers = await OfficersModel.find(
      {
        $text: {
          $search: query['officer-names'],
          $caseSensitive: false,
          $diacriticSensitive: false,
        },
      },
      { name: 1 }
    )
      .populate({
        path: 'department',
        select: 'name',
      })
      .populate('bike')
      .populate({
        path: 'bike',
        populate: {
          path: 'owner',
          select: 'name',
        },
      })
      .skip(skip)
      .limit(limit)
      .lean()
    console.log(officers)

    const bikes = officers.reduce((acc, currentOfficer) => {
      if (currentOfficer.bike) {
        const bike = {
          ...currentOfficer.bike,
          officer: {
            _id: currentOfficer._id,
            name: currentOfficer.name,
            department: {
              _id: currentOfficer.department._id,
              name: currentOfficer.department.name,
            },
          },
        }
        return [...acc, bike]
      }

      return acc
    }, [])

    return bikes
  } catch (err) {
    throw err
  }
}
exports.getBikesSearchDTOs = async (req, res) => {
  try {
    // - query
    // limit, page, license-number, color, type, owner-name, owner-surname,
    //   date, address, status, officer-name
    let limit, skip
    if (!req.query.limit) {
      limit = 0
      skip = 0
    } else if (!req.query.page) {
      limit = req.query.limit
      skip = 0
    } else {
      limit = req.query.limit
      skip = req.query.page * (limit - 1)
    }

    let bikes
    if (req.query['owner-names']) {
      bikes = await findBikesByOwnerAsync(req.query, limit, skip)
    } else if (req.query['officer-names']) {
      bikes = await findBikesByOfficerAsync(req.query, limit, skip)
    } else {
      const searchObject = buildSearchObject(req.query)

      bikes = await BikesModel.find(searchObject)
        .populate({ path: 'owner', select: 'name' })
        .populate({
          path: 'officer',
          select: 'name',
          populate: {
            path: 'department',
            select: 'name',
          },
        })
        .skip(skip)
        .limit(limit)
    }

    if (!bikes || bikes.length == 0) return res.status(200).json({ bikes: [] })
    const bikesDTOs = bikes.map((bike) => buildBikeDTO(bike))

    return res.status(200).json({ bikes: bikesDTOs })
  } catch (err) {
    handleError(err, res)
  }
}

exports.getBikeById = async (req, res) => {
  try {
    const bike = await BikesModel.findById(req.params.bikeId)
      .populate('owner', '-password -bikes')
      .populate({
        path: 'officer',
        select: '-password -role -bike',
        populate: {
          path: 'department',
          select: 'name assignments',
        },
      })
      .lean()
    const department = { ...bike.officer.department }
    delete bike.officer.department
    bike.department = department

    return res.status(200).json({ bike })
  } catch (err) {
    handleError(err, res)
  }
}

exports.caseSolved = async (req, res) => {
  try {
    // use a transaction so it all becomes an atomic operation
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const bike = await BikesModel.findById(req.params.bikeId).session(session)
      if (!bike || bike.status !== 'assigned')
        return handleError('wrong bike or wrong status', res, 404)

      const officer = await OfficersModel.findById(bike.officer).session(
        session
      )
      bike.officer = null
      bike.status = 'solved'
      await bike.save()

      const newAssignedBike = await officer.findUnassignedBikeOrFreeOfficer(
        session
      )

      await session.commitTransaction()

      // Just fire and forget the email
      const owner = await OwnersModel.findById(bike.owner)
      sendEmailToOwnerBikeStatusChanged(owner, bike)
      return res.status(200).json({ newAssignedBike })
    } catch (err) {
      throw err
    } finally {
      session.endSession()
    }
  } catch (err) {
    // this should catch the transaction and session creation errors
    handleError(err, res)
  }
}
