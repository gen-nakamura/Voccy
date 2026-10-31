const { app, BrowserWindow, ipcMain, session, Notification, powerMonitor, Menu, dialog } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { openDatabase } = require('./database.cjs');
const { createReminders } = require('./reminders.cjs');

app.setName('voccy'); // Preserve the original %APPDATA%/voccy data directory.
if (!app.requestSingleInstanceLock()) app.quit();
else {
  let database;
  let reminders;
  let window;
  // Production loads packaged files only; no web/development server is started.
  app.commandLine.appendSwitch('disable-background-networking');
  // Prevent OS proxy auto-discovery (WPAD DNS/DHCP) even without URL requests.
  app.commandLine.appendSwitch('no-proxy-server');
  app.commandLine.appendSwitch('disable-component-update');
  app.commandLine.appendSwitch('disable-domain-reliability');
  app.commandLine.appendSwitch('disable-sync');
  app.commandLine.appendSwitch('no-pings');
  app.commandLine.appendSwitch('disable-features', 'MediaRouter,OptimizationHints,AutofillServerCommunication,CertificateTransparencyComponentUpdater');
  const indexPath = path.join(__dirname, '../dist/index.html');
  const indexURL = pathToFileURL(indexPath).href;
  function createWindow() {
    window = new BrowserWindow({ width: 1200, height: 900, minWidth: 800, minHeight: 600,
      icon: path.join(__dirname, '../src/build/icon.png'),
      webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false,
        contextIsolation: true, sandbox: true, webSecurity: true, webviewTag: false,
        allowRunningInsecureContent: false, devTools: !app.isPackaged }
    });
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', event => event.preventDefault());
    window.webContents.on('will-attach-webview', event => event.preventDefault());
    window.loadFile(indexPath);
    window.on('closed', () => { window = null; });
  }
  app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
  app.whenReady().then(async () => {
    app.setAppUserModelId('voccy_gen-nakamura');
    Menu.setApplicationMenu(null);
    const ses = session.defaultSession;
    await ses.setProxy({ mode: 'direct' });
    ses.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    ses.setPermissionCheckHandler(() => false);
    ses.on('will-download', event => event.preventDefault());
    // Block all network requests, including localhost. Only packaged assets may load.
    const assetRoot = pathToFileURL(path.join(__dirname, '../dist') + path.sep).href;
    ses.webRequest.onBeforeRequest((details, callback) => {
      const allowed = details.url.startsWith(assetRoot);
      callback({ cancel: !allowed });
    });
    database = await openDatabase(path.join(app.getPath('userData'), 'voccy.db'));
    reminders = createReminders(database, count => {
      if (Notification.isSupported()) new Notification({ title: '学習の時間です！', body: `${count}件の学習タスクがあります。` }).show();
    });
    for (const method of ['list', 'quiz', 'add', 'edit', 'remove', 'review', 'changeSettings']) {
      ipcMain.handle(`voccy:${method}`, (event, value) => {
        if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== indexURL) throw new Error('Untrusted IPC sender');
        try {
          const data = method === 'list' || method === 'quiz' ? database[method]() : database[method](value);
          if (method === 'changeSettings') reminders.schedule();
          return { ok: true, data };
        } catch (error) { return { ok: false, error: error.message }; }
      });
    }
    powerMonitor.on('resume', () => reminders.schedule());
    reminders.schedule();
    createWindow();
    app.on('activate', () => { if (!window) createWindow(); });
  }).catch(error => { dialog.showErrorBox('Voccy startup failed', error.message); app.quit(); });
  app.on('window-all-closed', () => app.quit());
  app.on('will-quit', () => { reminders?.stop(); database?.close(); });
}
