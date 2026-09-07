const mongoose = require('mongoose');

const incidentLogSchema = new mongoose.Schema(
  {
    nodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServerNode',
      required: [true, 'Node reference is required'],
    },
    severity: {
      type: String,
      enum: ['LOW', 'HIGH', 'CRITICAL'],
      required: [true, 'Severity level is required'],
    },
    message: {
      type: String,
      required: [true, 'Incident message is required'],
      trim: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IncidentLog', incidentLogSchema);
