const got = require('got')
const {chain} = require('lodash')
const {streamToJson} = require("./streamtojson")
const stream = require("stream");

function getParcellesUrl(departement) {
  return `https://cadastre.data.gouv.fr/data/etalab-cadastre/${process.env.CADASTRE_MILLESIME}/geojson/departements/${departement}/cadastre-${departement}-parcelles.json.gz`
}

async function getParcelles(departement) {
  try {
    const response = await got(getParcellesUrl(departement), {responseType: 'buffer'})
    return await streamToJson(stream.Readable.from(response.body))
  } catch (e) {
    console.log(`Parcelles non trouvées pour le departement ${departement}: ${e}`)
  }
}

async function getParcellesDepartement(departement) {
  return chain(await getParcelles(departement))
    .compact()
    .flatten()
    .keyBy('properties.id')
    .value()
}

module.exports = {getParcellesDepartement}
