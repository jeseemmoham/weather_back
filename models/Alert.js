const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: ['weather', 'flood', 'earthquake', 'emergency'],
    index: true
  },
  severity: {
    type: String,
    required: [true, 'Severity level is required'],
    enum: ['low', 'medium', 'high', 'critical'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Alert description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    }
  },
  source: {
    type: String,
    default: 'system',
    enum: ['system', 'openweathermap', 'admin', 'mock']
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient ZIP code + active queries
alertSchema.index({ zipCode: 1, active: 1, createdAt: -1 });

// Geospatial index for map queries
alertSchema.index({ 'location': '2dsphere' });

// Auto-deactivate expired alerts
alertSchema.pre('find', function () {
  this.where({ 
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  });
});

module.exports = mongoose.model('Alert', alertSchema);
