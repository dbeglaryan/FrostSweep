interface Props {
  value: number; // 0-1
  label?: string;
}

export default function ProgressBar({ value, label }: Props) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Operation progress" className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'var(--accent)' }}
        />
      </div>
      <span className="text-xs font-mono w-[40px] text-right" style={{ color: 'var(--text-muted)' }}>
        {label || `${pct}%`}
      </span>
    </div>
  );
}
