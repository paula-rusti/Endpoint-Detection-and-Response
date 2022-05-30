const { default: axios } = require('axios');
const electron = require('electron');
const os = require('os');

// we need ipcRenderer to communicate with main process
const {ipcRenderer} = electron;

// axios config
axios.defaults.baseURL = '0.0.0.0';

// get buttons and send click events to main process
const scanButton = document.getElementById('scan_file_button');
scanButton.addEventListener('click', event => {
    ipcRenderer.send('main:scan');
});

const statsButton = document.getElementById('scan_stats_button');
statsButton.addEventListener('click', event => {
    ipcRenderer.send('main:stats');
});


const statusButton = document.getElementById('device_status_button');
statusButton.addEventListener('click', event => {
    console.log('STATUS PRESSED');

    // make request here
    // axios.get(`/status`)
    // .then(function (response) {
    //     // handle success
    //     console.log(response);
    // })
    // .catch(function (error) {
    //     // handle error
    //     console.log(error);
    // })
    // .then(function () {
    //     // always executed
    // });
});

// update device info elements
const platformHeader = document.getElementById('platform_header');
platformHeader.textContent = 'Platform: ' + os.platform();

const architectureHeader = document.getElementById('architecture_header');
architectureHeader.textContent = 'Architecture: ' + os.arch();

const versionHeader = document.getElementById('version_header');
versionHeader.textContent = 'Version: ' + os.version();