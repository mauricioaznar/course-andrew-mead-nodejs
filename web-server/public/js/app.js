const weatherFrom = document.querySelector('form')
const search = document.querySelector('input')
const messageOne = document.querySelector('#message-1')
const messageTwo = document.querySelector('#message-2')

weatherFrom.addEventListener('submit', (e) => {
  e.preventDefault()

  const location = search.value

  messageOne.textContent = 'Loading...'
  messageTwo.textContent = ''

  fetch('/weather?address=' + location)
    .then(response => {
      response.json().then(data => {
        if (data.error) {
          messageOne.textContent = data.error
          messageTwo.textContent = ''
        } else {
          messageOne.textContent = data.geoData.place_name
          messageTwo.textContent = `The forecast for ${data.geoData.place_name} is ${data.forecastData.temperature}`
        }
      })
    })

})