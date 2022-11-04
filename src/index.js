const { app, BrowserWindow, desktopCapturer, ipcMain, dialog } = require('electron');
const remoteMain = require('@electron/remote/main');
const fs = require('fs');
remoteMain.initialize();
const path = require('path');

let mainWindow = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'script.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  
  remoteMain.enable(mainWindow.webContents)
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

async function capture (sourceName) {
  const sources = await desktopCapturer
    .getSources({
      types: ['window'],
      thumbnailSize: { width: 1920,height: 1080 },
    })
  let image = null;
  for (let i = 0; sources[i]; i++){
    if (sources[i].name === sourceName){
      image = sources[i].thumbnail.toDataURL();
      break;
    }
  }
  mainWindow.webContents.send('screenshot:captured', image);
}

async function getSourcesList () {
  const sources = await desktopCapturer
    .getSources({
      types: ['window'],
      thumbnailSize: { width: 1920,height: 1080 },
    })
  mainWindow.webContents.send('videoList', sources);
}

async function saveFile (value) {
  const data = value.image.replace(/^data:image\/\w+;base64,/, "");
  const buf = Buffer.from(data, 'base64');
  const path = await dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory', 'multiSelections']
    });
  fs.writeFile(`${path.filePaths}/${value.sourceName}-screenshot.png`, buf, function(err){
    if (err){
      //Do Nothing
    };
  });
}

//Handle event
ipcMain.on('screenshot:capture', (e, value) => {
  capture(value.sourceName);
})

ipcMain.on('imgSource', (e, value) => {
  getSourcesList();
})

ipcMain.on('imgSave', (e, value) => {
  saveFile(value);
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
