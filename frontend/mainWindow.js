const { default: axios } = require('axios');
const electron = require('electron');
const os = require('os');

// we need ipcRenderer to communicate with main process
const {ipcRenderer} = electron;


//here mainly the buttons will be configured
// axios config
axios.defaults.baseURL = 'http://localhost:8100';

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

    //make request here
    axios.get(`/device_status/${os.hostname()}`)
    .then(function (response) {
        // handle success
        console.log(response);
        let result_header = document.getElementById('device_status_header');
        result_header.textContent = response.data.status;

        let result_img = document.getElementById('result_img');
        if (response.data.status == 'clean'){
            result_img.src = "res/clean.png";
        } else {
            result_img.src = "res/infected.png";
        }
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
    .then(function () {
        // always executed
    });
});

// update device info elements
//the os will everytime be verified
const platformHeader = document.getElementById('platform_header');
platformHeader.textContent = 'Platform: ' + os.platform();

const architectureHeader = document.getElementById('architecture_header');
architectureHeader.textContent = 'Architecture: ' + os.arch();

const versionHeader = document.getElementById('version_header');
versionHeader.textContent = 'Version: ' + os.version();