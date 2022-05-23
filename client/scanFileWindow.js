const electron = require('electron');
const crypto = require('crypto');
const fs = require('fs');

// we need ipcRenderer to communicate with main process
const {ipcRenderer} = electron;

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
    let len = fileInput.files.length;
    let fileText = document.getElementById('file_text_header');

    console.log('FILE INPUT LENGTH:');
    console.log(len);

    if (len == 0) {
        fileText.textContent = 'No file given!';
    }
    else {
        const file = fileInput.files[0];
        // update text
        fileText.textContent = `Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`;

        // get file hash
        const fileBuffer = fs.readFileSync(file.path);
        const hashSum = crypto.createHash('md5');
        hashSum.update(fileBuffer);
        const hex = hashSum.digest('hex');

        // make request
        let to_send = {
            h: hex,
            ft: file.type,
            fs: file.size,
        }

        console.log('Sending: ');
        console.log(to_send);

        // make request here
    }
})