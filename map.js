mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dGNlbiIsImEiOiJtQk5qQ3FrIn0.KXjMKddh4Gb0zqLqKlPo9g';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
  center: [145.50, -36.63], // starting position [lng, lat] - centred on Victoria, Australia
  zoom: 6.5 // starting zoom
});

// URL of data source from Vic Emergency
var url = 'https://emergency.vic.gov.au/public/osom-geojson.json';
//var url = 'osom-geojson.json';

fillcolours = [
  'match',
  ['get', 'feedType'],
  'incident',
  'hsl(30, 100%, 50%)',
  'burn-area',
  'hsl(0, 100%, 50%)',
  'warning',
  'hsl(50, 100%, 50%)',
  /* other */ '#000'
]

map.on('load', function() {

  map.addSource('vicemergency', { type: 'geojson', data: url });
  map.getSource('vicemergency').setData(url);

  map.addLayer({
    'id': 'vicemergency-poly',
    'type': 'fill',
    'source': 'vicemergency',
    'paint': {
      'fill-color': fillcolours,
      'fill-opacity': 0.4
    },
    'filter': ['==', '$type', 'Polygon']
  });

  map.addLayer({
    'id': 'vicemergency-point',
    'type': 'circle',
    'source': 'vicemergency',
    'paint': {
      'circle-radius': 6,
      'circle-color':fillcolours 
    },
    'filter': ['==', '$type', 'Point']
  });

  /*
            "feedType": "incident",
        "feedType": "burn-area",
        "feedType": "incident",
        "feedType": "warning",
        */

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mouseenter', 'vicemergency-point', function(e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';

    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup
      .setLngLat(coordinates)
      .setHTML(webBody)
      .addTo(map);
  });

  map.on('mouseleave', 'vicemergency', function() {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

});
