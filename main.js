const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    frame: false,         
    transparent: true,    
    resizable: true,
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);