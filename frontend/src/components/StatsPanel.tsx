import type { ScanStats } from '../types';
import { FileText, HardDrive, BarChart3, FileUp } from 'lucide-react';

interface Props {
  stats: ScanStats | null;
}

export default function StatsPanel({ stats }: Props) {
  if (!stats) return null;

  const breakdown = Object.entries(stats.breakdown)
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Scan Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <StatCard icon={<FileText size={16} />} label="Total Files" value={String(stats.total_files)} />
        <StatCard icon={<HardDrive size={16} />} label="Total Size" value={`${stats.total_size_mb} MB`} />
        <StatCard icon={<BarChart3 size={16} />} label="Categories" value={String(breakdown.length)} />
        <StatCard icon={<FileUp size={16} />} label="Largest" value={stats.top_5_largest[0]?.name || 'N/A'} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {breakdown.map(([cat, data]) => (
          <div key={cat} className="rounded-lg px-3 py-2" style={{ background: 'var(--bg-input)' }}>
            <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>{cat.replace(/_/g, ' ')}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {data.count} files &middot; {data.size_mb} MB
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg px-3 py-2.5 flex items-center gap-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ color: 'var(--accent)' }}>{icon}</div>
      <div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="text-sm font-semibold truncate max-w-[120px]" style={{ color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  );
}
