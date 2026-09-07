import React from 'react';

/**
 * IncidentFeed — cream-theme incident log panel.
 * Props:
 *   incidents : IncidentLog[] (populated with nodeId)
 *   loading   : boolean
 *   onResolve : (id) => void
 */

const SEVERITY_CLS = {
  LOW:      'badge-low',
  HIGH:     'badge-high',
  CRITICAL: 'badge-critical',
};

export default function IncidentFeed({ incidents = [], loading, onResolve }) {
  const active   = incidents.filter((i) => !i.resolved);
  const resolved = incidents.filter((i) =>  i.resolved);

  return (
    <section aria-label="Incident dispatch feed" className="w-full space-y-4">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-ink font-bold text-sm uppercase tracking-widest">
          Incident Feed
        </h2>
        {active.length > 0 && (
          <span className="badge-critical">
            {active.length} active
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse bg-card-alt" aria-hidden="true" />
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-8 h-8 text-muted/40 mb-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <p className="text-ink font-semibold text-sm">No incidents logged</p>
          <p className="text-muted text-xs mt-0.5">System is running clean.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[560px] overflow-y-auto pr-0.5">

          {/* Active incidents */}
          {active.map((inc) => (
            <IncidentRow key={inc._id} incident={inc} onResolve={onResolve} />
          ))}

          {/* Resolved section */}
          {resolved.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-3 pb-1">
                <div className="flex-1 border-t border-muted/25" />
                <span className="text-muted text-[10px] uppercase tracking-widest shrink-0">
                  Resolved ({resolved.length})
                </span>
                <div className="flex-1 border-t border-muted/25" />
              </div>
              {resolved.map((inc) => (
                <IncidentRow key={inc._id} incident={inc} onResolve={onResolve} dimmed />
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function IncidentRow({ incident, onResolve, dimmed = false }) {
  // FIX: local resolving state prevents duplicate API calls from rapid clicks
  const [resolving, setResolving] = React.useState(false);
  const node = incident.nodeId;
  const ts   = incident.timestamp
    ? new Date(incident.timestamp).toLocaleString([], {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <article
      className={`card flex items-start gap-3 transition-opacity duration-200
        ${dimmed ? 'opacity-50' : ''}
        ${!dimmed && incident.severity === 'CRITICAL' ? 'border border-red-200' : ''}
      `}
    >
      {/* Severity badge */}
      <span className={`${SEVERITY_CLS[incident.severity] || 'badge'} shrink-0 mt-0.5`}>
        {incident.severity}
      </span>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-ink text-sm font-medium leading-snug line-clamp-2">
          {incident.message}
        </p>
        <p className="text-muted text-xs mt-1">
          {node ? `${node.nodeName} · ${node.region}` : 'Unknown node'}
          &ensp;·&ensp;{ts}
        </p>
      </div>

      {/* Action */}
      {!incident.resolved ? (
        <button
          onClick={async () => {
            setResolving(true);
            try { await onResolve(incident._id); }
            finally { setResolving(false); }
          }}
          disabled={resolving}
          className="btn-ghost text-xs shrink-0 self-center disabled:opacity-40"
          aria-label={`Resolve: ${incident.message}`}
        >
          {resolving ? '…' : 'Resolve'}
        </button>
      ) : (
        <span className="text-muted text-xs italic shrink-0 self-center">resolved</span>
      )}
    </article>
  );
}
