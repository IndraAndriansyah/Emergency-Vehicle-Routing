/*dari sini poi incident*/
function makeResultItemSelected(markerId) {
  var selectedIncidentElementClassList = document.querySelector('div[data-id="' + markerId + '"]').classList,
    selectedMarker = incidentsMarkers[markerId],
    offsetY = Math.floor(selectedMarker.getPopup().getElement().getBoundingClientRect().height * 0.5);
  selectedIncidentId = markerId;
  map.flyTo({
    center: incidentsMarkers[markerId].getLngLat(),
    offset: [0, offsetY],
    speed: 0.5
  });
  [].slice.call(document.querySelectorAll('.tt-incidents-list__item'))
    .forEach(function(DOMElement) {
        DOMElement.classList.remove(selectedClass);
    });
  selectedIncidentElementClassList.add(selectedClass);
}