import { Search, Eye, Play, Undo2, Copy } from 'lucide-react';

interface Props {
  onScan: () => void;
  onPreview: () => void;
  onOrganize: () => void;
  onUndo: () => void;
  onDetectDuplicates: () => void;
  canUndo: boolean;
  recursive: boolean;
  onRecursiveChange: (v: boolean) => void;
  dryRun: boolean;
  onDryRunChange: (v: boolean) => void;
  dupStrategy: string;
  onDupStrategyChange: (v: string) => void;
  loading: boolean;
}

export default function ActionBar(props: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={props.onScan} disabled={props.loading} className="btn-primary flex items-center gap-1.5">
        <Search size={15} /> Scan
      </button>
      <button onClick={props.onPreview} disabled={props.loading} className="btn-secondary flex items-center gap-1.5">
        <Eye size={15} /> Preview
      </button>
      <button onClick={props.onOrganize} disabled={props.loading} className="btn-success flex items-center gap-1.5">
        <Play size={15} /> Organize
      </button>
      <button onClick={props.onUndo} disabled={!props.canUndo || props.loading} className="btn-warning flex items-center gap-1.5">
        <Undo2 size={15} /> Undo
      </button>
      <button onClick={props.onDetectDuplicates} disabled={props.loading} className="btn-danger flex items-center gap-1.5">
        <Copy size={15} /> Duplicates
      </button>

      <div className="border-l h-6 mx-1" style={{ borderColor: 'var(--border)' }} />

      <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
        <input type="checkbox" checked={props.recursive} onChange={e => props.onRecursiveChange(e.target.checked)} className="accent-sky-500" />
        Subdirectories
      </label>
      <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
        <input type="checkbox" checked={props.dryRun} onChange={e => props.onDryRunChange(e.target.checked)} className="accent-sky-500" />
        Dry Run
      </label>

      <select
        value={props.dupStrategy}
        onChange={e => props.onDupStrategyChange(e.target.value)}
        className="px-2 py-1.5 rounded text-xs"
        style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }}
      >
        <option value="Rename">Rename Duplicates</option>
        <option value="Skip duplicates">Skip Duplicates</option>
        <option value="Keep all">Keep All</option>
      </select>
    </div>
  );
}
