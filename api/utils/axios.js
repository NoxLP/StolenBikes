const axios = require('axios')

exports.geocodingAPI = axios.create({
  baseURL: 'https://api.geoapify.com/v1/geocode/search',
  timeout: 3000,
})
