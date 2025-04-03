const { app, BrowserWindow } = require('electron');
const path = require('path');  // Import the path module

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets', 'logo.png'), // Adjust path and file name as needed
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // Use a preload script if necessary
      nodeIntegration: false, // For security, set to false
      contextIsolation: true, // For security, set to true
    },
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
