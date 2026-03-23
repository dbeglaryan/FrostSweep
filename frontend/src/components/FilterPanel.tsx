import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { FilterParams } from '../types';

interface Props {
  filters: FilterParams;
  onChange: (f: FilterParams) => void;
}

export default function FilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const set = (key: keyof FilterParams, value: string) => {
    if (key === 'ext_whitelist' || key === 'ext_blacklist') {
      const list = value ? value.split(',').map(s => s.trim()).filter(Boolean) : null;
      onChange({ ...filters, [key]: list });
    } else if (key === 'min_size_mb' || key === 'max_size_mb') {
      onChange({ ...filters, [key]: value ? parseFloat(value) : null });
    } else {
      onChange({ ...filters, [key]: value || null });
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="btn-secondary flex items-center gap-1.5 text-xs">
        <SlidersHorizontal size={14} /> Filters {open ? '▴' : '▾'}
      </button>
      {open && (
        <div className="mt-2 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Min Size (MB)</label>
            <input type="number" value={filters.min_size_mb ?? ''} onChange={e => set('min_size_mb', e.target.value)}
              placeholder="0" className="input-sm w-full" style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Max Size (MB)</label>
            <input type="number" value={filters.max_size_mb ?? ''} onChange={e => set('max_size_mb', e.target.value)}
              placeholder="unlimited" className="input-sm w-full" style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Modified After</label>
            <input type="date" value={filters.after_date ?? ''} onChange={e => set('after_date', e.target.value)}
              className="input-sm w-full" style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Modified Before</label>
            <input type="date" value={filters.before_date ?? ''} onChange={e => set('before_date', e.target.value)}
              className="input-sm w-full" style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Extension Whitelist</label>
            <input value={(filters.ext_whitelist ?? []).join(', ')} onChange={e => set('ext_whitelist', e.target.value)}
              placeholder=".pdf, .jpg (blank = all)" className="input-sm w-full" style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Extension Blacklist</label>
            <input value={(filters.ext_blacklist ?? []).join(', ')} onChange={e => set('ext_blacklist', e.target.value)}
              placeholder=".tmp, .log" className="input-sm w-full" style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
        </div>
      )}
    </div>
  );
}
