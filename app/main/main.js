// // app/main/main.js

// const { app, BrowserWindow } = require('electron');
// const path = require('path');

// // IPC
// const registerFileIpc = require('./ipc/file.ipc');

// function createWindow() {

//   const win = new BrowserWindow({
//     width: 1000,
//     height: 700,

//     webPreferences: {
//       preload: path.join(__dirname, '../preload/preload.js'),
//       contextIsolation: true,
//       nodeIntegration: false
//     }
//   });

//   // Development Mode
//   if (process.env.VITE_DEV_SERVER_URL) {

//     win.loadURL(process.env.VITE_DEV_SERVER_URL);

//     // Optional:
//     win.webContents.openDevTools();

//   } 
  
//   // Production Mode
//   else {

//     win.loadFile(
//       path.join(__dirname, '../../dist/index.html')
//     );

//   }
// }

// app.whenReady().then(() => {

//   registerFileIpc();

//   createWindow();

// });

// app.on('window-all-closed', () => {

//   if (process.platform !== 'darwin') {
//     app.quit();
//   }

// });

// app.on('activate', () => {

//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }

// });

// // app/main/main.js
// import '../renderer/styles/themes.css'



/// latest v1
// const { app, BrowserWindow } = require('electron');
// const path = require('path');
// //ipc
// const registerFileIpc = require('./ipc/file.ipc');
// // 
// // 
// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1000,
//     height: 700,
//     webPreferences: {
//       preload: path.join(__dirname, '../preload/preload.js'),
//       contextIsolation: true,
//       nodeIntegration: false
//     }
//   });
// // 
//   if (process.env.VITE_DEV_SERVER_URL) {
//     win.loadURL(process.env.VITE_DEV_SERVER_URL);
//   } else {
//     win.loadFile(path.join(__dirname, '../../build/renderer/index.html'));
//   }
// }
// // 
// // app.whenReady().then(createWindow);
// //changes after making ippc
// app.whenReady().then(() => {
//     registerFileIpc();
//     createWindow();
//   });

// ---------------------

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