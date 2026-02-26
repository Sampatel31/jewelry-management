const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const fs = require('fs');

const APP_NAME = 'Shrigar Jewellers';
const APP_ID = 'com.shrigarjewellers.management';
const BACKUP_DIR = path.join(os.homedir(), 'ShrigarJewellers', 'backups');

// Windows: set AppUserModelId for taskbar grouping
if (process.platform === 'win32') {
  app.setAppUserModelId(APP_ID);
}

const isDev = process.env.ELECTRON_ENV === 'development' || !app.isPackaged;

let mainWindow = null;
let splashWindow = null;
let tray = null;
let backendProcess = null;
let frontendProcess = null;
let pgProcess = null;
let autoBackupTimer = null;

const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const PG_PORT = process.env.PG_PORT || 5433;
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
    width: 480,
    height: 320,
    frame: false,
    resizable: false,
    transparent: false,
    alwaysOnTop: true,
    webPreferences: { contextIsolation: true },
  });
  const splashPath = path.join(__dirname, 'splash.html');
  if (fs.existsSync(splashPath)) {
    splashWindow.loadFile(splashPath);
  } else {
    splashWindow.loadURL(`data:text/html,
      <html><body style="background:#6B0F1A;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:Georgia,serif;color:#D4AF37;">
        <div style="font-size:48px;margin-bottom:12px;">💎</div>
        <div style="font-size:28px;font-weight:bold;">${APP_NAME}</div>
        <div style="font-size:14px;margin-top:8px;color:#e8d5a3;">Management System</div>
        <div style="margin-top:24px;font-size:12px;color:#c9a96e;">Starting services…</div>
      </body></html>`);
  }
}

// ─── Main Window ─────────────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    title: APP_NAME,
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

  // Build application menu
  const menuTemplate = [
    {
      label: APP_NAME,
      submenu: [
        {
          label: `About ${APP_NAME}`,
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: `About ${APP_NAME}`,
              message: APP_NAME,
              detail: `Management System\nVersion ${app.getVersion()}\n\n© 2024 Shrigar Jewellers. All rights reserved.`,
            });
          },
        },
        { type: 'separator' },
        { label: 'Open Backups Folder', click: () => shell.openPath(BACKUP_DIR) },
        { type: 'separator' },
        { role: 'quit', label: 'Quit' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

// ─── System Tray ─────────────────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const icon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();

  tray = new Tray(icon.isEmpty() ? icon : icon.resize({ width: 16, height: 16 }));
  tray.setToolTip(APP_NAME);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Open ${APP_NAME}`,
      click: () => {
        if (mainWindow) mainWindow.show();
        else createMainWindow();
      },
    },
    { type: 'separator' },
    { label: 'Create Backup Now', click: () => runAutoBackup() },
    { label: 'Open Backups Folder', click: () => shell.openPath(BACKUP_DIR) },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) mainWindow.show();
  });
}

// ─── Auto-Backup ─────────────────────────────────────────────────────────────
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function runAutoBackup() {
  ensureBackupDir();
  const date = new Date().toISOString().split('T')[0];
  const outFile = path.join(BACKUP_DIR, `backup-${date}.sql`);
  const dbUrl = process.env.DATABASE_URL;
  const args = dbUrl
    ? ['--dbname', dbUrl, '-f', outFile]
    : [
        '-h', process.env.DB_HOST || 'localhost',
        '-p', String(PG_PORT),
        '-U', process.env.DB_USER || 'jewelry_user',
        '-d', process.env.DB_NAME || 'jewelry_db',
        '-f', outFile,
      ];
  const env = { ...process.env };
  if (process.env.DB_PASSWORD) env.PGPASSWORD = process.env.DB_PASSWORD;
  const pgDump = spawn('pg_dump', args, { env });
  pgDump.on('close', (code) => {
    if (code === 0) {
      // Prune backups older than 30 days
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      fs.readdirSync(BACKUP_DIR)
        .filter((f) => f.startsWith('backup-') && f.endsWith('.sql'))
        .forEach((f) => {
          const fp = path.join(BACKUP_DIR, f);
          if (fs.statSync(fp).mtimeMs < cutoff) fs.unlinkSync(fp);
        });
    }
  });
}

function scheduleAutoBackup() {
  // Schedule backup daily at 11 PM
  const scheduleNext = () => {
    const now = new Date();
    const next = new Date();
    next.setHours(23, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const delay = next.getTime() - now.getTime();
    autoBackupTimer = setTimeout(() => {
      runAutoBackup();
      scheduleNext();
    }, delay);
  };
  scheduleNext();
}

// ─── Child Processes ─────────────────────────────────────────────────────────
function startBackend() {
  const backendDir = isDev
    ? path.join(__dirname, '..', 'backend')
    : path.join(process.resourcesPath, 'backend');

  const backendScript = isDev ? 'dist/index.js' : path.join('dist', 'index.js');

  backendProcess = spawn(
    process.execPath,
    [backendScript],
    {
      cwd: backendDir,
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        PORT: String(BACKEND_PORT),
        APP_NAME: APP_NAME,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  backendProcess.stdout.on('data', (d) => process.stdout.write(`[backend] ${d}`));
  backendProcess.stderr.on('data', (d) => process.stderr.write(`[backend err] ${d}`));
  backendProcess.on('exit', (code) => process.stdout.write(`[backend] exited with code ${code}\n`));
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

  frontendProcess.stdout.on('data', (d) => process.stdout.write(`[frontend] ${d}`));
  frontendProcess.stderr.on('data', (d) => process.stderr.write(`[frontend err] ${d}`));
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  createSplashWindow();

  // Show splash for at least 3 seconds
  const splashStart = Date.now();

  createTray();

  if (!isDev) {
    startBackend();
    startFrontend();
  }

  try {
    await waitForServer(`${BACKEND_URL}/health`);
    await waitForServer(FRONTEND_URL);
  } catch (err) {
    process.stderr.write(`Service startup failed: ${err.message}\n`);
  }

  // Ensure splash shows for at least 3 seconds
  const elapsed = Date.now() - splashStart;
  if (elapsed < 3000) {
    await new Promise((r) => setTimeout(r, 3000 - elapsed));
  }

  createMainWindow();
  scheduleAutoBackup();
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
  if (autoBackupTimer) clearTimeout(autoBackupTimer);
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
  if (pgProcess) pgProcess.kill();
});

// IPC: fullscreen toggle
ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

// IPC: run backup on demand
ipcMain.on('run-backup', () => {
  runAutoBackup();
});
