const router = require('express').Router()

const { ReadingList } = require('../models')
const { tokenExtractor } = require('../util/middleware')

router.post('/', async (req, res) => {
  const reading = await ReadingList.create({
    blogId: req.body.blogId,
    userId: req.body.userId
  })
  res.json(reading)
})

router.put('/:id', tokenExtractor, async (req, res) => {
  const reading = await ReadingList.findByPk(req.params.id)
  if (!reading) {
    return res.status(404).end()
  }
  if (reading.userId !== req.decodedToken.id) {
    return res.status(401).json({ error: 'only the owner can mark this as read' })
  }
  reading.read = req.body.read
  await reading.save()
  res.json(reading)
})

module.exports = router
