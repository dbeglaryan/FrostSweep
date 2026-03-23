import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as net from 'net';
import { app } from 'electron';

let pythonProcess: ChildProcess | null = null;
let apiPort = 19542;

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        const port = addr.port;
        server.close(() => resolve(port));
      } else {
        reject(new Error('Could not find free port'));
      }
    });
    server.on('error', reject);
  });
}

function getPythonPath(): string {
  if (app.isPackaged) {
    const ext = process.platform === 'win32' ? '.exe' : '';
    return path.join(process.resourcesPath, 'backend', `frostsweep-backend${ext}`);
  }
  return 'python';
}

function getBackendArgs(): string[] {
  const args = ['--port', String(apiPort)];
  if (!app.isPackaged) {
    args.unshift(path.join(__dirname, '..', 'backend', 'main.py'));
  }
  return args;
}

export async function startPython(): Promise<number> {
  // Guard against double-start
  if (pythonProcess) {
    return apiPort;
  }

  apiPort = await findFreePort();
  const pythonPath = getPythonPath();
  const args = getBackendArgs();

  console.log(`Starting Python backend: ${pythonPath} ${args.join(' ')}`);

  pythonProcess = spawn(pythonPath, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  pythonProcess.stdout?.on('data', (data: Buffer) => {
    console.log(`[backend] ${data.toString().trim()}`);
  });

  pythonProcess.stderr?.on('data', (data: Buffer) => {
    console.error(`[backend] ${data.toString().trim()}`);
  });

  pythonProcess.on('exit', (code) => {
    console.log(`Python backend exited with code ${code}`);
    pythonProcess = null;
  });

  await waitForHealth(apiPort, 30000);
  return apiPort;
}

export function stopPython() {
  const proc = pythonProcess;
  if (!proc) return;

  console.log('Stopping Python backend...');
  pythonProcess = null;

  if (process.platform === 'win32') {
    // On Windows, kill() always terminates immediately
    proc.kill();
  } else {
    // On Unix, try graceful SIGTERM first, then force SIGKILL after timeout
    proc.kill('SIGTERM');
    setTimeout(() => {
      try {
        // Check if process is still alive (kill(0) throws if dead)
        process.kill(proc.pid!, 0);
        proc.kill('SIGKILL');
      } catch {
        // Process already exited — nothing to do
      }
    }, 3000);
  }
}

export function getApiPort(): number {
  return apiPort;
}

async function waitForHealth(port: number, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (res.ok) return;
    } catch {
      // Backend not ready yet
    }
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error(`Backend did not start within ${timeoutMs}ms`);
}
