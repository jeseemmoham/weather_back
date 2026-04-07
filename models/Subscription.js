const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  preferences: {
    weather: { type: Boolean, default: true },
    flood: { type: Boolean, default: true },
    earthquake: { type: Boolean, default: true },
    emergency: { type: Boolean, default: true }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ zipCode: 1, active: 1 });
subscriptionSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
