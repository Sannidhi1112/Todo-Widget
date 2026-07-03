const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sprout', {
  hideWindow: () => ipcRenderer.invoke('window:hide'),
  getApiKeyPresent: () => ipcRenderer.invoke('settings:getApiKeyPresent'),
  setApiKey: (key) => ipcRenderer.invoke('settings:setApiKey', key),
  clearApiKey: () => ipcRenderer.invoke('settings:clearApiKey'),
  sortBrainDump: (text) => ipcRenderer.invoke('ai:sortBrainDump', text),
  mascotLine: (prompt) => ipcRenderer.invoke('ai:mascotLine', prompt),
});
