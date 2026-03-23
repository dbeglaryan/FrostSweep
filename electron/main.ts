import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { startPython, stopPython } from './python';

let mainWindow: BrowserWindow | null = null;
let apiPort: number | null = null;

// Register IPC handlers once at module level (not per-window)
ipcMain.handle('dialog:openFolder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('dialog:openSave', async (_event, defaultName: string, fileTypes: { name: string; extensions: string[] }[]) => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: fileTypes,
  });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle('get-api-port', () => apiPort);


async function createWindow() {
  try {
    apiPort = await startPython();
  } catch (err) {
    dialog.showErrorBox(
      'FrostSweep — Backend Failed',
      `Could not start the Python backend.\n\n${err instanceof Error ? err.message : String(err)}\n\nMake sure Python 3.10+ is installed and the backend dependencies are available.`
    );
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'FrostSweep',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Inject API URL via a preload-compatible approach:
  // Set it as a query param on the URL, or inject before page scripts run
  const injectApiUrl = `window.__FROSTSWEEP_API_URL__ = 'http://127.0.0.1:${apiPort}'`;

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow?.webContents.executeJavaScript(injectApiUrl).catch(() => {});
  });

  const isDev = !app.isPackaged;
  try {
    if (isDev) {
      await mainWindow.loadURL('http://localhost:5173');
    } else {
      await mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
    }
  } catch (err) {
    const target = isDev ? 'Vite dev server at localhost:5173' : 'built frontend';
    dialog.showErrorBox(
      'FrostSweep — UI Failed',
      `Could not load the ${target}.\n\n${err instanceof Error ? err.message : String(err)}`
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopPython();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopPython();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
