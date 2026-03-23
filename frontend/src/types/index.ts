export interface FilterParams {
  min_size_mb?: number | null;
  max_size_mb?: number | null;
  after_date?: string | null;
  before_date?: string | null;
  ext_whitelist?: string[] | null;
  ext_blacklist?: string[] | null;
}

export interface ScanResult {
  extensions: string[];
  stats: ScanStats;
}

export interface ScanStats {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: number;
  breakdown: Record<string, { count: number; size: number; size_mb: number }>;
  top_5_largest: { name: string; size_mb: number }[];
}

export interface PreviewItem {
  current_path: string;
  destination_path: string;
  category: string;
  duplicate: boolean;
}

export interface OrganizeResult {
  dry_run: boolean;
  total_processed: number;
  total_moved: number;
  total_size_bytes: number;
  log_data: LogEntry[];
  moves: [string, string][];
  errors: { file: string; error: string }[];
}

export interface LogEntry {
  time: string;
  original_path: string;
  new_path: string;
  category: string;
  dry_run: boolean;
}

export interface UndoResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface DuplicateReport {
  name_duplicates: Record<string, string[]>;
  content_duplicates: Record<string, string[]>;
  summary: {
    name_dupe_files: number;
    name_dupe_groups: number;
    content_dupe_files: number;
    content_dupe_groups: number;
  };
}

export interface ConfigResponse {
  config: Record<string, unknown>;
  categories: string[];
}

export interface CategoryData {
  name: string;
  extensions: string[];
  destination: string;
}

export type LogLevel = 'info' | 'success' | 'warning' | 'danger';

export interface ActivityEntry {
  id: number;
  time: string;
  message: string;
  level: LogLevel;
}
