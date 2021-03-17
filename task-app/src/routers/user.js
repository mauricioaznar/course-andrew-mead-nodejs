const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const router = new express.Router()
const authMiddleware = require('../middleware/auth')
const {sendWelcomeEmail} = require('../emails/account')

// TODO validate when a file hasnt been sent
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a word document'))
    }
    cb(undefined, true)
  }
})

// how to render image
// data:image/jpg;base64,'Buffer here'
router.post('/users/me/avatar',  authMiddleware, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({width: 250, height: 250})
    .png()
    .toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar',  authMiddleware, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user ||!user.avatar) {
      throw new Error()
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (e) {
    console.log(e)
    res.status(404).send()
  }
})

router.post('/users', async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.send({user, token})
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({user, token})
  } catch (e) {
    res.status(404).send()
  }
})

router.post('/users/logout', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/users/me', authMiddleware, async (req, res) => {
  res.send(req.user)
})

router.patch('/users/me', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })
  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'})
  }
  try {
    const user = req.user
    updates.forEach(update => {
      user[update] = req.body[update]
    })
    await user.save()
    return res.send(user)
  } catch (error) {
    return res.status(400).send()
  }
})

router.delete('/users/me', authMiddleware, async (req, res) => {
  try {
    await req.user.remove()
    return res.send(req.user)
  } catch (e) {
    return res.status(500).send()
  }
})

module.exports = router