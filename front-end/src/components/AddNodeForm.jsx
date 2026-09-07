import React, { useState } from 'react';

const REGIONS = [
  'us-east-1','us-east-2','us-west-1','us-west-2',
  'eu-west-1','eu-west-2','eu-central-1',
  'ap-south-1','ap-southeast-1','ap-southeast-2','ap-northeast-1',
  'sa-east-1',
];

const EMPTY = { nodeName: '', region: 'us-east-1', status: 'ONLINE', latency: '' };

export default function AddNodeForm({ onSubmit, onClose }) {
  const [formData,   setFormData]   = useState(EMPTY);
  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Standard controlled handler — fixes "nodeName.toLowerCase is not a function"
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation ───────────────────────────────────────────────
    if (!formData.nodeName.trim()) {
      setError('Node name is required.');
      return;
    }
    if (formData.nodeName.trim().length < 3) {
      setError('Node name must be at least 3 characters.');
      return;
    }
    const parsedLatency = formData.latency !== '' ? Number(formData.latency) : 0;
    if (isNaN(parsedLatency) || parsedLatency < 0) {
      setError('Latency must be a positive number (ms).');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        nodeName: formData.nodeName.trim(),
        region:   formData.region,
        status:   formData.status,
        latency:  parsedLatency,
      });
      // onSubmit resolves → close (onClose called by App after success)
      setFormData(EMPTY);
      onClose();
    } catch (err) {
      // Show server-side error inside the modal
      setError(err.response?.data?.error || err.message || 'Failed to register node.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby="add-node-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card-bg rounded-2xl shadow-modal w-full max-w-md mx-4 p-6">

        <div className="flex items-center justify-between mb-5">
          <h2 id="add-node-title" className="text-ink font-bold text-base">Register New Node</h2>
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

          <div>
            <label htmlFor="nodeName" className="field-label">
              Node Name <span className="text-danger">*</span>
            </label>
            <input id="nodeName" name="nodeName" type="text"
              value={formData.nodeName} onChange={handleChange}
              placeholder="e.g. prod-server-01"
              autoComplete="off" required className="field-input" />
          </div>

          <div>
            <label htmlFor="region" className="field-label">Region</label>
            <select id="region" name="region"
              value={formData.region} onChange={handleChange}
              className="field-select">
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="field-label">Initial Status</label>
            <select id="status" name="status"
              value={formData.status} onChange={handleChange}
              className="field-select">
              <option value="ONLINE">ONLINE</option>
              <option value="DEGRADED">DEGRADED</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div>
            <label htmlFor="latency" className="field-label">Initial Latency (ms)</label>
            <input id="latency" name="latency" type="number"
              min="0" step="1"
              value={formData.latency} onChange={handleChange}
              placeholder="0" className="field-input" />
          </div>

          <div className="divider" />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={submitting}
              className="btn-ghost">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Registering…' : 'Register Node'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
