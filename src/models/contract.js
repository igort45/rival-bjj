const { Timestamp } = require('mongodb');
const mongoose = require('mongoose')

const contractSchema = new mongoose.Schema({
  rules: {
    type: String,
    required: true,
  },
  datetime: {
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
  winner: {
    type: String,
    default: null
  },
  weightClass: {
    type: String,
    required: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Player'
  },
  playerFirstName: {
    type: String,
    required: false
  },
  playerLastName: {
    type: String,
    required: false
  },
  ruleExceptions: {
    type: String,
    maxlength: 200
  },
  playerRank: {
    gi: {
      type: Number,
      default: 0
    },
    nogi: {
      type: Number,
      default: 0
    }
  },
  opponentLastName: {
    type: String,
    required: false
  },
  opponentFirstName: {
    type: String,
    required: false
  },
  opponentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Player'
  },
  opponentRank: {
    gi: {
      type: Number,
      default: 0
    },
    nogi: {
      type: Number,
      default: 0
    }
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
  {
    timestamps: true
  })

contractSchema.virtual('status').get(function () {
  if (this.completedAt) return "completed"
  if (this.cancelledAt) return "cancelled"
  if (this.declinedAt) return "declined"
  if (this.acceptedAt) return "accepted"
  return "sent"
});

const Contract = mongoose.model('Contract', contractSchema)

module.exports = Contract