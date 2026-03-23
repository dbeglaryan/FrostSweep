import { FolderOpen, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Props {
  folder: string;
  recentFolders: string[];
  onFolderChange: (f: string) => void;
}

export default function SourcePicker({ folder, recentFolders, onFolderChange }: Props) {
  const [showRecent, setShowRecent] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!showRecent) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRecent(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowRecent(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showRecent]);

  const browseFolder = async () => {
    if (window.electronAPI?.openFolderDialog) {
      const result = await window.electronAPI.openFolderDialog();
      if (result) onFolderChange(result);
    } else {
      const input = prompt('Enter folder path:');
      if (input) onFolderChange(input);
    }
  };

  const inputId = 'source-folder-input';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label htmlFor={inputId} className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
        Source Folder
      </label>
      <input
        id={inputId}
        type="text"
        value={folder}
        onChange={e => onFolderChange(e.target.value)}
        placeholder="Select a folder to organize..."
        className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }}
      />
      <button onClick={browseFolder} aria-label="Browse for folder" className="btn-primary flex items-center gap-1.5">
        <FolderOpen size={16} /> Browse
      </button>
      {recentFolders.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowRecent(!showRecent)}
            aria-label="Show recent folders"
            aria-expanded={showRecent}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Clock size={16} /> Recent
          </button>
          {showRecent && (
            <div
              role="listbox"
              className="absolute top-full mt-1 right-0 z-50 rounded-lg shadow-xl py-1 min-w-[300px] max-w-[500px]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {recentFolders.map((f, i) => (
                <button
                  key={i}
                  role="option"
                  aria-selected={f === folder}
                  onClick={() => { onFolderChange(f); setShowRecent(false); }}
                  className="block w-full text-left px-3 py-2 text-sm truncate hover:opacity-80"
                  style={{ color: 'var(--text)' }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
