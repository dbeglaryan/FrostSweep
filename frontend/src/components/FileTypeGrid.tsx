import { Search } from 'lucide-react';
import { useState } from 'react';

interface Props {
  extensions: string[];
  selected: Set<string>;
  onToggle: (ext: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function FileTypeGrid({ extensions, selected, onToggle, onSelectAll, onDeselectAll }: Props) {
  const [search, setSearch] = useState('');
  const filtered = extensions.filter(e => e.includes(search.toLowerCase()));

  if (extensions.length === 0) {
    return (
      <p className="text-sm italic py-2" style={{ color: 'var(--text-muted)' }}>
        Scan a folder to see file types
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="relative flex-1 max-w-[250px]">
          <Search size={14} className="absolute left-2.5 top-2.5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search extensions..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        <button onClick={onSelectAll} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--accent)' }}>
          Select All
        </button>
        <button onClick={onDeselectAll} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--text-muted)' }}>
          Deselect All
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {filtered.map(ext => (
          <button
            key={ext}
            onClick={() => onToggle(ext)}
            className="px-2.5 py-1 rounded-full text-xs font-mono transition-all"
            style={{
              background: selected.has(ext) ? 'var(--accent)' : 'var(--bg-input)',
              color: selected.has(ext) ? '#fff' : 'var(--text)',
              border: `1px solid ${selected.has(ext) ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {ext}
          </button>
        ))}
      </div>
    </div>
  );
}
