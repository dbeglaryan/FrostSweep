import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
      style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}
