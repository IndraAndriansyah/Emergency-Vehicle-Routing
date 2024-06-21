/*set POI pada maps*/
function bindMapEvents() {
  map.on('click', function(event) {
    var feature  = map.queryRenderedFeatures(event.point)[0];
    hidePoiMarker();

    if (feature.sourceLayer === 'Point of Interest') {
      map.addLayer({
        'id': 'selectedPOI',
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': feature.geometry.coordinates
            }
          }
        },
        'type': 'symbol',
        'paint': {
          'text-color': 'rgba(0, 0, 0, 1)',
          'text-halo-color': 'rgba(255, 255, 255, 1)',
          'text-halo-width': 1
        },
        'layout': {
          'text-field': feature.properties.name || feature.properties.description,
          'icon-image': `${feature.properties.icon}_pin`,
          'icon-anchor': 'bottom',
          'text-letter-spacing': 0.1,
          'icon-padding': 5,
          'icon-offset': [0, 5],
          'text-max-width': 10,
          'text-variable-anchor': ['top'],
          'text-font': ['Noto-Bold'],
          'text-size': 14,
          'text-radial-offset': 0.2
        }
      });
    }
  });
  map.on('mouseenter', 'POI', function(event) {
    map.getCanvas().style.cursor = 'pointer';
    var feature = map.queryRenderedFeatures(event.point)[0];

    createPopup(feature);
    hoveredFeature = feature;

    map.setFeatureState(feature, { hover: true });
  });

  map.on('mouseleave', 'POI', function(event) {
    map.getCanvas().style.cursor ='';
    if (hoveredFeature) {
        map.setFeatureState(hoveredFeature, { hover: false });
    }
    hoveredFeature = null;
    if (!event.originalEvent.relatedTarget) {
        removePopup();
    }
  });

  map.on('click', 'POI', function(event) {
    map.getCanvas().style.cursor ='';
    if (hoveredFeature) {
        map.setFeatureState(hoveredFeature, { hover: false });
    }
    hoveredFeature = null;
    if (!event.originalEvent.relatedTarget) {
        removePopup();
    }
  });
}
 /*set popup POI*/
function createPopup(result) {
  var markerSize = 10;
  removePopup();
  
  var popupOffset = {
    'top': [0, markerSize],
      'top-left': [0, markerSize],
      'top-right': [0, markerSize],
      'bottom': [0, -markerSize],
      'bottom-left': [0, -markerSize],
      'bottom-right': [0, -markerSize],
      'left': [markerSize, -markerSize],
      'right': [-markerSize, -markerSize]
  };
  var htmlContent = document.createElement('div');

  htmlContent.innerHTML ='<div class="popup-container">'+'<div class="category">'+Formatters.formatCategoryName(result.properties.category)+'<div>'+'<div class="name">'+result.properties.name+'</div>'+'</div>';

  popup = new tt.Popup({ oofset: popupOffset })
    .setLngLat(result.geometry.coordinates)
    .setDOMContent(htmlContent)
    .addTo(map)
    .setMaxWidth('200px');

  htmlContent.addEventListener('mouseleave', function(){
    removePopup();
  });
}
/*menghapus popup POI*/
function removePopup(){
  if (popup) {
    popup.remove();
    popup = null;
  }
}
/*hide POI agar tidak muncul*/
function hidePoiMarker(){
  if (map.getLayer('selectedPOI')){
    map.removeLayer('selectedPOI');
    map.removeSource('selectedPOI');
  }
}