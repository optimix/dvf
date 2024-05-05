const got = require('got')
const {chain} = require('lodash')
const {streamToJson} = require("./streamtojson")
const stream = require("stream");

const URL = 'https://cadastre.data.gouv.fr/data/etalab-cadastre/'
const FALLBACK_URL = 'https://files.data.gouv.fr/cadastre/etalab-cadastre/'

const FALLBACK_YEARS = ['2017', '2018', '2019', '2020']

function getParcellesUrl(departement, cadastreMillesime) {
  let baseURL = URL
  FALLBACK_YEARS.forEach((fy) => {
    if (cadastreMillesime.includes(fy)) {
      baseURL = FALLBACK_URL
    }
  })
  return `${baseURL}/${cadastreMillesime}/geojson/departements/${departement}/cadastre-${departement}-parcelles.json.gz`
}

async function getParcelles(departement, cadastreMillesime, parcelIdsToFind) {
  try {
    const response = await got(getParcellesUrl(departement, cadastreMillesime), {responseType: 'buffer'})
    return await streamToJson(stream.Readable.from(response.body), parcelIdsToFind)
  } catch (e) {
    console.log(`Parcelles non trouvées pour le departement ${departement}: ${e}`)
  }
}

async function getParcellesDepartement(departement, cadastreMillesime, parcelIdsToFind) {
  return chain(await getParcelles(departement, cadastreMillesime, parcelIdsToFind))
    .compact()
    .flatten()
    .keyBy('properties.id')
    .value()
}

module.exports = {getParcellesDepartement}
