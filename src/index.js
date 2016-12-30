import { map, latLng, TileLayer, GridLayer, DomUtil } from 'leaflet';
import geojsonvt from 'geojson-vt';
import axios from 'axios';

const mymap = map('geojson__container', {
  center: L.latLng(19.432904,-99.1568927),
  zoom: 12
});

const colorMappings = {
  "Agricultura de Humedad": '#454259',
  "Agricultura de Riego": '#45516A',
  "Agricultura de Riego Eventual": '#426279',
  "Agricultura de Temporal": '#3C7387',
  "Agricultura de Temporal,  Pastizal cultivado": '#348590',
  "Agricultura de Temporal,  Pastizal inducido": '#2F9697',
  "Agricultura de Temporal, Selva Baja Caducifolia": '#34A799',
  "Agricultura de Temporal, Selva Mediana Subcaducifolia": '#44B897',
  "Agricultura de Temporal, Vegetacion secundaria de Selva Alta Perennifolia": '#5CC893',
  "Agricultura de Temporal, Vegetacion secundaria de Selva Baja Caducifolia": '#7AD88C',
  "Agricultura de Temporal, Vegetacion secundaria de Selva Mediana Subcaducifola": '#9CE683',
  "Agricultura de Temporal, Vegetacion secundaria de Selva Mediana Subperennifolia": '#C1F37B',
};

const osmUrl='http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
const osmAttrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
const osm = new TileLayer(osmUrl, {minZoom: 2, maxZoom: 15, attribution: osmAttrib});
mymap.addLayer(osm);

const createLayer = response => {
  const data = response.data;
  const tileIndex = geojsonvt(data, {
    maxZoom: 12,  // max zoom to preserve detail on
    tolerance: 3, // simplification tolerance (higher means simpler)
    extent: 4096, // tile extent (both width and height)
    buffer: 64,   // tile buffer on each side
    debug: 0,      // logging level (0 to disable, 1 or 2)
    indexMaxZoom: 4,        // max zoom in the initial tile index
    indexMaxPoints: 1000000, // max number of points per tile in the index
    solidChildren: false    // whether to include solid tile children in the index
  });
  const CanvasLayer = GridLayer.extend({
    createTile: function(coords) {
      let tile = DomUtil.create('canvas', 'leaflet-tile leaflet-geojson-vt');
      tile.width = 256;
      tile.height = 256;
      const ctx = tile.getContext('2d');
      const tileToRender = tileIndex.getTile(coords.z, coords.x, coords.y);
      ctx.clearRect(0, 0, tile.width, tile.height);
      if (!tileToRender) {
        return tile;
      }
      const features = tileToRender.features;
      ctx.strokeStyle = 'rgba(0,0,0,0)';
      features.forEach(feature => {
        const geometries = feature.geometry;
        let featureColor;
        if(feature.tags.TIPO) {
          featureColor = colorMappings[feature.tags.TIPO];
        }
        ctx.fillStyle = featureColor || 'rgba(0,0,0,0)';
        ctx.beginPath();
        geometries.forEach(geometry => {
          const type = geometry.type;
          geometry.forEach(ctxDrawPolygon.bind(null, ctx));
        });
        ctx.fill('evenodd');
        ctx.stroke();
      });
      return tile;
    }
  });
  mymap.addLayer(new CanvasLayer());
};

const ctxDrawPolygon = (ctx, point, index) => {
  const pad = 0;
  const extent = 4096;
  const x = point[0] / extent * 256;
  const y = point[1] / extent * 256;
  if (index) {
    ctx.lineTo(x  + pad, y   + pad);
  } else {
    ctx.moveTo(x  + pad, y  + pad);
  }
};

axios.get('./uso.json')
  .then(createLayer)
  .catch(err => console.log(err));
