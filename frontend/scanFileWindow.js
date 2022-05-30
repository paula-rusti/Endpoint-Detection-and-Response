const electron = require('electron');
const fs = require('fs');
const os = require('os');
const axios = require('axios').default;

// we need ipcRenderer to communicate with main process
const {ipcRenderer} = electron;

axios.defaults.baseURL = 'http://localhost:8100';
axios.defaults.headers.post['Content-Type'] = 'application/octet-stream';

// get button and send click event to main process
const cancelButton = document.getElementById('cancel_button');
cancelButton.addEventListener('click', event => {
    ipcRenderer.send('scan:cancel');
});

// get file input element and add event
const fileInput = document.getElementById('file_input');
fileInput.addEventListener('change', event => {
    console.log(event.target.files[0].type);
});

// get submit button and add event
const submitButton = document.getElementById('submit_button');
submitButton.addEventListener('click', event => {
    let filesLen = fileInput.files.length;
    let fileText = document.getElementById('file_text_header');
    let md5Input = document.getElementById('md5_input');
    let md5Len = md5Input.value.length;

    console.log("MD5:");
    console.log(md5Input.value.length);

    console.log('FILE INPUT LENGTH:');
    console.log(filesLen);

    if (filesLen == 0 && md5Len == 0) {
        fileText.textContent = 'No file and no md5 given!';
    }
    else if (filesLen == 0 && md5Len != 0) {
        let md5 = md5Input.value;
        console.log(`MD5 IS ${md5}`);

        // make request
        axios.get(`/scan/${md5}`)
        .then(function (response) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
    }
    else {
        const file = fileInput.files[0];

        let fileBuffer = fs.readFileSync(file.path, {encoding: 'base64'});
        let deviceId = os.hostname();
        console.log("READ FILE:");
        console.log(fileBuffer);
        console.log("DEVICE NAME:");
        console.log(os.hostname());

        // update text
        fileText.textContent = `Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`;

        // make request

        const form = new FormData();
        form.append("file", fileBuffer);
        form.append('device_id', os.hostname());

        const options = {
            method: 'POST',
            url: 'http://localhost:8100/scan',
            headers: {'Content-Type': 'multipart/form-data'},
            data: form
          };

        console.log('Sending: ');

        // make request here
        axios.request(options)
          .then(function (response) {
            console.log(response.data);

            // update displayed info
            let result_header = document.getElementById('result_header');
            result_header.textContent = response.data.verdict;

            let result_img = document.getElementById('result_img');
            if (response.data.verdict == 'clean'){
                result_img.src = "res/clean.png";
            } else {
                result_img.src = "res/infected.png";
            }
          })
          .catch(function (error) {
            console.log(error);
          });
    }
})