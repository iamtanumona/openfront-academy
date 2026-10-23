import { useEffect, useState } from 'react';

type Props = { apiBase: string };
export default function StatusPanel({ apiBase }: Props) {
  const [status, setStatus] = useState('Checking API…');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/health/live`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('API unavailable'); return response.json(); })
      .then(() => setStatus('API connected'))
      .catch((error: unknown) => { if (!controller.signal.aborted) setStatus('API unavailable — start the local API server'); });
    return () => controller.abort();
  }, [apiBase]);
  return <div className="panel" role="status" aria-live="polite"><strong>System status:</strong> {status}</div>;
}
