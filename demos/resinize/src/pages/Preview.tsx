import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { fileDemos } from './Lab';

// /preview/<registry-id>: renders one lab demo full width, for screenshots and review.
export default function Preview() {
  const { id = '' } = useParams();
  const D = fileDemos[id];
  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <div className="mx-auto max-w-3xl rounded-[var(--radius)] border p-5" style={{ borderColor: 'var(--line)' }}>
        {D ? <Suspense fallback={null}><D /></Suspense> : <p>No demo file for “{id}”.</p>}
      </div>
    </div>
  );
}
