import React from 'react';

/**
 * Header — app title + cluster-wide health badge.
 * Props:
 *   nodes: Array of ServerNode objects
 *   onAddNode: () => void
 *   onRefresh: () => void
 */
export default function Header({ nodes = [], onAddNode, onRefresh }) {
  const hasCritical = nodes.some((n) => n.status === 'CRITICAL');
  const hasDegraded = nodes.some((n) => n.status === 'DEGRADED');

  let badgeLabel = 'ALL SYSTEMS OPERATIONAL';
  let badgeCls   = 'bg-green-100 text-green-800';
  let dotCls     = 'bg-green-500';

  if (hasCritical) {
    badgeLabel = 'CRITICAL ALERT';
    badgeCls   = 'bg-red-100 text-danger';
    dotCls     = 'bg-danger animate-pulse';
  } else if (hasDegraded) {
    badgeLabel = 'DEGRADED PERFORMANCE';
    badgeCls   = 'bg-amber-100 text-accent';
    dotCls     = 'bg-amber-500';
  }

  return (
    <header className="w-full bg-card-bg border-b border-muted/25 px-6 py-4">
      <div className="max-w-screen-xl mx-auto flex flex-wrap items-center justify-between gap-4">

        {/* Branding */}
        <div className="flex items-center gap-3">
          {/* Signal / radar icon */}
          <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-app-bg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 3.75A6.75 6.75 0 0 0 2.25 10.5M9 3.75a6.75 6.75 0 0 1 6.75 6.75M9 3.75V2.25m6.75 8.25A6.75 6.75 0 0 1 9 17.25M15.75 10.5V12m-6.75 5.25A6.75 6.75 0 0 0 15.75 10.5M8.25 17.25v1.5M9 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-ink font-bold text-lg leading-tight tracking-tight">
              Telemetry Dashboard
            </h1>
            <p className="text-muted text-xs">Cloud-Native Incident Dispatcher</p>
          </div>
        </div>

        {/* Health badge + controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Cluster health badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeCls}`}>
            <span className={`w-2 h-2 rounded-full ${dotCls}`} />
            {badgeLabel}
          </span>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="btn-ghost text-xs"
            aria-label="Refresh data"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8 8 0 0 1 19.418 15M19.418 15H15M4.582 9H9" />
            </svg>
            Refresh
          </button>

          {/* Add node */}
          <button
            onClick={onAddNode}
            className="btn-primary text-xs"
            aria-label="Register a new server node"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Node
          </button>
        </div>

      </div>
    </header>
  );
}
