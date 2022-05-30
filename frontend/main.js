const electron = require('electron');
const url = require('url');
const path = require('path');
const { MenuItem } = require('electron');


const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;

app.on('ready', function(){

    // create window
    mainWindow = new BrowserWindow({
        width: 700,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // load html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // set empty menu
    const mainMenu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.webContents.openDevTools();

    // stop app when close is pressed
    mainWindow.on('close', () => {
        app.quit();
    })
});

// handle scan file button press
function createScanFileWindow(){
    // create window
    scanFileWindow = new BrowserWindow({
        width: 500,
        height: 400,
        title: 'Scan file',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // load html
    scanFileWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'scanFileWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // garbage collection
    scanFileWindow.on('close', () => {
        scanFileWindow = null;
    })

    scanFileWindow.webContents.openDevTools();

    scanFileWindow.show();
}

// handle scan stats button press
function createScanStatsWindow(){
    // create window
    scanStatsWindow = new BrowserWindow({
        width: 800,
        height: 400,
        title: 'Scan stats',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // load html
    scanStatsWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'scanStatsWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // garbage collection
    scanStatsWindow.on('close', () => {
        scanStatsWindow = null;
    })

    scanStatsWindow.webContents.openDevTools();

    scanStatsWindow.show();
}

// catch scan button click event
ipcMain.on('main:scan', event => {
    createScanFileWindow();
})

// catch scan window cancel click event
ipcMain.on('scan:cancel', event => {
    scanFileWindow.close();
})

// catch scan stats window button click event
ipcMain.on('main:stats', event => {
    createScanStatsWindow();
})