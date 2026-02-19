import { useEffect, useMemo, useRef, useState } from 'react';

type Cadence = {
  id: string;
  name: string;
  steps: Array<
    | { id: string; type: 'SEND_EMAIL'; subject: string; body: string }
    | { id: string; type: 'WAIT'; seconds: number }
  >;
};

const DEFAULT_CADENCE: Cadence = {
  id: 'cad_123',
  name: 'Welcome Flow',
  steps: [
    { id: '1', type: 'SEND_EMAIL', subject: 'Welcome', body: 'Hello there' },
    { id: '2', type: 'WAIT', seconds: 10 },
    { id: '3', type: 'SEND_EMAIL', subject: 'Follow up', body: 'Checking in' }
  ]
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function Home() {
  const [cadenceJson, setCadenceJson] = useState(
    JSON.stringify(DEFAULT_CADENCE, null, 2)
  );
  const [contactEmail, setContactEmail] = useState('user@example.com');
  const [cadenceId, setCadenceId] = useState('cad_123');
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [state, setState] = useState<{
    currentStepIndex: number;
    stepsVersion: number;
    status: string;
  } | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const parsedCadence = useMemo(() => {
    try {
      return JSON.parse(cadenceJson) as Cadence;
    } catch {
      return null;
    }
  }, [cadenceJson]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function createOrUpdateCadence() {
    if (!parsedCadence) {
      alert('Invalid JSON');
      return;
    }
    const existing = await fetch(`${API_BASE}/cadences/${parsedCadence.id}`);
    if (existing.ok) {
      await fetch(`${API_BASE}/cadences/${parsedCadence.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedCadence)
      });
    } else {
      await fetch(`${API_BASE}/cadences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedCadence)
      });
    }
    setCadenceId(parsedCadence.id);
    alert('Cadence saved');
  }

  async function startEnrollment() {
    if (!cadenceId) {
      alert('Set cadenceId');
      return;
    }
    const res = await fetch(`${API_BASE}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cadenceId, contactEmail })
    });
    if (!res.ok) {
      const t = await res.text();
      alert(`Failed: ${t}`);
      return;
    }
    const data = await res.json();
    setEnrollmentId(data.id);
    poll(data.id);
  }

  function poll(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const res = await fetch(`${API_BASE}/enrollments/${id}`);
      if (res.ok) {
        const s = await res.json();
        setState(s);
        if (s.status === 'COMPLETED' || s.status === 'FAILED') {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }
    }, 1000);
  }

  async function updateRunning() {
    if (!enrollmentId) {
      alert('No running enrollment');
      return;
    }
    if (!parsedCadence) {
      alert('Invalid JSON');
      return;
    }
    const res = await fetch(
      `${API_BASE}/enrollments/${enrollmentId}/update-cadence`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: parsedCadence.steps })
      }
    );
    if (!res.ok) {
      alert(`Failed to update: ${await res.text()}`);
    } else {
      alert('Update signal sent');
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Email Cadence Demo</h1>
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h2>Cadence JSON</h2>
          <textarea
            value={cadenceJson}
            onChange={(e) => setCadenceJson(e.target.value)}
            style={{ width: '100%', height: 400, fontFamily: 'monospace' }}
          />
          <div style={{ marginTop: 8 }}>
            <button onClick={createOrUpdateCadence} disabled={!parsedCadence}>
              Save Cadence
            </button>
          </div>
        </div>
        <div>
          <h2>Run Workflow</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={cadenceId}
              onChange={(e) => setCadenceId(e.target.value)}
              placeholder="cadenceId"
              style={{ flex: 1 }}
            />
            <input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contactEmail"
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={startEnrollment}>Start</button>
            <button onClick={() => enrollmentId && poll(enrollmentId)} disabled={!enrollmentId}>
              Poll
            </button>
            <button onClick={updateRunning} disabled={!enrollmentId || !parsedCadence}>
              Update Running
            </button>
          </div>
          <div>
            <div>Enrollment ID: {enrollmentId ?? '-'}</div>
            <pre style={{ background: '#f5f5f5', padding: 12 }}>
              {state ? JSON.stringify(state, null, 2) : 'No state yet'}
            </pre>
          </div>
        </div>
      </section>
      <p style={{ marginTop: 16 }}>
        API Base: {API_BASE}
      </p>
    </main>
  );
}

