const {getParcellesDepartement} = require("./lib/parcelles");
const {getLonLat} = require("./lib/turf");
const fs = require("fs");
const workerData = require('node:worker_threads').workerData

const process = async () => {
    const dateAndDepartmentArray = workerData.dateAndDepartmentArray;
    const parcelsByDateAndDepartment = workerData.parcelsByDateAndDepartment;
    const number = workerData.number;

    for (const dateAndDepartment of dateAndDepartmentArray) {
        const dateAndDepartmentParts = dateAndDepartment.split("&")
        const date = dateAndDepartmentParts[0]
        const department = dateAndDepartmentParts[1]

        console.log(`${new Date().getTime() / 1000}: Récupération des parcelles du millesime ${date} et département ${department}`)

        const parcelsToDecorate = parcelsByDateAndDepartment[dateAndDepartment]

        const parcelIdsToFind = parcelsToDecorate.map((p) => p.parcel)

        const parcelles = await getParcellesDepartement(department, date, parcelIdsToFind)

        console.log('Récupération des latitudes et longitudes...')

        for (const parcelToDecorate of parcelsToDecorate) {
            const parcelle = parcelles[parcelToDecorate.parcel]
            const [lon, lat] = getLonLat(parcelle)
            parcelToDecorate.longitude = lon
            parcelToDecorate.latitude = lat
        }

        const fsWriteStream = fs.createWriteStream(`parcels-matches-lon-lat-${number}.csv`, {flags: 'a'})
        for (const decoratedParcel of parcelsToDecorate) {
            //TODO: dummy CSV - a CSV lib would probably be better
            const csv = decoratedParcel.parcel + ',' + decoratedParcel.date + ',' + decoratedParcel.department +
                ',' + decoratedParcel.longitude + ',' + decoratedParcel.latitude + '\n'
            fsWriteStream.write(csv)
        }
        fsWriteStream.end('')
    }
}

process();
