const { Timestamp } = require('mongodb');
const mongoose = require('mongoose')

const opts = { timestamps: true, toJSON: { virtuals: true, } };

const contractSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  startsAt: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  method: {
    type: String,
    default: null
  },
  result: {
    type: String,
    enum: ['win', 'lose', 'draw', 'pending', 'cancelled'],
    default: 'pending'
  },
  weightClass: {
    type: String,
    required: true
  },
  playerQualityRating: {
    type: Number,
    default: 0
  },
  opponentQualityRating: {
    type: Number,
    default: 0
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Player'
  },
  opponentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Player'
  },
  playerFirstName: {
    type: String,
    required: true
  },
  playerLastName: {
    type: String,
    required: true
  },
  ruleExceptions: {
    type: String,
    maxlength: 200
  },
  opponentLastName: {
    type: String,
    required: true
  },
  opponentFirstName: {
    type: String,
    required: true
  },
  refereeName: {
    type: String,
    required: true
  },
  refereeComments: {
    type: String,
    max: 500
  },
  completedAt: {
    type: Date,
    default: null,
  },
  acceptedAt: {
    type: Date,
    default: null,
  },
  declinedAt: {
    type: Date,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  }
},
  opts
)

contractSchema.virtual('status').get(function () {
  if (this.cancelledAt) return "cancelled"
  if (this.completedAt) return "completed"
  if (this.declinedAt) return "declined"
  if (this.acceptedAt) return "accepted"
  return "sent"
});



const Contract = mongoose.model('Contract', contractSchema)

module.exports = Contract