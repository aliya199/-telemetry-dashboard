import React from 'react';
import NodeCard from './NodeCard';

export default function TelemetryGrid({
  nodes = [], loading, onUpdateStatus, onLogIncident, onDeleteNode,
}) {
  if (loading) {
    return (
      <section aria-busy="true" aria-label="Loading nodes" className="w-full space-y-4">
        <SectionHeader loading />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-56 animate-pulse bg-card-alt" aria-hidden="true" />
          ))}
        </div>
      </section>
    );
  }

  if (nodes.length === 0) {
    return (
      <section className="w-full space-y-4">
        <SectionHeader count={0} />
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <svg className="w-10 h-10 text-muted/40 mb-3" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 6 0m-6 0H3
                 m16.5 0a3 3 0 0 0 3-3m-3 3a3 3 0 1 1-6 0m6 0h-1.5" />
          </svg>
          <p className="text-ink font-semibold text-sm">No nodes registered</p>
          <p className="text-muted text-xs mt-1">Click "Add Node" in the header to get started.</p>
        </div>
      </section>
    );
  }

  const online      = nodes.filter((n) => n.status === 'ONLINE').length;
  const degraded    = nodes.filter((n) => n.status === 'DEGRADED').length;
  const critical    = nodes.filter((n) => n.status === 'CRITICAL').length;
  const avgLatency  = Math.round(
    nodes.reduce((s, n) => s + (n.latency || 0), 0) / nodes.length
  );

  return (
    <section aria-label="Server node telemetry" className="w-full space-y-4">
      <SectionHeader count={nodes.length} />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Online"      value={online}           color="text-green-700 bg-green-50  border-green-200" />
        <StatChip label="Degraded"    value={degraded}         color="text-accent   bg-amber-50   border-amber-200" />
        <StatChip label="Critical"    value={critical}         color="text-danger   bg-red-50     border-red-200" />
        <StatChip label="Avg Latency" value={`${avgLatency} ms`} color="text-ink   bg-card-alt   border-muted/30" />
      </div>

      {/* Node cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {nodes.map((node) => (
          <NodeCard
            key={node._id}
            node={node}
            onUpdateStatus={onUpdateStatus}
            onLogIncident={onLogIncident}
            onDeleteNode={onDeleteNode}
          />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ count, loading }) {
  return (
    <h2 className="text-ink font-bold text-sm uppercase tracking-widest">
      Live System Overview
      {!loading && (
        <span className="ml-2 text-muted font-normal normal-case tracking-normal">
          — {count} node{count !== 1 ? 's' : ''}
        </span>
      )}
    </h2>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div className={`rounded-lg border px-4 py-3 flex flex-col gap-0.5 ${color}`}>
      <span className="text-[10px] uppercase tracking-widest opacity-70">{label}</span>
      <span className="font-bold text-lg leading-none">{value}</span>
    </div>
  );
}
