const electron = require('electron');
const path = require('path');

// we need ipcRenderer to communicate with main process
const {ipcRenderer} = electron;

// get button and send click event to main process
const cancelButton = document.getElementById('cancel_button');
cancelButton.addEventListener('click', event => {
    ipcRenderer.send('scan:cancel');
});