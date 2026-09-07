const mongoose = require('mongoose');

const serverNodeSchema = new mongoose.Schema(
  {
    nodeName: {
      type: String,
      required: [true, 'Node name is required'],
      trim: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
      // e.g. 'us-east-1', 'eu-west-2', etc.
    },
    status: {
      type: String,
      enum: ['ONLINE', 'DEGRADED', 'CRITICAL'],
      default: 'ONLINE',
    },
    latency: {
      type: Number, // milliseconds
      default: 0,
    },
    lastPing: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServerNode', serverNodeSchema);
