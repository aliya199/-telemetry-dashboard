import React, { useState } from 'react';

const buildEmpty = (nodes = [], defaultNode = null) => ({
  nodeId:   defaultNode?._id || nodes[0]?._id || '',
  severity: 'HIGH',
  message:  '',
});

export default function DispatchIncidentForm({ nodes = [], defaultNode, onSubmit, onClose }) {
  const [formData,   setFormData]   = useState(() => buildEmpty(nodes, defaultNode));
  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Standard controlled handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nodeId)         { setError('Please select a target node.');  return; }
    if (!formData.message.trim()) { setError('Incident message is required.'); return; }
    if (formData.message.trim().length < 5) {
      setError('Message must be at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...formData, message: formData.message.trim() });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to dispatch incident.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby="dispatch-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card-bg rounded-2xl shadow-modal w-full max-w-md mx-4 p-6">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 id="dispatch-title" className="text-ink font-bold text-base">
              Dispatch Incident Report
            </h2>
            {defaultNode && (
              <p className="text-muted text-xs mt-0.5">
                Node: <span className="text-ink font-semibold">{defaultNode.nodeName}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} disabled={submitting}
            className="text-muted hover:text-ink w-7 h-7 flex items-center justify-center
                       rounded-md hover:bg-muted/10 transition-colors"
            aria-label="Close">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <p role="alert" className="text-danger text-sm mb-4 bg-red-50 border border-red-200
                                     rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Target node */}
          <div>
            <label htmlFor="inc-nodeId" className="field-label">
              Target Node <span className="text-danger">*</span>
            </label>
            {nodes.length === 0 ? (
              <p className="text-muted text-sm bg-card-alt border border-muted/30
                            rounded-lg px-3 py-2">
                No nodes registered yet. Add a node first.
              </p>
            ) : (
              <select id="inc-nodeId" name="nodeId"
                value={formData.nodeId} onChange={handleChange}
                className="field-select">
                {nodes.map((n) => (
                  <option key={n._id} value={n._id}>
                    {n.nodeName} ({n.region}) — {n.status}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Severity */}
          <div>
            <label htmlFor="inc-severity" className="field-label">Severity</label>
            <select id="inc-severity" name="severity"
              value={formData.severity} onChange={handleChange}
              className="field-select">
              <option value="LOW">LOW — minor issue</option>
              <option value="HIGH">HIGH — service impact</option>
              <option value="CRITICAL">CRITICAL — outage</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="inc-message" className="field-label">
              Message <span className="text-danger">*</span>
            </label>
            <textarea id="inc-message" name="message"
              value={formData.message} onChange={handleChange}
              rows={3} placeholder="Describe the incident…"
              required className="field-input resize-none" />
            <p className="text-muted text-[10px] mt-1">
              {formData.message.length} chars
            </p>
          </div>

          <div className="divider" />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={submitting}
              className="btn-ghost">Cancel</button>
            <button type="submit"
              disabled={submitting || nodes.length === 0}
              className="btn-danger disabled:opacity-40">
              {submitting ? 'Dispatching…' : 'Dispatch Incident'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
