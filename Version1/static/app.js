/*/* set marker kantor damkar*/
let center=[107.6110212, -6.9215529] /*let = blok var = function*/
let mako =  [107.63403662622008, -6.916781180397956]
let utara = [107.59143622342704, -6.8774440161212835]
let selatan = [107.58312626346968, -6.945680833473349]
let timur = [107.67584301412951, -6.938258975278367]
let barat = [107.57425747663765, -6.9082415715777215]

var incidentListContainer = document.querySelector("#incidents");
const apiKey = "8dzxZD2SRE74hHUfz5Kg4DdW6KdNL859";

var map = tt.map({
  key: apiKey,
  container:"map",
  center:center,
  /*style: "https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main&poi=poi_dynamic",*/
  zoom:14,
  fadeDuration: 50,
  styleVisibility: {
    trafficIncidents: true,
    trafficFlow: true
  },
}); /*const = sifatnya tetap tidak bisa di deklarasi ulang*/


formatters = Formatters;
var iconsMapping = {
    '0': 'danger',
    '1': 'accident',
    '2': 'fog',
    '3': 'danger',
    '4': 'rain',
    '5': 'ice',
    '6': 'incident',
    '7': 'laneclosed',
    '8': 'roadclosed',
    '9': 'roadworks',
    '10': 'wind',
    '11': 'flooding',
    '14': 'brokendownvehicle'
};

var incidentSeverity = {
    '0': 'unknown',
    '1': 'minor',
    '2': 'moderate',
    '3': 'major',
    '4': 'undefined'
};


document.querySelector('#flow').addEventListener('change', function(event) {
  if (event.target.checked) {
      map.showTrafficFlow();
  } else {
      map.hideTrafficFlow();
  }
});

document.querySelector('#incidents').addEventListener('change', function(event) {
  if (event.target.checked) {
      map.showTrafficIncidents()
      /*pop traffic load on map*/
      new IncidentsDetailsManager(map, tt.services, {
        key: apiKey,
        incidentMarkerFactory: function() {
          return new IncidentMarker({
            iconsMapping: iconsMapping,
            incidentSeverity: incidentSeverity,
            onSelected: makeResultItemSelected
          });
        },
      });
      
        
  } else {
      map.hideTrafficIncidents()
      
      
      
  }
});



/* load marker kantor damkar*/
map.on('load', () => {
  new tt.Marker().setLngLat(mako).addTo(map)
  new tt.Marker().setLngLat(utara).addTo(map)
  new tt.Marker().setLngLat(selatan).addTo(map)
  new tt.Marker().setLngLat(timur).addTo(map)
  new tt.Marker().setLngLat(barat).addTo(map) 
});

new Foldable('#foldable', 'top-right');
var bounds = new tt.LngLatBounds();
var travelMode = 'bus';

var popup = null;
var hoveredFeature = null;

map.on('load', function() {
  bindMapEvents();
});