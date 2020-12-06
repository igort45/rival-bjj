const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const playerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  birthYear: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    unique: "has already been registered, try to log in?",
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  weightClass: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    trim: true
  },
  nogi: {
    type: Number,
    required: true,
  },
  gi: {
    type: Number,
    required: true,
  },
  avatar: {
    type: String
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  confirmedAt: {
    type: Date,
    default: null,
  },
  confirmationCode: {
    type: String
  },
  community: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

playerSchema.plugin(require('mongoose-beautiful-unique-validation'));

playerSchema.virtual('contracts', {
  ref: 'Contract',
  localField: '_id',
  foreignField: 'playerId'
})

playerSchema.virtual("qualityRating").get(() => {
  const score = ((this.sumRating / (this.wins + this.losses + this.draws)) * 10) / 10
  return score || 0
})

playerSchema.methods.toJSON = function () {
  const player = this
  const playerObject = player.toObject()

  delete playerObject.password
  delete playerObject.tokens

  return playerObject
}

playerSchema.statics.confirm = async (confirmationCode) => {
  const player = await Player.findOne({ confirmationCode })
  if (!player) return false
  player.confirmedAt = Date.now()
  await player.save()
  return true
}

playerSchema.statics.findByCredentials = async (email, password) => {
  const player = await Player.findOne({ email })
  if (!player) throw new Error('Unable to find player')
  const isMatch = await bcrypt.compare(password, player.password)
  if (!isMatch) throw new Error('Unable to login')
  return player
}

playerSchema.pre('save', async function (next) {
  const player = this
  setTimeout(async function () {
    const document = await Player.findById(player.id)
    if (!document.confirmedAt) await document.remove()
    return
  }, 3600000);
  next();
})

// Hash the plain text password before saving
playerSchema.pre('save', async function (next) {
  const player = this
  if (player.isModified('password')) player.password = await bcrypt.hash(player.password, 8)
  next()
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player