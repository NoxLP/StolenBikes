const { geocodingAPI } = require('./axios')

exports.getAddressCoordinates = async (address) => {
  try {
    const geocodingData = await geocodingAPI.get(
      `?apiKey=${process.env.GEOCODING_KEY}&text=${address}`
    )

    if (
      geocodingData.data &&
      geocodingData.data.features &&
      geocodingData.data.features.length > 0
    ) {
      return geocodingData.data.features[0].geometry
    }

    return null
  } catch (err) {
    return null
  }
}
