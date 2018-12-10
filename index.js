'use strict';

const argv = require('minimist')(process.argv.slice(2), {
    default: {
        file: 'output.txt'
    }
});
const fs = require('fs');
const request = require('request-promise');

if (!argv.url) throw Error('Download URL is required!');

const options = {
    method: 'GET',
    uri: argv.url
}

fs.writeFile(argv.file, '', err => {
    if (err) console.log(err);
    console.log("Successfully created new file.");
});

const determineChunkRange = (step) => {
    const chunk = 1048576;
    const startOfRange = 1 + ((chunk * step));
    const endOfRange = chunk + (chunk * step);

    return {'Range': `bytes=${startOfRange}-${endOfRange}`}
}

const getOptions = (step) => {
    options.headers = determineChunkRange(step);

    return options;
}

const makeChunkRequest = (step) => {
    const options = getOptions(step);

    request(options)
        .then(response => {
            fs.appendFile(argv.file, response, err => {
                if (err) console.log(err);
                console.log("Writing data to file.");
            });
        })
        .catch(error => {
            console.log(222, error)
        });
}

for (let i = 0; i < 4; i++) {
    makeChunkRequest(i);
}
