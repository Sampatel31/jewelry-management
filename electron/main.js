const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');

// Windows: set AppUserModelId for taskbar grouping
if (process.platform === 'win32') {
  app.setAppUserModelId('com.jewelrymanager.app');
}

const isDev = process.env.ELECTRON_ENV === 'development' || !app.isPackaged;

let mainWindow = null;
let splashWindow = null;
let tray = null;
let backendProcess = null;
let frontendProcess = null;

const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

// ─── Health Check ────────────────────────────────────────────────────────────
function waitForServer(url, maxAttempts = 30, intervalMs = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode < 500) resolve();
        else retry();
      }).on('error', retry);
    };
    const retry = () => {
      attempts++;
      if (attempts >= maxAttempts) {
        reject(new Error(`Server at ${url} did not start in time`));
      } else {
        setTimeout(check, intervalMs);
      }
    };
    check();
  });
}

// ─── Splash Screen ───────────────────────────────────────────────────────────
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: { contextIsolation: true },
  });
  // Load an inline splash HTML
  splashWindow.loadURL(`data:text/html,
    <html><body style="background:#1a1a2e;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#f0c040;">
      <div style="font-size:48px;margin-bottom:12px;">💎</div>
      <div style="font-size:22px;font-weight:bold;">Jewelry Manager</div>
      <div style="font-size:13px;margin-top:16px;color:#aaa;">Starting services…</div>
    </body></html>`);
}

// ─── Main Window ─────────────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    title: 'Jewelry Manager',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(FRONTEND_URL);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── System Tray ─────────────────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, 'build', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath).isEmpty()
    ? nativeImage.createEmpty()
    : nativeImage.createFromPath(iconPath);

  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Jewelry Manager');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Jewelry Manager',
      click: () => {
        if (mainWindow) mainWindow.show();
        else createMainWindow();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) mainWindow.show();
  });
}

// ─── Child Processes ─────────────────────────────────────────────────────────
function startBackend() {
  const backendDir = isDev
    ? path.join(__dirname, '..', 'backend')
    : path.join(process.resourcesPath, 'backend');

  backendProcess = spawn(
    process.execPath,
    [isDev ? 'dist/index.js' : 'index.js'],
    {
      cwd: backendDir,
      env: { ...process.env, NODE_ENV: isDev ? 'development' : 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  backendProcess.stdout.on('data', (d) => console.log('[backend]', d.toString().trim()));
  backendProcess.stderr.on('data', (d) => console.error('[backend err]', d.toString().trim()));
  backendProcess.on('exit', (code) => console.log(`[backend] exited with code ${code}`));
}

function startFrontend() {
  if (isDev) return; // In dev, Next.js dev server is expected to already be running

  const frontendDir = path.join(process.resourcesPath, 'frontend');
  frontendProcess = spawn(
    process.execPath,
    ['node_modules/.bin/next', 'start', '-p', String(FRONTEND_PORT)],
    {
      cwd: frontendDir,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  frontendProcess.stdout.on('data', (d) => console.log('[frontend]', d.toString().trim()));
  frontendProcess.stderr.on('data', (d) => console.error('[frontend err]', d.toString().trim()));
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  createSplashWindow();
  createTray();

  if (!isDev) {
    startBackend();
    startFrontend();
  }

  try {
    await waitForServer(`${BACKEND_URL}/health`);
    await waitForServer(FRONTEND_URL);
  } catch (err) {
    console.error('Service startup failed:', err.message);
  }

  createMainWindow();
});

// macOS: re-create window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Clean up child processes on quit
app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
});

// IPC: fullscreen toggle
ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});
