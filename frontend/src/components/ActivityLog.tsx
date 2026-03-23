import { useEffect, useRef } from 'react';
import { Trash2, Download } from 'lucide-react';
import type { ActivityEntry } from '../types';

const LEVEL_COLORS: Record<string, string> = {
  info: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
};

interface Props {
  entries: ActivityEntry[];
  onClear: () => void;
  onExport?: () => void;
}

export default function ActivityLog({ entries, onClear, onExport }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Activity Log</h3>
        <div className="flex gap-1.5">
          {onExport && (
            <button onClick={onExport} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
              <Download size={14} />
            </button>
          )}
          <button onClick={onClear} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto rounded-lg p-3 font-mono text-xs leading-relaxed"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', minHeight: '120px', maxHeight: '300px' }}
      >
        {entries.length === 0 && (
          <span style={{ color: 'var(--text-muted)' }}>No activity yet</span>
        )}
        {entries.map(e => (
          <div key={e.id}>
            <span style={{ color: 'var(--text-muted)' }}>[{e.time}]</span>{' '}
            <span style={{ color: LEVEL_COLORS[e.level] || 'var(--text)' }}>{e.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
