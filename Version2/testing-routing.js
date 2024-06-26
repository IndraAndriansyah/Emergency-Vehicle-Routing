var routeMarkers = {}, routePoints = {}, searchBoxes = {};
var finishMarkerElement = createMarkerElement('finish');
var startMarkerElement = createMarkerElement('start');
var errorHint = new InfoHint('error', 'bottom-center', 5000).addTo(document.getElementById('map'));
var loadingHint = new InfoHint('info', 'bottom-center').addTo(document.getElementById('map'));
var resultsManager = new ResultsManager();
var detailsWrapper = document.createElement('div');
var summaryContent = document.createElement('div'), summaryHeader;

map.on('load', function() {
    searchBoxes.finish = createSearchBox('finish');
    document.getElementById('startPointSelect').addEventListener('change', onStartPointSelect);
});

function addRouteMarkers(type, point) {
    var lngLat = point && point[type + 'Point'] || routePoints[type];

    if (!routeMarkers[type] && routePoints[type]) {
        routeMarkers[type] = createMarker(type, lngLat);
    }
    if (routeMarkers[type]) {
        routeMarkers[type].setLngLat(routePoints[type]);
    }
}

function centerMap(lngLat) {
    map.flyTo({
        center: lngLat,
        speed: 10,
        zoom: 13
    });
}

function clearMap() {
    if (!map.getLayer('route')) {
        return;
    }
    map.removeLayer('route');
    map.removeSource('route');
}

function createMarker(type, lngLat) {
    var markerElement = type === 'start' ? startMarkerElement : finishMarkerElement;

    return new tt.Marker({ draggable: true, element: markerElement })
        .setLngLat(lngLat || routePoints[type])
        .addTo(map)
        .on('dragend', getDraggedMarkerPosition.bind(null, type));
}

function createMarkerElement(type) {
    var element = document.createElement('div');
    var innerElement = document.createElement('div');

    element.className = 'draggable-marker';
    innerElement.className = 'tt-icon -white -' + type;
    element.appendChild(innerElement);
    return element;
}

function createSearchBox(type) {
    var searchBox = new tt.plugins.SearchBox(tt.services, {
        showSearchButton: false,
        searchOptions: {
            key: apiKey
        },
        labels: {
            placeholder: 'Tentukan Awal & Tujuan'
        }
    });

    document.getElementById(type + 'SearchBox').appendChild(searchBox.getSearchBoxHTML());
    searchBox.on('tomtom.searchbox.resultscleared', onResultCleared.bind(null, type));

    searchBox.on('tomtom.searchbox.resultsfound', function(event) {
        handleEnterSubmit(event, onResultSelected.bind(this), errorHint, type);
    });

    searchBox.on('tomtom.searchbox.resultselected', function(event) {
        if (event.data && event.data.result) {
            onResultSelected(event.data.result, type);
        }
    });

    return searchBox;
}

function createSummaryContent(feature) {
    if (!summaryHeader) {
        summaryHeader = DomHelpers.elementFactory('div', 'summary-header', 'Route summary');
        summaryContent.appendChild(summaryHeader);
    }
    var detailsHTML =
        '<div class="summary-details-top">Leave now</div>' +
        '<div class="summary-details-bottom">' +
            '<div class="summary-icon-wrapper">' +
                '<span class="tt-icon -car -big"></span>' +
            '</div>' +
            '<div class="summary-details-text">' +
                '<span class="summary-details-info">Distance: <b>' +
                    Formatters.formatAsMetricDistance(feature.lengthInMeters) +
                '</b></span>' +
                '<span class="summary-details-info -second">Arrive: <b>' +
                    Formatters.formatToExpandedDateTimeString(feature.arrivalTime) +
                '</b></span>' +
            '</div>' +
        '</div>';

    detailsWrapper.innerHTML = detailsHTML;
    summaryContent.appendChild(detailsWrapper);
    return summaryContent;
}

function getDraggedMarkerPosition(type) {
    var lngLat = routeMarkers[type].getLngLat();

    performReverseGeocodeRequest(lngLat)
        .then(function(response) {
            var addresses = response.addresses[0];
            var freeFormAddress = addresses.address.freeformAddress;

            if (!freeFormAddress) {
                loadingHint.hide();
                clearMap();
                resultsManager.resultsNotFound();
                errorHint.setMessage('Address not found, please choose a different place');
                return;
            }
            searchBoxes[type]
                .getSearchBoxHTML()
                .querySelector('input.tt-search-box-input')
                .value = freeFormAddress;
            var position = {
                lng: addresses.position.lng,
                lat: addresses.position.lat
            };

            updateMapView(type, position);
        });
}

function handleCalculateRouteError() {
    clearMap();
    resultsManager.resultsNotFound();
    errorHint.setMessage('There was a problem calculating the route');
    loadingHint.hide();
}

function handleCalculateRouteResponse(response, type) {
    var geojson = response.toGeoJson();
    var coordinates = geojson.features[0].geometry.coordinates;

    clearMap();
    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': geojson
        },
        'paint': {
            'line-color': '#4a90e2',
            'line-width': 6
        }
    });
    var bounds = new tt.LngLatBounds();
    var point = {
        startPoint: coordinates[0],
        finishPoint: coordinates.slice(-1)[0]
    };
    addRouteMarkers(type, point);
    resultsManager.success();
    resultsManager.append(createSummaryContent(geojson.features[0].properties.summary));
    coordinates.forEach(function(point) {
        bounds.extend(tt.LngLat.convert(point));
    });
    map.fitBounds(bounds, { duration: 0, padding: 50 });
    loadingHint.hide();
}

function handleDrawRoute(type) {
    errorHint.hide();
    loadingHint.setMessage('Loading...');
    resultsManager.loading();
    performCalculateRouteRequest()
        .then(function(response) {
            handleCalculateRouteResponse(response, type);
        })
        .catch(handleCalculateRouteError);
}

function onResultCleared(type) {
    routePoints[type] = null;
    if (routeMarkers[type]) {
        routeMarkers[type].remove();
        routeMarkers[type] = null;
    }
    if (shouldDisplayPlaceholder()) {
        resultsManager.resultsNotFound();
    }
    if (routePoints.start || routePoints.finish) {
        var lngLat = type === 'start' ? routePoints.finish : routePoints.start;
        clearMap();
        centerMap(lngLat);
    }
}

function onResultSelected(result, type) {
    var position = result.position;

    updateMapView(type, position);
}

function performCalculateRouteRequest() {
    return tt.services.calculateRoute({
        key: apiKey,
        traffic: true,
        computeTravelTimeFor: 'all',
        computeBestOrder: true,
        travelMode: 'van',
        vehicleWidth: 3,
        vehicleLength: 7,
        vehicleHeight: 3,
        routeType: 'shortest',
        vehicleMaxSpeed: 100,
        //alternativeType: 'anyRoute',    
        maxAlternatives: null,
        locations: routePoints.start.join() + ':' + routePoints.finish.join()
    });
}

function performReverseGeocodeRequest(lngLat) {
    return tt.services.reverseGeocode({
        key: apiKey,
        position: lngLat
    });
}

function shouldDisplayPlaceholder() {
    return !(routePoints.start && routePoints.finish);
}

function updateMapView(type, position) {
    routePoints[type] = [position.lng, position.lat];
    if (routePoints.start && routePoints.finish) {
        handleDrawRoute(type);
    } else {
        addRouteMarkers(type);
        centerMap(routePoints[type]);
    }
}

function onStartPointSelect(event) {
    var selectedPoint = event.target.value;
    var positions = {
        A: { lng: 106.84513, lat: -6.21462 }, // Example coordinates for Point A
        B: { lng: 106.84513, lat: -6.21462 }, // Example coordinates for Point B
        C: { lng: 106.84513, lat: -6.21462 }, // Example coordinates for Point C
        D: { lng: 106.84513, lat: -6.21462 }  // Example coordinates for Point D
    };
    var position = positions[selectedPoint];
    updateMapView('start', position);
}
