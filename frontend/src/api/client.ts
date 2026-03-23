import type {
  ScanResult, PreviewItem, OrganizeResult, UndoResult,
  DuplicateReport, ConfigResponse, FilterParams,
} from '../types';

const BASE = window.__FROSTSWEEP_API_URL__ || 'http://127.0.0.1:19542';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }
  return res.json();
}

export async function getHealth() {
  return request<{ status: string }>('/api/health');
}

export async function getConfig() {
  return request<ConfigResponse>('/api/config');
}

export async function updateConfig(categories: { name: string; extensions: string[]; destination: string }[]) {
  return request<ConfigResponse>('/api/config', {
    method: 'PUT',
    body: JSON.stringify({ categories }),
  });
}

export async function getRecentFolders() {
  return request<{ folders: string[] }>('/api/recent-folders');
}

export async function scanFolder(folder: string, recursive: boolean) {
  return request<ScanResult>('/api/scan', {
    method: 'POST',
    body: JSON.stringify({ folder, recursive }),
  });
}

export async function previewOrganize(
  folder: string, recursive: boolean, filters: FilterParams, dup_strategy: string
) {
  return request<{ preview: PreviewItem[]; total: number }>('/api/preview', {
    method: 'POST',
    body: JSON.stringify({ folder, recursive, filters, dup_strategy }),
  });
}

export async function organizeFiles(
  folder: string, recursive: boolean, filters: FilterParams,
  dup_strategy: string, dry_run: boolean
) {
  return request<OrganizeResult>('/api/organize', {
    method: 'POST',
    body: JSON.stringify({ folder, recursive, filters, dup_strategy, dry_run }),
  });
}

export async function undoOrganize() {
  return request<UndoResult>('/api/undo', { method: 'POST' });
}

export async function detectDuplicates(folder: string, recursive: boolean) {
  return request<DuplicateReport>('/api/duplicates', {
    method: 'POST',
    body: JSON.stringify({ folder, recursive }),
  });
}

export async function addCategory(name: string, extensions: string[], destination?: string) {
  return request<ConfigResponse>('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name, extensions, destination }),
  });
}

export async function deleteCategory(name: string) {
  return request<ConfigResponse>(`/api/categories/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
}

export async function exportLog(save_path: string) {
  return request<{ saved: string }>('/api/export-log', {
    method: 'POST',
    body: JSON.stringify({ save_path }),
  });
}
