const csv = require('csv-parser')
const {createReadStream} = require('fs')
const {Worker} = require('worker_threads');

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

function splitToNChunks(array, n) {
    let result = [];
    for (let i = n; i > 0; i--) {
        result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
}

const processOne = (parcelsByDateAndDepartment, dateAndDepartmentArray) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker("./lat-long-worker.js", {
            workerData: {
                parcelsByDateAndDepartment,
                dateAndDepartmentArray
            }
        })
        worker.on('error', reject)
        worker.on('exit', code => {
            if (code !== 0) {
                reject(new Error(`Worker exited with code ${code}`))
            }
            console.log('Worker exited ok')
            resolve()
        })
    });
}

const processInParallel = (parcelsByDateAndDepartment, dateAndDepartmentArrays) => {
    return dateAndDepartmentArrays.map((dateAndDepartmentArray) => {
        return processOne(parcelsByDateAndDepartment, dateAndDepartmentArray);
    });
}

const main = async () => {
    const parcelsByDateAndDepartment = await readParcelsMatchesByDateAndDepartment()
    const dateAndDepartmentArrays = splitToNChunks(Object.keys(parcelsByDateAndDepartment), 8);

    await processInParallel(parcelsByDateAndDepartment, dateAndDepartmentArrays);
}

main().catch(error => {
    console.error(error)
    process.exit(1)
})
