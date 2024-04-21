const {chain} = require('stream-chain');
const {parser} = require('stream-json');
const zlib = require('zlib');
const {streamValues} = require('stream-json/streamers/StreamValues');

const streamToJson = async (stream) => {
    return new Promise((resolve) => {
        chain([
            stream,
            zlib.createGunzip(),
            parser(),
            streamValues(),
            data => {
                resolve(data.value.features)
            }
        ]);
    });
}

module.exports = {streamToJson}
