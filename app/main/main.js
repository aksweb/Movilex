const { app, BrowserWindow } = require('electron');
const path = require('path');
const registerFileIpc = require('./ipc/file.ipc');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    show: true, // 🔥 simplest and safest       
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  win.webContents.openDevTools();

  win.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('LOAD FAILED:', code, desc);
  });
}

app.whenReady().then(() => {
  registerFileIpc();
  createWindow();
});