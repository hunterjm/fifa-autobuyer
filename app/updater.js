import { app } from 'electron';
import * as os from 'os';
import { autoUpdater } from 'electron-auto-updater';

export function initUpdater(mainWindow) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  const platform = os.platform();
  if (platform === 'linux') {
    return;
  }
  const version = app.getVersion();
  autoUpdater.addListener('update-available', () => {
    notify(mainWindow, { pending: false, update: true, downloaded: false, message: 'A new version is available!' });
  });
  autoUpdater.addListener('update-downloaded', (event, releaseNotes, releaseName) => {
    notify(mainWindow, {
      pending: false,
      update: true,
      downloaded: true,
      message: `Version ${releaseName} is downloaded and will be automatically installed on Quit`,
    });
    autoUpdater.quitAndInstall();
    return true;
  });
  autoUpdater.addListener('error', () => {
    notify(mainWindow, { pending: false, update: false, downloaded: false, message: 'An error occured while checking for updates.' });
  });
  autoUpdater.addListener('checking-for-update', () => {
    notify(mainWindow, { pending: true, update: false, downloaded: false, message: 'Checking for updates...' });
  });
  autoUpdater.addListener('update-not-available', () => {
    notify(mainWindow, { pending: false, update: false, downloaded: false, message: 'No updates available.' });
  });

  if (platform === 'darwin') {
    autoUpdater.setFeedURL(`https://fifa-autobuyer.herokuapp.com/update/osx/${version}`);
  }

  autoUpdater.checkForUpdates();
}

export function checkForUpdates() {
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdates();
  }
}

function notify(mainWindow, message) {
  mainWindow.webContents.send('updates', message);
}
