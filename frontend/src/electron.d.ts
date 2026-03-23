interface ElectronAPI {
  openFolderDialog: () => Promise<string | null>;
  openSaveDialog: (defaultName: string, fileTypes: { name: string; extensions: string[] }[]) => Promise<string | null>;
  getApiPort: () => Promise<number>;
  getPlatform: () => string;
}

interface Window {
  electronAPI?: ElectronAPI;
  __FROSTSWEEP_API_URL__?: string;
}
