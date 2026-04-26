// app/preload/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  scanDirectory: (path) => ipcRenderer.invoke('scan-directory', path),
  getFiles: () => ipcRenderer.invoke('get-files'),
  moveFile: (payload) => ipcRenderer.invoke('move-file', payload),
  selectDestinationFolder: () => ipcRenderer.invoke('select-dest-folder'),
  listDirectory: (path) => ipcRenderer.invoke('list-directory', path),  
  openFile: (path) => ipcRenderer.invoke('open-file', path),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
});

