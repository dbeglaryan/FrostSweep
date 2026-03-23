import { Plus, Trash2, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import type { CategoryData } from '../types';

interface Props {
  categories: CategoryData[];
  onUpdate: (cats: CategoryData[]) => void;
  onSave: () => void;
}

export default function CategoryManager({ categories, onUpdate, onSave }: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newExts, setNewExts] = useState('');
  const [newDest, setNewDest] = useState('');

  const updateField = (i: number, field: keyof CategoryData, value: string | string[]) => {
    const updated = [...categories];
    updated[i] = { ...updated[i], [field]: value };
    onUpdate(updated);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const key = newName.trim().toLowerCase().replace(/ /g, '_');
    const exts = newExts.split(',').map(e => e.trim()).filter(Boolean);
    onUpdate([...categories, { name: key, extensions: exts, destination: newDest || '' }]);
    setNewName(''); setNewExts(''); setNewDest(''); setAdding(false);
  };

  const handleDelete = (i: number) => {
    if (categories[i].name === 'other_files') return;
    onUpdate(categories.filter((_, idx) => idx !== i));
  };

  const browseDest = async (i: number) => {
    if ((window as any).electronAPI?.openFolderDialog) {
      const result = await (window as any).electronAPI.openFolderDialog();
      if (result) updateField(i, 'destination', result);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Categories & Destinations</h3>
        <button onClick={() => setAdding(!adding)} className="btn-accent flex items-center gap-1 text-xs">
          <Plus size={14} /> Add
        </button>
        <button onClick={onSave} className="btn-secondary text-xs">Save Settings</button>
      </div>

      {adding && (
        <div className="rounded-lg p-3 mb-3 flex items-end gap-2 flex-wrap" style={{ background: 'var(--bg-input)' }}>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. 3D Models"
              className="input-sm" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Extensions</label>
            <input value={newExts} onChange={e => setNewExts(e.target.value)} placeholder=".obj, .fbx"
              className="input-sm" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Destination</label>
            <input value={newDest} onChange={e => setNewDest(e.target.value)} placeholder="~/Downloads/Models"
              className="input-sm" style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }} />
          </div>
          <button onClick={handleAdd} className="btn-success text-xs">Add</button>
          <button onClick={() => setAdding(false)} className="btn-secondary text-xs">Cancel</button>
        </div>
      )}

      <div className="space-y-1.5">
        {categories.map((cat, i) => (
          <div key={cat.name} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--bg-input)' }}>
            <span className="text-sm font-medium w-[120px] truncate" style={{ color: 'var(--text)' }}>
              {cat.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            <input
              value={cat.extensions.join(', ')}
              onChange={e => updateField(i, 'extensions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="flex-1 px-2 py-1 rounded text-xs font-mono"
              style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
            <input
              value={cat.destination}
              onChange={e => updateField(i, 'destination', e.target.value)}
              className="flex-1 px-2 py-1 rounded text-xs"
              style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
            <button onClick={() => browseDest(i)} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
              <FolderOpen size={14} />
            </button>
            <button
              onClick={() => handleDelete(i)}
              disabled={cat.name === 'other_files'}
              className="p-1 rounded hover:opacity-70 disabled:opacity-30"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
