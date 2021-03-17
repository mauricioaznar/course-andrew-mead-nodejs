const app = require('./app')

/*
  Using config files for environment variables
  heroku production server gets configured using commands
 */
const port = process.env.PORT

/*
  execution of app
 */
app.listen(port, () => {
  console.log('Server is up on port ' + port)
})