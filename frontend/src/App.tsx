import { useState, useEffect, useCallback } from 'react';
import { Snowflake, FolderKanban, Copy, Settings } from 'lucide-react';
import type { ScanStats, FilterParams, ActivityEntry, CategoryData, DuplicateReport as DupReportType } from './types';
import * as api from './api/client';
import ThemeToggle from './components/ThemeToggle';
import SourcePicker from './components/SourcePicker';
import FileTypeGrid from './components/FileTypeGrid';
import CategoryManager from './components/CategoryManager';
import FilterPanel from './components/FilterPanel';
import ActionBar from './components/ActionBar';
import ProgressBar from './components/ProgressBar';
import ActivityLog from './components/ActivityLog';
import StatsPanel from './components/StatsPanel';
import DuplicateReport from './components/DuplicateReport';
import ErrorBoundary from './components/ErrorBoundary';

type Tab = 'organize' | 'duplicates' | 'settings';

let logId = 0;

export default function App() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState<Tab>('organize');
  const [folder, setFolder] = useState('');
  const [recentFolders, setRecentFolders] = useState<string[]>([]);
  const [extensions, setExtensions] = useState<string[]>([]);
  const [selectedExts, setSelectedExts] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [filters, setFilters] = useState<FilterParams>({});
  const [recursive, setRecursive] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [dupStrategy, setDupStrategy] = useState('Rename');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [log, setLog] = useState<ActivityEntry[]>([]);
  const [dupReport, setDupReport] = useState<DupReportType | null>(null);
  const [confirmOrganize, setConfirmOrganize] = useState(false);

  const addLog = useCallback((message: string, level: ActivityEntry['level'] = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLog(prev => [...prev, { id: ++logId, time, message, level }]);
  }, []);

  // Build effective filters by merging selectedExts into ext_whitelist
  const getEffectiveFilters = useCallback((): FilterParams => {
    const f = { ...filters };
    if (selectedExts.size > 0 && selectedExts.size < extensions.length) {
      f.ext_whitelist = Array.from(selectedExts);
    }
    return f;
  }, [filters, selectedExts, extensions.length]);

  // Load config on mount
  useEffect(() => {
    (async () => {
      try {
        const cfg = await api.getConfig();
        const cats = cfg.categories.map(name => ({
          name,
          extensions: (cfg.config[name] as string[]) || [],
          destination: (cfg.config[`${name}_location`] as string) || '',
        }));
        setCategories(cats);
        const recent = await api.getRecentFolders();
        setRecentFolders(recent.folders);
      } catch (e: any) {
        addLog(`Failed to connect to backend: ${e.message}`, 'danger');
      }
    })();
  }, [addLog]);

  useEffect(() => {
    document.documentElement.className = dark ? '' : 'light';
  }, [dark]);

  const handleScan = async () => {
    if (!folder) { addLog('Select a folder first', 'warning'); return; }
    setLoading(true);
    setProgress(0.1);
    try {
      addLog(`Scanning ${folder}...`);
      const result = await api.scanFolder(folder, recursive);
      setExtensions(result.extensions);
      setSelectedExts(new Set(result.extensions));
      setStats(result.stats);
      setProgress(1);
      addLog(`Found ${result.stats.total_files} files, ${result.extensions.length} extensions`, 'success');
      const recent = await api.getRecentFolders();
      setRecentFolders(recent.folders);
    } catch (e: any) {
      addLog(e.message, 'danger');
    }
    setLoading(false);
  };

  const handlePreview = async () => {
    if (!folder) { addLog('Select a folder first', 'warning'); return; }
    setLoading(true);
    setProgress(0.1);
    try {
      const effectiveFilters = getEffectiveFilters();
      const result = await api.previewOrganize(folder, recursive, effectiveFilters, dupStrategy);
      setProgress(1);
      addLog(`Preview: ${result.total} files would be organized`, 'info');
      result.preview.forEach(p => {
        addLog(`  ${p.current_path} -> ${p.destination_path} [${p.category}]${p.duplicate ? ' (DUP)' : ''}`, 'info');
      });
    } catch (e: any) {
      addLog(e.message, 'danger');
    }
    setLoading(false);
  };

  const handleOrganize = async () => {
    if (!folder) { addLog('Select a folder first', 'warning'); return; }
    // Require confirmation for non-dry-run operations
    if (!dryRun && !confirmOrganize) {
      setConfirmOrganize(true);
      return;
    }
    setConfirmOrganize(false);
    setLoading(true);
    setProgress(0.1);
    try {
      const effectiveFilters = getEffectiveFilters();
      addLog(dryRun ? 'Starting dry run...' : 'Organizing files...', 'info');
      setProgress(0.3);
      const result = await api.organizeFiles(folder, recursive, effectiveFilters, dupStrategy, dryRun);
      setProgress(1);
      if (result.dry_run) {
        addLog(`Dry run complete: ${result.total_processed} files analyzed`, 'info');
        result.log_data.forEach(e => addLog(`  [DRY RUN] ${e.original_path} -> ${e.new_path}`, 'info'));
      } else {
        addLog(`Organized ${result.total_moved} files`, 'success');
        if (result.errors.length > 0) {
          result.errors.forEach(e => addLog(`  Error: ${e.file}: ${e.error}`, 'danger'));
        }
        setCanUndo(result.total_moved > 0);
      }
    } catch (e: any) {
      addLog(e.message, 'danger');
    }
    setLoading(false);
  };

  const handleUndo = async () => {
    setLoading(true);
    try {
      addLog('Undoing last organization...', 'info');
      const result = await api.undoOrganize();
      addLog(`Undo: ${result.success} restored, ${result.failed} failed`, result.failed > 0 ? 'warning' : 'success');
      result.errors.forEach(e => addLog(`  ${e}`, 'warning'));
      setCanUndo(false);
    } catch (e: any) {
      addLog(e.message, 'danger');
    }
    setLoading(false);
  };

  const handleDetectDuplicates = async () => {
    if (!folder) { addLog('Select a folder first', 'warning'); return; }
    setLoading(true);
    setProgress(0.1);
    try {
      addLog('Scanning for duplicates...', 'info');
      const result = await api.detectDuplicates(folder, recursive);
      setProgress(1);
      setDupReport(result);
      addLog(`Found ${result.summary.name_dupe_groups} name groups, ${result.summary.content_dupe_groups} content groups`, 'success');
      setTab('duplicates');
    } catch (e: any) {
      addLog(e.message, 'danger');
    }
    setLoading(false);
  };

  const handleExportLog = async () => {
    let savePath: string | null = null;
    if (window.electronAPI?.openSaveDialog) {
      savePath = await window.electronAPI.openSaveDialog('frostsweep_log.csv', [
        { name: 'CSV', extensions: ['csv'] },
      ]);
    } else {
      savePath = prompt('Enter save path for log export:', 'frostsweep_log.csv');
    }
    if (!savePath) return;
    try {
      const result = await api.exportLog(savePath);
      addLog(`Log exported to ${result.saved}`, 'success');
    } catch (e: any) {
      addLog(`Export failed: ${e.message}`, 'danger');
    }
  };

  const handleSaveConfig = async () => {
    try {
      const result = await api.updateConfig(categories);
      const cats = result.categories.map(name => ({
        name,
        extensions: (result.config[name] as string[]) || [],
        destination: (result.config[`${name}_location`] as string) || '',
      }));
      setCategories(cats);
      addLog('Settings saved', 'success');
    } catch (e: any) {
      addLog(e.message, 'danger');
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'organize', label: 'Organize', icon: <FolderKanban size={18} /> },
    { id: 'duplicates', label: 'Duplicates', icon: <Copy size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[200px] flex-shrink-0 flex flex-col py-4 px-3" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-2 mb-6">
            <Snowflake size={24} style={{ color: 'var(--accent)' }} />
            <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>FrostSweep</span>
          </div>
          <nav aria-label="Main navigation" className="flex flex-col gap-1 flex-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                style={{
                  background: tab === t.id ? 'var(--accent)' : 'transparent',
                  color: tab === t.id ? '#fff' : 'var(--text-muted)',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-4">
            <ThemeToggle dark={dark} onToggle={() => setDark(!dark)} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Source picker — always visible */}
          <SourcePicker folder={folder} recentFolders={recentFolders} onFolderChange={setFolder} />

          {/* Confirmation dialog for organize */}
          {confirmOrganize && (
            <div className="rounded-lg p-4 flex items-center gap-4" style={{ background: 'var(--bg-card)', border: '2px solid var(--warning)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                This will move files from <strong>{folder}</strong>. This action can be undone. Continue?
              </span>
              <button onClick={handleOrganize} className="btn-success text-sm">Yes, Organize</button>
              <button onClick={() => setConfirmOrganize(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          )}

          {tab === 'organize' && (
            <>
              <ActionBar
                onScan={handleScan} onPreview={handlePreview} onOrganize={handleOrganize}
                onUndo={handleUndo} onDetectDuplicates={handleDetectDuplicates}
                canUndo={canUndo} recursive={recursive} onRecursiveChange={setRecursive}
                dryRun={dryRun} onDryRunChange={setDryRun}
                dupStrategy={dupStrategy} onDupStrategyChange={setDupStrategy}
                loading={loading}
              />
              <FilterPanel filters={filters} onChange={setFilters} />
              {loading && <ProgressBar value={progress} />}
              {stats && <StatsPanel stats={stats} />}
              <FileTypeGrid
                extensions={extensions}
                selected={selectedExts}
                onToggle={ext => {
                  const next = new Set(selectedExts);
                  next.has(ext) ? next.delete(ext) : next.add(ext);
                  setSelectedExts(next);
                }}
                onSelectAll={() => setSelectedExts(new Set(extensions))}
                onDeselectAll={() => setSelectedExts(new Set())}
              />
              <CategoryManager categories={categories} onUpdate={setCategories} onSave={handleSaveConfig} />
              <ActivityLog entries={log} onClear={() => setLog([])} onExport={handleExportLog} />
            </>
          )}

          {tab === 'duplicates' && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={handleDetectDuplicates} disabled={loading} className="btn-danger flex items-center gap-1.5">
                  <Copy size={15} /> Scan for Duplicates
                </button>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                  <input type="checkbox" checked={recursive} onChange={e => setRecursive(e.target.checked)} className="accent-sky-500" />
                  Include Subdirectories
                </label>
                {loading && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Scanning...</span>}
              </div>
              <DuplicateReport report={dupReport} />
              <ActivityLog entries={log} onClear={() => setLog([])} />
            </>
          )}

          {tab === 'settings' && (
            <>
              <CategoryManager categories={categories} onUpdate={setCategories} onSave={handleSaveConfig} />
              <ActivityLog entries={log} onClear={() => setLog([])} />
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
