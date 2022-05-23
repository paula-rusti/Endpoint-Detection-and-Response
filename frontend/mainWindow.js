const electron = require('electron');
const os = require('os');

// we need ipcRenderer to communicate with main process
const {ipcRenderer} = electron;

// get buttons and send click events to main process
const scanButton = document.getElementById('scan_file_button');
scanButton.addEventListener('click', event => {
    ipcRenderer.send('main:scan');
});

const statusButton = document.getElementById('device_status_button');
statusButton.addEventListener('click', event => {
    console.log('STATUS PRESSED');

    // make request here
});

// update device info elements
const platformHeader = document.getElementById('platform_header');
platformHeader.textContent = 'Platform: ' + os.platform();

const architectureHeader = document.getElementById('architecture_header');
architectureHeader.textContent = 'Architecture: ' + os.arch();

const versionHeader = document.getElementById('version_header');
versionHeader.textContent = 'Version: ' + os.version();