const express     = require('express');
const router      = express.Router();
const IncidentLog = require('../models/IncidentLog');
const ServerNode  = require('../models/ServerNode');

const isValidationErr = (e) => ['ValidationError','CastError'].includes(e.name);

// GET /api/incidents
router.get('/', async (req, res) => {
  try {
    const incidents = await IncidentLog.find()
      .populate('nodeId', 'nodeName region status')
      .sort({ timestamp: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/incidents
router.post('/', async (req, res) => {
  const { nodeId, severity, message } = req.body;

  if (!nodeId)           return res.status(400).json({ error: 'nodeId is required' });
  if (!severity)         return res.status(400).json({ error: 'severity is required' });
  if (!message?.trim())  return res.status(400).json({ error: 'message is required' });

  const validSeverities = ['LOW','HIGH','CRITICAL'];
  if (!validSeverities.includes(severity))
    return res.status(400).json({ error: `severity must be one of: ${validSeverities.join(', ')}` });

  try {
    const nodeExists = await ServerNode.findById(nodeId);
    if (!nodeExists) return res.status(404).json({ error: 'Referenced node not found' });

    const incident = await IncidentLog.create({
      nodeId,
      severity,
      message: message.trim(),
      resolved: false,
      timestamp: new Date(),
    });

    // Re-query to get clean populated response
    const populated = await IncidentLog.findById(incident._id)
      .populate('nodeId', 'nodeName region status');

    res.status(201).json(populated);
  } catch (err) {
    res.status(isValidationErr(err) ? 400 : 500).json({ error: err.message });
  }
});

// PATCH /api/incidents/:id/resolve
router.patch('/:id/resolve', async (req, res) => {
  try {
    const incident = await IncidentLog.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    ).populate('nodeId', 'nodeName region status');

    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    res.json(incident);
  } catch (err) {
    res.status(isValidationErr(err) ? 400 : 500).json({ error: err.message });
  }
});

module.exports = router;
