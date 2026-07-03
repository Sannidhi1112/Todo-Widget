const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const Anthropic = require('@anthropic-ai/sdk');

const store = new Store({
  name: 'sprout-settings',
  defaults: { apiKey: '', windowX: null, windowY: null },
});

const isDev = process.env.NODE_ENV === 'development';
const WIDTH = 420;
const HEIGHT = 640;

let win = null;
let tray = null;

function createWindow() {
  const savedX = store.get('windowX');
  const savedY = store.get('windowY');
  const display = screen.getPrimaryDisplay();
  const defaultX = Math.round(display.workArea.x + display.workArea.width - WIDTH - 40);
  const defaultY = Math.round(display.workArea.y + 60);

  win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    x: Number.isFinite(savedX) ? savedX : defaultX,
    y: Number.isFinite(savedY) ? savedY : defaultY,
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  win.on('move', () => {
    if (!win) return;
    const [x, y] = win.getPosition();
    store.set('windowX', x);
    store.set('windowY', y);
  });

  win.on('closed', () => { win = null; });
}

function toggleWindow() {
  if (!win) { createWindow(); return; }
  if (win.isVisible()) win.hide();
  else { win.show(); win.focus(); }
}

function createTray() {
  const icon = nativeImage.createFromDataURL(TRAY_ICON_DATA_URL).resize({ width: 18, height: 18 });
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('Sprout');
  const menu = Menu.buildFromTemplate([
    { label: 'Show / Hide Sprout', click: toggleWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', toggleWindow);
}

// Small round moon glyph as a tray icon, generated inline so no binary asset is needed.
const TRAY_ICON_DATA_URL = 'data:image/svg+xml;base64,' + Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><circle cx="9" cy="9" r="8" fill="#E8956B"/></svg>`
).toString('base64');

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else toggleWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep the tray alive on all platforms; the widget lives in the tray like a real widget.
});

// ---- IPC: window controls ----
ipcMain.handle('window:hide', () => { if (win) win.hide(); });
ipcMain.handle('window:drag-start', () => {});

// ---- IPC: settings ----
ipcMain.handle('settings:getApiKeyPresent', () => !!store.get('apiKey'));
ipcMain.handle('settings:setApiKey', (_e, key) => { store.set('apiKey', String(key || '').trim()); return true; });
ipcMain.handle('settings:clearApiKey', () => { store.set('apiKey', ''); return true; });

// ---- IPC: AI ----
function getClient() {
  const key = store.get('apiKey');
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

ipcMain.handle('ai:sortBrainDump', async (_e, text) => {
  const client = getClient();
  if (!client) return { ok: false, reason: 'no-key' };
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      system: "You turn a messy brain dump into a clean todo list. Return ONLY a JSON array, no prose, no code fences. Each item: {\"task\": short imperative under 8 words, \"category\": one of [Work, Personal, Health, Errands, Ideas, Urgent], \"priority\": one of [high, medium, low]}. Split compound thoughts into separate tasks.",
      messages: [{ role: 'user', content: text }],
    });
    const raw = (msg.content || []).map(b => (b.type === 'text' ? b.text : '')).join('');
    return { ok: true, text: raw };
  } catch (err) {
    return { ok: false, reason: 'error', message: String(err && err.message || err) };
  }
});

ipcMain.handle('ai:mascotLine', async (_e, prompt) => {
  const client = getClient();
  if (!client) return { ok: false, reason: 'no-key' };
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 60,
      system: "You are Sprout, a cute cheeky productivity mascot living in a desktop widget. Reply with ONE short line, max 14 words, warm and a little playful. If the user is behind, gently roast them; if they're doing well, hype them up. At most one emoji.",
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = (msg.content || []).map(b => (b.type === 'text' ? b.text : '')).join('');
    return { ok: true, text: raw };
  } catch (err) {
    return { ok: false, reason: 'error', message: String(err && err.message || err) };
  }
});
