// app/preload/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // ---------- SOURCE ----------
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  scanDirectory: (data) => ipcRenderer.invoke('scan-directory', data),
  getFiles: () => ipcRenderer.invoke('get-files'),

  // ---------- DEST ----------
  selectDestinationFolder: () => ipcRenderer.invoke('select-dest-folder'),
  listDirectory: (path) => ipcRenderer.invoke('list-directory', path),

  // ---------- FILE ACTIONS (🔥 unified) ----------
  fileAction: (payload) => ipcRenderer.invoke('file-action', payload),

  // ---------- OPEN / READ ----------
  openFile: (path) => ipcRenderer.invoke('open-file', path),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
});