const csv = require('csv-parser')
const {createReadStream} = require('fs')
const {getParcellesDepartement} = require("./lib/parcelles")
const {getLonLat} = require("./lib/turf")
const fs = require('fs')

const DATE_AND_DEPARTMENT_SEPARATOR = "&"

const readParcelsMatchesByDateAndDepartment = () => {
    const parcelsByDateAndDepartment = {}

    const stream = createReadStream('parcels-matches.csv')
        .pipe(csv({headers: ['parcel', 'date', 'department']}))
        .on('data', (parcel) => {
            const key = parcel.date + '&' + parcel.department

            let values = []
            if (!(key in parcelsByDateAndDepartment)) {
                parcelsByDateAndDepartment[key] = values
            } else {
                values = parcelsByDateAndDepartment[key]
            }

            values.push(parcel)
        })

    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            resolve(parcelsByDateAndDepartment)
        })
        stream.on('error', reject)
    })
}

const main = async () => {
    const parcelsByDateAndDepartment = await readParcelsMatchesByDateAndDepartment()

    for (const dateAndDepartment in parcelsByDateAndDepartment) {
        const dateAndDepartmentArray = dateAndDepartment.split(DATE_AND_DEPARTMENT_SEPARATOR)
        const date = dateAndDepartmentArray[0]
        const department = dateAndDepartmentArray[1]

        console.log(`Récupération des parcelles du millesime ${date} et département ${department}`)

        const parcelles = await getParcellesDepartement(department, date)

        console.log('Récupération des latitudes et longitudes...')

        const parcelsToDecorate = parcelsByDateAndDepartment[dateAndDepartment]
        for (const parcelToDecorate of parcelsToDecorate) {
            const parcelle = parcelles[parcelToDecorate.parcel]
            const [lon, lat] = getLonLat(parcelle)
            parcelToDecorate.longitude = lon
            parcelToDecorate.latitude = lat
        }

        const fsWriteStream = fs.createWriteStream('parcels-matches-lon-lat.csv', {flags: 'a'})
        for (const decoratedParcel of parcelsToDecorate) {
            //TODO: dummy CSV - a CSV lib would probably be better
            const csv = decoratedParcel.parcel + ',' + decoratedParcel.date + ',' + decoratedParcel.department +
                ',' + decoratedParcel.longitude + ',' + decoratedParcel.latitude + '\n'
            fsWriteStream.write(csv)
        }
        fsWriteStream.end('')
    }
}

main().catch(error => {
    console.error(error)
    process.exit(1)
})
