const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === "SequelizeValidationError") {
    const messages = error.errors.map(err => err.message)
    return res.status(400).json({ error: messages })
  }

  next(error)
}

const tokenExtractor = async (req, res, next) => {
  const { Session, User } = require('./../models')

  const authorization = req.get('authorization')
  if (!(authorization && authorization.toLowerCase().startsWith('bearer '))) {
    return res.status(401).json({ error: 'token missing' })
  }

  const token = authorization.substring(7)

  try {
    req.decodedToken = jwt.verify(token, SECRET)
  } catch {
    return res.status(401).json({ error: 'token invalid' })
  }

  const session = await Session.findOne({ where: { token } })
  if (!session) {
    return res.status(401).json({ error: 'session expired, please log in again' })
  }

  const user = await User.findByPk(req.decodedToken.id)
  if (!user || user.disabled) {
    return res.status(401).json({ error: 'account disabled' })
  }

  req.token = token
  next()
}

module.exports = { errorHandler, tokenExtractor }
