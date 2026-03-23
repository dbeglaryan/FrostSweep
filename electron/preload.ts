import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  openSaveDialog: (defaultName: string, fileTypes: { name: string; extensions: string[] }[]) =>
    ipcRenderer.invoke('dialog:openSave', defaultName, fileTypes),
  getApiPort: () => ipcRenderer.invoke('get-api-port'),
  getPlatform: () => process.platform,
});
