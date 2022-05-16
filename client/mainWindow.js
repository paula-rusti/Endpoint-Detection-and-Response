const electron = require('electron');
const path = require('path');

// we need ipcRenderer to communicate with main process
const {ipcRenderer} = electron;

// get buttons and send click events to main process
const scanButton = document.getElementById('scan_file_button');
scanButton.addEventListener('click', event => {
    ipcRenderer.send('main:scan');
});

const statusButton = document.getElementById('device_status_button');
statusButton.addEventListener('click', event => {
    ipcRenderer.send('main:status');
});