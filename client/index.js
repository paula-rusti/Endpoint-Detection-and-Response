const electron = require('electron');
const url = require('url');
const path = require('path');
const { MenuItem } = require('electron');

const {app, BrowserWindow, Menu} = electron;

let mainWindow;

app.on('ready', function(){

    // create window
    mainWindow = new BrowserWindow({});

    // load html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // set empty menu
    const mainMenu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(mainMenu);
});