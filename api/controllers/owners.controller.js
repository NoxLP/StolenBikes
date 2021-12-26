const OwnersModel = require('../models/owners.model')
const BikesModel = require('../models/bikes.model')
const { handleError } = require('../utils')

exports.getMyBikes = async (req, res) => {
  try {
    const owner = res.locals.owner
    const bikes = await BikesModel.find(
      { _id: { $in: owner.bikes } },
      { date: 1, license_number: 1, status: 1 }
    )

    return res.status(200).json({ bikes })
  } catch (err) {
    handleError(err, res)
  }
}
