var ttSearchBox = new tt.plugins.SearchBox(tt.services, {
  searchOptions: {
      key: apiKey,
      language: 'en-GB',
      limit:3
  },
  labels: {
      placeholder: 'Telusuri SITIKAR Map'
  }
});


map.addControl(ttSearchBox, 'top-left');

map.on('load', function() {
  searchMarkersManager = new SearchMarkersManager(map, { entryPoints: false, reverseGeocodeService: function(options) {
      options.key = apiKey;
      return tt.services.reverseGeocode(options);
  }});
});

function getBounds(data) {
  if (!data.viewport) {
      return;
  }
  var btmRight = [data.viewport.btmRightPoint.lng, data.viewport.btmRightPoint.lat];
  var topLeft = [data.viewport.topLeftPoint.lng, data.viewport.topLeftPoint.lat];
  return [btmRight, topLeft];
}

function fitToViewport(markerData) {
  if (!markerData || !markerData.length) {
      return;
  }

  var bounds = new tt.LngLatBounds();
  if (markerData instanceof Array) {
      markerData.forEach(function(marker) {
          bounds.extend(getBounds(marker));
      });
  } else {
      bounds.extend(getBounds(markerData));
  }
  map.fitBounds(bounds, { padding: 100, linear: true });
}

ttSearchBox.on('tomtom.searchbox.resultscleared', function() {
  searchMarkersManager.clear();
});

ttSearchBox.on('tomtom.searchbox.resultsfound', function(resp) {
  var results = resp.data.results.fuzzySearch.results;
  searchMarkersManager.draw(results);
  fitToViewport(results);
});

ttSearchBox.on('tomtom.searchbox.resultselected', function(resp) {
  searchMarkersManager.draw([resp.data.result]);
  searchMarkersManager.jumpToMarker(resp.data.result.id);
});

var geolocateControl = new tt.GeolocateControl({
  positionOptions: {
      enableHighAccuracy: true
  }
});
geolocateControl.on('geolocate', function(event) {
  var coordinates = event.coords;
  state.userLocation = [coordinates.longitude, coordinates.latitude];
  ttSearchBox.updateOptions(Object.assign({}, ttSearchBox.getOptions(), {
      distanceFromPoint: state.userLocation
  }));
});

map.addControl(geolocateControl, 'bottom-right');