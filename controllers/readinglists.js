const router = require('express').Router()

const { ReadingList, Blog, User } = require('../models')
const { tokenExtractor } = require('../util/middleware')

router.post('/', async (req, res) => {
  const { blogId, userId } = req.body

  if (!blogId || !userId) {
    return res.status(400).json({ error: 'blogId and userId are required' })
  }

  const blog = await Blog.findByPk(blogId)
  if (!blog) {
    return res.status(404).json({ error: 'blog not found' })
  }

  const user = await User.findByPk(userId)
  if (!user) {
    return res.status(404).json({ error: 'user not found' })
  }

  const existing = await ReadingList.findOne({ where: { blogId, userId } })
  if (existing) {
    return res.status(400).json({ error: 'blog is already in the reading list' })
  }

  const reading = await ReadingList.create({ blogId, userId })
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
