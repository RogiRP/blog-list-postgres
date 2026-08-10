const router = require('express').Router()

const { ReadingList } = require('../models')

router.post('/', async (req, res) => {
  const reading = await ReadingList.create({
    blogId: req.body.blogId,
    userId: req.body.userId
  })
  res.json(reading)
})

module.exports = router
