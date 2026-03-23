import type { DuplicateReport as DupReport } from '../types';
import { Copy, FileText } from 'lucide-react';

interface Props {
  report: DupReport | null;
}

export default function DuplicateReport({ report }: Props) {
  if (!report) return null;

  const { summary, name_duplicates, content_duplicates } = report;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Duplicate Detection Results</h3>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg px-3 py-2.5 flex items-center gap-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <FileText size={16} style={{ color: 'var(--warning)' }} />
          <div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Same Name</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {summary.name_dupe_files} files in {summary.name_dupe_groups} groups
            </div>
          </div>
        </div>
        <div className="rounded-lg px-3 py-2.5 flex items-center gap-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Copy size={16} style={{ color: 'var(--danger)' }} />
          <div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Same Content</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {summary.content_dupe_files} files in {summary.content_dupe_groups} groups
            </div>
          </div>
        </div>
      </div>

      {Object.keys(name_duplicates).length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium mb-1" style={{ color: 'var(--warning)' }}>Name Duplicates</h4>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {Object.entries(name_duplicates).slice(0, 20).map(([name, paths]) => (
              <div key={name} className="rounded px-2 py-1.5 text-xs" style={{ background: 'var(--bg-input)' }}>
                <span className="font-medium" style={{ color: 'var(--text)' }}>{name}</span>
                <span style={{ color: 'var(--text-muted)' }}> ({paths.length} copies)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(content_duplicates).length > 0 && (
        <div>
          <h4 className="text-xs font-medium mb-1" style={{ color: 'var(--danger)' }}>Content Duplicates</h4>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {Object.entries(content_duplicates).slice(0, 20).map(([hash, paths]) => (
              <div key={hash} className="rounded px-2 py-1.5 text-xs" style={{ background: 'var(--bg-input)' }}>
                <span className="font-medium" style={{ color: 'var(--text)' }}>
                  {paths.map(p => p.split(/[\\/]/).pop()).join(', ')}
                </span>
                <span style={{ color: 'var(--text-muted)' }}> (identical content)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
