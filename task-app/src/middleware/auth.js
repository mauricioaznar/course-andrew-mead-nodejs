const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
  try {
    // token gets sent through headers and has to be extracted
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

    if (!user) {
      throw new Error()
    }
    //user and token object get merged into the request object
    req.token = token
    req.user = user
  } catch (e) {
    res.status(401).send({error: 'Please authenticate.'})
  }
  // function called to signal express that it can continue processing the request
  next()
}

module.exports = auth