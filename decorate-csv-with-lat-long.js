const csv = require('csv-parser')
const fs = require('fs')
const readline = require('readline')

const processFileToDecorateLineByLine = (fileToDecorate, lineProcessor) => {
    const decoratedLines = []

    const readLineInterface = readline.createInterface({
        input: fs.createReadStream(fileToDecorate),
        console: false
    })

    readLineInterface.on('line', function (line) {
        decoratedLines.push(lineProcessor(line))
    })

    return new Promise((resolve, reject) => {
        readLineInterface.on('close', () => {
            resolve(decoratedLines)
        })
    })
}

const readLonLatByParcelId = (file) => {
    const parcelsLonLat = {}

    const stream = fs.createReadStream(file)
        .pipe(csv({headers: ['parcel', 'date', 'department', 'lon', 'lat']}))
        .on('data', (parcel) => {
            parcelsLonLat[parcel.parcel] = {
                lon: parcel.lon,
                lat: parcel.lat
            }
        })

    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            resolve(parcelsLonLat)
        })
        stream.on('error', reject)
    })
}

const main = async () => {
    const args = process.argv.slice(2)

    if (args.length !== 2) {
        console.error("Requires 2 parameters: file-to-decorate.csv parcels-matches-lon-lat.csv")
        process.exit(1)
        return
    }

    const fileToDecorate = args[0]
    const parcelsLonLatFile = args[1]

    const lonLatByParcelId = await readLonLatByParcelId(parcelsLonLatFile)

    const decoratedLines = await processFileToDecorateLineByLine(fileToDecorate, (line) => {
        if (!line.match(/^.*,,$/)) {
            return line
        }

        const parcelId = line.split(',')[15]
        const lonLat = lonLatByParcelId[parcelId]

        if (!lonLat) {
            return line
        }

        return line.replace(/(.*),,$/, `$1,${lonLat.lon},${lonLat.lat}`)
    })

    const newDecoratedFile = fileToDecorate.replace(/(.*)\.csv/, '$1-decorated.csv')

    const file = fs.createWriteStream(newDecoratedFile)
    decoratedLines.forEach((decoratedLine) => {
        file.write(decoratedLine + '\n')
    })
    file.end()

    console.log(`Generated ${newDecoratedFile}.`)
}

main().catch(error => {
    console.error(error)
    process.exit(1)
})

