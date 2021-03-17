const axios = require('axios')

const geocode = (address, callback) => {
  const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=pk.eyJ1IjoibWFndWFzdHVwYWd1YXMiLCJhIjoiY2tpdGxoc2N3MDNjdTMzbnVxaWd0NHd1YSJ9.zFx8KtqgRhfgIiQ1VkEsqg'

  axios.get(url)
    .then(result => {
      if (result.data.features.length === 0) {
        callback('Unable to find location!. Try another search.', undefined)
      } else {
        const [latitude, longitude] = result.data.features[0].center
        const {place_name} = result.data.features[0]
        callback(undefined, {
          latitude,
          longitude,
          place_name
        })
      }
    })
    .catch(error => {
      callback('Unable to connect to location services!', undefined)
    })

}

module.exports = geocode