import React, { useState } from 'react';

const STATUS_META = {
  ONLINE:   { badgeCls: 'badge-online',   bar: 'bg-green-400' },
  DEGRADED: { badgeCls: 'badge-degraded', bar: 'bg-amber-400' },
  CRITICAL: { badgeCls: 'badge-critical', bar: 'bg-danger'    },
};

/**
 * NodeCard
 * Props:
 *   node           : ServerNode
 *   onUpdateStatus : (id, status, latency) => Promise<void>
 *   onLogIncident  : (node) => void
 *   onDeleteNode   : (id) => void
 */
export default function NodeCard({ node, onUpdateStatus, onLogIncident, onDeleteNode }) {
  const [busy,           setBusy]           = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState(false);

  const meta = STATUS_META[node.status] || STATUS_META.ONLINE;

  // Status change + simulated latency ping
  const pingAndSet = async (newStatus) => {
    setBusy(true);
    try {
      const simulatedLatency = Math.floor(Math.random() * 246) + 5;
      await onUpdateStatus(node._id, newStatus, simulatedLatency);
    } finally {
      setBusy(false);
    }
  };

  // Manual ping — refresh latency without changing status
  const handlePing = async () => {
    setBusy(true);
    try {
      const simulatedLatency = Math.floor(Math.random() * 246) + 5;
      await onUpdateStatus(node._id, node.status, simulatedLatency);
    } finally {
      setBusy(false);
    }
  };

  const lastPingStr = node.lastPing
    ? new Date(node.lastPing).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : '—';

  const latencyColor =
    node.latency > 200 ? 'text-danger' :
    node.latency > 100 ? 'text-accent' :
    'text-green-700';

  return (
    <article className="card flex flex-col gap-4 relative overflow-hidden">
      {/* Status colour bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${meta.bar}`} />

      {/* Header row */}
      <div className="flex items-start justify-between pt-2">
        <div className="min-w-0 pr-2">
          <h3 className="text-ink font-bold text-sm truncate" title={node.nodeName}>
            {node.nodeName}
          </h3>
          <p className="text-muted text-xs mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z
                   M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25
                   S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {node.region}
          </p>
        </div>
        <span className={meta.badgeCls}>{node.status}</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card-alt rounded-lg px-3 py-2.5 border border-muted/20">
          <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Latency</p>
          <p className={`font-bold text-xl leading-none ${latencyColor}`}>
            {node.latency ?? 0}
            <span className="text-muted text-xs font-normal ml-0.5">ms</span>
          </p>
        </div>
        <div className="bg-card-alt rounded-lg px-3 py-2.5 border border-muted/20">
          <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Last Ping</p>
          <p className="font-semibold text-ink text-xs leading-none mt-1">{lastPingStr}</p>
        </div>
      </div>

      <div className="divider !my-0" />

      {/* Status buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => pingAndSet('ONLINE')}
          disabled={busy || node.status === 'ONLINE'}
          className="btn-ghost text-xs text-green-700 border-green-300 hover:bg-green-50
                     disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Set ${node.nodeName} online`}>
          Online
        </button>
        <button onClick={() => pingAndSet('DEGRADED')}
          disabled={busy || node.status === 'DEGRADED'}
          className="btn-ghost text-xs text-accent border-amber-300 hover:bg-amber-50
                     disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Set ${node.nodeName} degraded`}>
          Degrade
        </button>
        <button onClick={() => pingAndSet('CRITICAL')}
          disabled={busy || node.status === 'CRITICAL'}
          className="btn-danger text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Set ${node.nodeName} critical`}>
          Critical
        </button>
      </div>

      {/* Secondary action row */}
      <div className="flex gap-2 flex-wrap">
        {/* Ping — refreshes latency */}
        <button onClick={handlePing}
          disabled={busy}
          className="btn-ghost text-xs disabled:opacity-30"
          aria-label={`Ping ${node.nodeName}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M5.636 18.364a9 9 0 0 1 0-12.728m12.728 0a9 9 0 0 1 0 12.728M9 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
          </svg>
          Ping
        </button>

        {/* Log incident */}
        <button onClick={() => onLogIncident(node)}
          disabled={busy}
          className="btn-ghost text-xs disabled:opacity-30"
          aria-label={`Log incident for ${node.nodeName}`}>
          + Incident
        </button>

        {/* Delete — two-step confirmation */}
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="btn-ghost text-xs text-danger border-red-200 hover:bg-red-50 ml-auto
                       disabled:opacity-30"
            aria-label={`Delete ${node.nodeName}`}>
            Delete
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-1">
            <span className="text-danger text-[10px]">Sure?</span>
            <button onClick={() => { setConfirmDelete(false); onDeleteNode(node._id); }}
              className="btn-danger text-xs py-1 px-2">
              Yes
            </button>
            <button onClick={() => setConfirmDelete(false)}
              className="btn-ghost text-xs py-1 px-2">
              No
            </button>
          </div>
        )}
      </div>

      {busy && (
        <p className="text-muted text-xs animate-pulse -mt-2">Updating…</p>
      )}
    </article>
  );
}
