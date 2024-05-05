const {chain} = require('stream-chain');
const {parser} = require('stream-json');
const zlib = require('zlib');
const {streamValues} = require('stream-json/streamers/StreamValues');
const LineTransformStream = require('line-transform-stream')

const streamToJson = async (stream, parcelIdsToFind) => {
    let remainingParcelIds = undefined;
    if (parcelIdsToFind) {
        remainingParcelIds = [...parcelIdsToFind];
    }

    let firstLineDone = false;

    const filterLinesAndKeepOnlyMatching = new LineTransformStream( (line) => {
        if (!parcelIdsToFind) {
            return line
        }

        if (!firstLineDone && line.includes("FeatureCollection")) {
            firstLineDone = true
            return line
        }

        for (const parcelId of remainingParcelIds) {
            if (line.includes(parcelId)) {
                const index = remainingParcelIds.indexOf(parcelId);
                remainingParcelIds.splice(index, 1);
                return line
            }
        }

        if (line.endsWith('}]}')) {
            return line
        }

        return '';
    })

    return new Promise((resolve) => {
        chain([
            stream,
            zlib.createGunzip(),
            filterLinesAndKeepOnlyMatching,
            parser(),
            streamValues(),
            data => {
                resolve(data.value.features)
            }
        ]);
    });
}

module.exports = {streamToJson}
