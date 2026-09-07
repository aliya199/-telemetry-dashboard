const express    = require('express');
const router     = express.Router();
const ServerNode = require('../models/ServerNode');
const IncidentLog = require('../models/IncidentLog');

const isValidationErr = (e) => ['ValidationError','CastError'].includes(e.name);

// GET /api/nodes
router.get('/', async (req, res) => {
  try {
    const nodes = await ServerNode.find().sort({ createdAt: -1 });
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/nodes
router.post('/', async (req, res) => {
  const { nodeName, region, status, latency } = req.body;
  if (!nodeName?.trim()) return res.status(400).json({ error: 'nodeName is required' });
  if (!region?.trim())   return res.status(400).json({ error: 'region is required' });

  const parsedLatency = latency !== undefined ? Number(latency) : 0;
  if (isNaN(parsedLatency) || parsedLatency < 0)
    return res.status(400).json({ error: 'latency must be a non-negative number' });

  const validStatuses = ['ONLINE','DEGRADED','CRITICAL'];
  if (status && !validStatuses.includes(status))
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });

  try {
    const node = await ServerNode.create({
      nodeName: nodeName.trim(),
      region:   region.trim(),
      status:   status || 'ONLINE',
      latency:  parsedLatency,
      lastPing: new Date(),
    });
    res.status(201).json(node);
  } catch (err) {
    res.status(isValidationErr(err) ? 400 : 500).json({ error: err.message });
  }
});

// PATCH /api/nodes/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status, latency } = req.body;

  const validStatuses = ['ONLINE','DEGRADED','CRITICAL'];
  if (status && !validStatuses.includes(status))
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });

  if (latency !== undefined) {
    const p = Number(latency);
    if (isNaN(p) || p < 0)
      return res.status(400).json({ error: 'latency must be a non-negative number' });
  }

  try {
    const update = { lastPing: new Date() };
    if (status  !== undefined) update.status  = status;
    if (latency !== undefined) update.latency = Number(latency);

    const node = await ServerNode.findByIdAndUpdate(
      req.params.id, update, { new: true, runValidators: true }
    );
    if (!node) return res.status(404).json({ error: 'Node not found' });
    res.json(node);
  } catch (err) {
    res.status(isValidationErr(err) ? 400 : 500).json({ error: err.message });
  }
});

// DELETE /api/nodes/:id — removes node AND its incidents
router.delete('/:id', async (req, res) => {
  try {
    const node = await ServerNode.findByIdAndDelete(req.params.id);
    if (!node) return res.status(404).json({ error: 'Node not found' });

    // Cascade: remove all incidents linked to this node
    const { deletedCount } = await IncidentLog.deleteMany({ nodeId: req.params.id });

    res.json({
      message: `Node "${node.nodeName}" deleted along with ${deletedCount} incident(s).`,
      node,
    });
  } catch (err) {
    res.status(isValidationErr(err) ? 400 : 500).json({ error: err.message });
  }
});

module.exports = router;
