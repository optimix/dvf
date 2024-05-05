const centroid = require('@turf/centroid').default
const truncate = require('@turf/truncate').default

const getLonLat = (parcelle) => {
    return truncate(centroid(parcelle), {precision: 6}).geometry.coordinates
}

module.exports = {getLonLat}
