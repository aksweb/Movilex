// app/main/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

//ipc
const registerFileIpc = require('./ipc/file.ipc');


function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../../build/renderer/index.html'));
  }
}

// app.whenReady().then(createWindow);
//changes after making ippc
app.whenReady().then(() => {
    registerFileIpc();
    createWindow();
  });