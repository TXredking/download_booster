'use strict';

const argv = require('minimist')(process.argv.slice(2), {
    default: {
        file: 'output.txt',
        MiB: 1,
        chunks: 4
    }
});
const fs = require('fs');
const request = require('request-promise');

// Source URL must be specified through command line option.
if (!argv.url) throw Error('Source URL is required!');

const options = {
    method: 'GET',
    uri: argv.url
}

const checkFileSize = () => {
    fs.stat(`./${argv.file}`, (err, stats) => {
        if (err) console.log(err);
        console.log(`Current File Size: ${stats.size}`);
    });
}
const determineChunkRange = (step) => {
    // 1 Mib = 1,048,576 B.
    // Only 1 MiB chunks are downloaded.
    const chunkSize = argv.MiB * 1048576;
    const startOfRange = step === 0 ? 0 + ((chunkSize * step)) : 1 + ((chunkSize * step));
    const endOfRange = chunkSize + (chunkSize * step);

    return {'Range': `bytes=${startOfRange}-${endOfRange}`}
}

const getOptions = (step) => {
    options.headers = determineChunkRange(step);

    return options;
}

const makeRequest = (step) => {
    const options = getOptions(step);
    console.log(step, options)

    // make request to specified URL.
    request(options)
        .then(response => {
            try {
                fs.appendFileSync(argv.file, response);
                console.log("Writing data to file.");
            } catch (err) {
                console.log(`Error appending to ${argv.file}`, err);
            }
        })
        .catch(error => {
            console.log(`Error making request to ${argv.url}`, error)
        });
}

fs.writeFileSync(argv.file, '');
console.log("Successfully created new file.");

// Make specified number of requests.
for (let i = 0; i < argv.chunks; i++) {
    checkFileSize();
    makeRequest(i);
}
