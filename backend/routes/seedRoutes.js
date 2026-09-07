const express = require('express');
const router = express.Router();
const ServerNode = require('../models/ServerNode');

const SEED_NODES = [
  {
    nodeName: 'prod-us-east-01',
    region: 'us-east-1',
    status: 'ONLINE',
    latency: 18,
    lastPing: new Date(),
  },
  {
    nodeName: 'db-eu-west-01',
    region: 'eu-west-1',
    status: 'DEGRADED',
    latency: 142,
    lastPing: new Date(),
  },
  {
    nodeName: 'auth-ap-south-01',
    region: 'ap-south-1',
    status: 'ONLINE',
    latency: 55,
    lastPing: new Date(),
  },
];

// POST /api/seed — Populate initial nodes only if the collection is empty
router.post('/', async (req, res) => {
  try {
    const count = await ServerNode.countDocuments();
    if (count > 0) {
      return res.json({
        message: `Database already has ${count} node(s). Seed skipped.`,
        seeded: false,
        count,
      });
    }

    const nodes = await ServerNode.insertMany(SEED_NODES);
    res.status(201).json({
      message: `Seeded ${nodes.length} initial server nodes.`,
      seeded: true,
      nodes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
