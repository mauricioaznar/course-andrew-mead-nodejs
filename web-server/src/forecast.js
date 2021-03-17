const axios = require('axios')

const forecast = (latitude, longitude, callback) => {
  const urlLatitude = latitude < 0 ? encodeURIComponent("'" + latitude + "'") : latitude
  const urlLongitude = longitude < 0 ? encodeURIComponent("'" + longitude + "'") : longitude
  const weatherurl = 'http://api.weatherstack.com/current?access_key=035ba6b559a56683c60ec1fb92d85fa5&query=' + urlLatitude + ',' + urlLongitude

  console.log(weatherurl)

  axios.get(weatherurl)
    .then(result => {
      if (result.data.error) {
        callback('Unable to find location, try another search.', undefined)
      } else {
        callback(undefined, result.data.current)
      }
    })
    .catch(error => {
      callback(error, undefined)
    })


}

module.exports = forecast