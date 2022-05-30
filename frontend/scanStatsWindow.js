const axios = require('axios').default;

axios.defaults.baseURL = 'http://localhost:8005';

// get html elements
const overviewTodayButton = document.getElementById('overview_today_button');
const overviewDateButton = document.getElementById('overview_date_button');
const fileOverviewButton = document.getElementById('file_overview_button');
const dateInput = document.getElementById('date_input');
const md5Input = document.getElementById('md5_input');

let errorTextHeader = document.getElementById('error_text_header');
let dateHeader = document.getElementById('date_header');
let cleanHeader = document.getElementById('clean_count_header');
let infectedHeader = document.getElementById('infected_count_header');

// add event listeners for buttons

overviewTodayButton.addEventListener('click', event => {
    console.log('OVERVIEW TODAY CLICKED');

    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    let current_date = year + "-" + month + "-" + date;
    dateHeader.textContent = 'Date: ' + current_date;

    // make request
    axios.get(`overview`)
    .then(function (response) {
        // handle success
        console.log(response);
        cleanHeader.textContent = response.clean_count;
        infectedHeader.textContent = response.infected_count;
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
    .then(function () {
        // always executed
    });
});

overviewDateButton.addEventListener('click', event => {
    console.log('OVERVIEW DATE CLICKED');

    let date = dateInput.value;
    console.log(date);

    if (date.length == 0) {
        errorTextHeader.textContent = 'No date selected!';
    } else {
        dateHeader.textContent = 'Date: ' + date;
        errorTextHeader.textContent = '';

        // make request
        axios.get(`overview/${date}`)
        .then(function (response) {
            // handle success
            console.log(response);
            cleanHeader.textContent = response.clean_count;
            infectedHeader.textContent = response.infected_count;
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
    }
});

fileOverviewButton.addEventListener('click', event => {
    console.log('FILE SCANNED CLICKED');

    let md5 = md5Input.value;
    console.log(md5);

    if (md5.length == 0) {
        errorTextHeader.textContent = 'No md5 given!';
    } else {
        // make request
        axios.get(`scanned/${md5}`)
        .then(function (response) {
            // handle success
            console.log(response);

            if (response.exists) {
                errorTextHeader.textContent = 'File with md5 ' + md5 + ' was scanned before';
            } else {
                errorTextHeader.textContent = 'File with md5 ' + md5 + ' was not scanned before';
            }

        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
    }
})