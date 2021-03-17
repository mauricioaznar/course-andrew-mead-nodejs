const express = require('express')
const Task = require('../models/task')
const User = require('../models/user')
const router = new express.Router()
const authMiddleware = require('../middleware/auth')

router.post('/tasks', authMiddleware, async (req, res) => {
  // const task = new Task(req.body)
  const task = new Task({...req.body, owner: req.user._id})
  try {
    await task.save()
    return res.send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})

// GET /tasks?completed=true
// GET /tasks?limit=2&skip=1
// GET /tasks?sortBy=createdAt:desc

router.get('/tasks', authMiddleware, async (req, res) => {
  const match = {}
  const sort = {}
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
  }
  try {
    const user = await User.findOne({_id: req.user._id})
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
    // const tasks = await Task.find({owner: req.user._id})
    return res.send(user.tasks)
  } catch (error) {
    return res.status(500).send()
  }
})

router.get('/tasks/:id', authMiddleware, async (req, res) => {
  const _id = req.params.id
  const task = await Task.findOne({_id, owner: req.user._id})
  try {
    if (!task) {
      return res.status(404).send()
    }
    return res.send(task)
  } catch (error) {
    res.status(500).send()
  }
})

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })
  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'})
  }
  try {

    const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
    if (!task) {
      return res.status(404).send()
    }
    updates.forEach(update => {
      task[update] = req.body[update]
    })
    await task.save()
    return res.send(task)
  } catch (error) {
    console.log(error)
    return res.status(400).send()
  }
})

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    })
    if (!task) {
      return res.status(404).send()
    }
    return res.send(task)
  } catch (e) {
    return res.status(500).send()
  }
})

module.exports = router