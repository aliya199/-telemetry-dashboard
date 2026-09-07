import React, { useEffect, useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import TelemetryGrid from './components/TelemetryGrid';
import IncidentFeed from './components/IncidentFeed';
import AddNodeForm from './components/AddNodeForm';
import DispatchIncidentForm from './components/DispatchIncidentForm';
import {
  fetchNodes,
  createNode,
  updateNodeStatus,
  deleteNode,
  fetchIncidents,
  createIncident,
  resolveIncident,
  seedDatabase,
} from './services/api';

// ── Toast notification (lightweight, no extra lib) ───────────────────────────
function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-modal border text-sm
            ${t.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : t.type === 'error'
              ? 'bg-red-50 border-red-200 text-danger'
              : 'bg-card-bg border-muted/30 text-ink'
            }`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-muted hover:text-ink ml-2 shrink-0 leading-none"
            aria-label="Dismiss"
          >✕</button>
        </div>
      ))}
    </div>
  );
}

let toastId = 0;

export default function App() {
  // ── Core state ─────────────────────────────────────────────────────────────
  const [nodes,        setNodes]        = useState([]);
  const [incidents,    setIncidents]    = useState([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [incLoading,   setIncLoading]   = useState(true);
  const [offline,      setOffline]      = useState(false);
  const [dbError,      setDbError]      = useState('');    // 503 DB guard error
  const [toasts,       setToasts]       = useState([]);

  // Modal state
  const [showAddNode,    setShowAddNode]    = useState(false);
  const [incidentTarget, setIncidentTarget] = useState(null);

  // Use ref so loadIncidents stays stable without offline in its dep array
  const offlineRef = useRef(false);
  offlineRef.current = offline;

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Data loaders ──────────────────────────────────────────────────────────
  const loadNodes = useCallback(async () => {
    try {
      setNodesLoading(true);
      const data = await fetchNodes();
      setNodes(data);
      setOffline(false);
      setDbError('');
    } catch (err) {
      if (err.isNetworkError) {
        setOffline(true);
      } else if (err.response?.status === 503) {
        setDbError(err.message);
      } else {
        addToast(err.message || 'Failed to load nodes.', 'error');
      }
    } finally {
      setNodesLoading(false);
    }
  }, [addToast]);

  const loadIncidents = useCallback(async () => {
    try {
      setIncLoading(true);
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (err) {
      // Suppress when offline — the offline banner already explains it
      if (!offlineRef.current && err.response?.status !== 503) {
        addToast(err.message || 'Failed to load incidents.', 'error');
      }
    } finally {
      setIncLoading(false);
    }
  }, [addToast]);

  // ── Mount: auto-seed then load ─────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try { await seedDatabase(); } catch { /* non-fatal */ }
      await Promise.all([loadNodes(), loadIncidents()]);
    }
    init();
  }, [loadNodes, loadIncidents]);

  // ── Refresh ────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setOffline(false);
    setDbError('');
    loadNodes();
    loadIncidents();
  }, [loadNodes, loadIncidents]);

  // ── Node CRUD ──────────────────────────────────────────────────────────────
  const handleAddNode = async (formData) => {
    // Throws on error so AddNodeForm can show inline error — does NOT re-throw to global
    const node = await createNode(formData);
    setNodes((prev) => [node, ...prev]);
    addToast(`Node "${node.nodeName}" registered.`, 'success');
    return node; // caller (AddNodeForm) uses this to close modal
  };

  const handleUpdateNodeStatus = async (id, status, latency) => {
    try {
      const updated = await updateNodeStatus(id, status, latency);
      setNodes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
      addToast(`${updated.nodeName} → ${updated.status} (${updated.latency} ms)`, 'success');
    } catch (err) {
      addToast('Status update failed: ' + err.message, 'error');
      throw err; // re-throw so NodeCard's finally block still fires
    }
  };

  const handleDeleteNode = async (id) => {
    try {
      const node = nodes.find((n) => n._id === id);
      await deleteNode(id);
      setNodes((prev) => prev.filter((n) => n._id !== id));
      // Also remove incidents for that node from local state
      setIncidents((prev) => prev.filter((i) => i.nodeId?._id !== id));
      addToast(`Node "${node?.nodeName}" removed.`, 'info');
    } catch (err) {
      addToast('Delete failed: ' + err.message, 'error');
    }
  };

  // ── Incident CRUD ──────────────────────────────────────────────────────────
  const handleCreateIncident = async (formData) => {
    // Throws on error so DispatchIncidentForm shows inline error
    const incident = await createIncident(formData);
    setIncidents((prev) => [incident, ...prev]);
    addToast('Incident dispatched.', 'success');
    return incident;
  };

  const handleResolveIncident = async (id) => {
    try {
      const updated = await resolveIncident(id);
      setIncidents((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      addToast('Incident marked as resolved.', 'success');
    } catch (err) {
      addToast('Resolve failed: ' + err.message, 'error');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-app-bg flex flex-col">

      {/* ── Lily background overlay ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:    'url(/lily.jpg)',
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundRepeat:   'no-repeat',
          opacity:            0.10,
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Header */}
        <Header
          nodes={nodes}
          onAddNode={() => setShowAddNode(true)}
          onRefresh={handleRefresh}
        />

        {/* ── Offline banner ── */}
        {offline && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50
                          flex items-start gap-3 shadow-sm" role="alert">
            <svg className="w-5 h-5 text-danger shrink-0 mt-0.5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0
                   2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
                   0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div className="flex-1">
              <p className="text-danger font-semibold text-sm">Backend Offline</p>
              <p className="text-danger/80 text-xs mt-0.5">
                Cannot reach <code className="font-mono bg-red-100 px-1 rounded">localhost:5000</code>.
                Run <code className="font-mono bg-red-100 px-1 rounded">npm run dev</code> inside <code className="font-mono bg-red-100 px-1 rounded">/backend</code>.
              </p>
            </div>
            <button onClick={handleRefresh}
              className="btn-ghost text-xs text-danger border-red-300 hover:bg-red-100 shrink-0">
              Retry
            </button>
          </div>
        )}

        {/* ── DB error banner (503) ── */}
        {dbError && !offline && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50
                          flex items-center justify-between gap-4 shadow-sm" role="alert">
            <p className="text-accent text-sm">{dbError}</p>
            <button onClick={handleRefresh}
              className="btn-ghost text-xs text-accent border-amber-300 hover:bg-amber-50 shrink-0">
              Retry
            </button>
          </div>
        )}

        {/* ── Main layout ── */}
        <main className="flex-1 flex flex-col lg:flex-row gap-6 px-6 py-6
                         max-w-screen-xl mx-auto w-full">

          {/* Left — node grid */}
          <div className="flex-1 min-w-0">
            <TelemetryGrid
              nodes={nodes}
              loading={nodesLoading}
              onUpdateStatus={handleUpdateNodeStatus}
              onLogIncident={(node) => setIncidentTarget(node)}
              onDeleteNode={handleDeleteNode}
            />
          </div>

          {/* Right — incident feed */}
          <div className="lg:w-[400px] xl:w-[440px] shrink-0">
            <IncidentFeed
              incidents={incidents}
              loading={incLoading}
              onResolve={handleResolveIncident}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-muted/20 bg-card-bg/80 backdrop-blur-sm px-6 py-3">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between text-muted text-xs">
            <span>Telemetry Dashboard · Cloud-Native Incident Dispatcher</span>
            <span>
              {nodes.length} node{nodes.length !== 1 ? 's' : ''}
              &ensp;·&ensp;
              {incidents.filter((i) => !i.resolved).length} active incident
              {incidents.filter((i) => !i.resolved).length !== 1 ? 's' : ''}
            </span>
          </div>
        </footer>

      </div>

      {/* ── Modals ── */}
      {showAddNode && (
        <AddNodeForm
          onSubmit={handleAddNode}
          onClose={() => setShowAddNode(false)}
        />
      )}
      {incidentTarget && (
        <DispatchIncidentForm
          nodes={nodes}
          defaultNode={incidentTarget}
          onSubmit={handleCreateIncident}
          onClose={() => setIncidentTarget(null)}
        />
      )}

      {/* ── Toast stack ── */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
