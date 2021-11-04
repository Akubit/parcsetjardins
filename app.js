// DOM Items
const ville=document.getElementById("villes");
const gardens=document.getElementById("gardens");
const infos=document.getElementById("informations");
const reset=document.getElementById("reset-btn");

// Variables
let data = []
let cities = []
let markers = []
let url = 'https://eukavlin.github.io/opendata-parcsjardins/data.json';


// Mapbox 
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxpc2Vicm8iLCJhIjoiY2t2YXFuZndzMGh2ZzJvcGdwd3VlbTNvZSJ9.QnDlUDThnrwQ83VEgSqSWg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  zoom: 8,
  center: [5.021345, 43.535292],
  attributionControl: false
  })
  .addControl(new mapboxgl.AttributionControl({
    customAttribution: 'Tiny project hand-made by Élise Brodin'
    }))
  .addControl(new mapboxgl.NavigationControl());

let points = {
  'type': 'FeatureCollection',
  'features': []
}

// Create feature points data 
function createPoint(parc) {
  return {
    "type": parc.soustype,
    "geometry": {
      "type": "Point",
      "coordinates": [parc.longitude, parc.latitude]
    },
    "properties": {
      "title": parc.raisonsociale,
      'iconSize': [50, 50]
    }
  }
}

// Create a marker on the map
function createMarker (feature, center = [5.021345, 43.535292], zoom = 8) {
  if (markers !== []) {
    for (let marker of markers) {
      marker.remove()
    }
    markers = []
  }
    for (let marker of feature) {
      const popup = new mapboxgl.Popup({ offset: 25 }).setText(
        marker.properties.title
        );

      let newMarker = new mapboxgl.Marker({
        color: "#3FB1CE",
      })
      .setLngLat(marker.geometry.coordinates)
      .setPopup(popup)
      .addTo(map);
      
      markers.push(newMarker)
    } 
    
    map.flyTo({center: center, zoom: zoom})
}


// Display all parcs on side list and map
async function renderList() {
  
  let response = await fetch(url);
  let result = await response.json();
  data = result.d

  reset.style.display = "none"

  for (let item of cities.sort(function(a, b){ return a > b})) {
    ville.innerHTML += `<option value="${item}"">${item}</option>`
  }

  for (let parc of data) {
    if (!cities.includes(parc.ville)) {cities.push(parc.ville)}
    gardens.innerHTML += `<li class='${parc.entityid}' data='${parc}'>${parc.raisonsociale}</li>`

    points.features.push(createPoint(parc));

  }

  createMarker(points.features)


}


// Event listeners 

// Display all parcs on document load
document.addEventListener('load', renderList());


// Filter cities on city selection on <select> tag above parc list
ville.addEventListener('change', function () {
  if (ville.value !== '') {
    gardens.innerHTML = data.filter(parc => parc.ville === ville.value)
  .map(parc => `<li class='${parc.entityid}' data='${parc}'>${parc.raisonsociale}</li>`)
  .join("")
  } else {
    gardens.innerHTML = ''
    renderList()
  }
})

// When clicking on a link of the list, focus on the selected parc in the map and display extra informations about it.
gardens.addEventListener('click', function(e) {
  if (e.target && e.target.matches("li")) {
    reset.style.display = "inline-block"
    let parcData = []
      parcData = data.filter(element => element.entityid == e.target.className)[0]
      points.features = [{
        "type": parcData.soustype,
        "geometry": {
          "type": "Point",
          "coordinates": [parcData.longitude, parcData.latitude]
        },
        "properties": {
          "title": parcData.raisonsociale,
          'iconSize': [50, 50]
        }
      }];

      createMarker(points.features, points.features[0].geometry.coordinates, 16)
      infos.innerHTML = `<h2>${parcData.raisonsociale}</h2>
      <p>${parcData.soustype}</p>
      <p>${parcData.codepostal} ${parcData.ville}</p>
      <p>Tél: ${parcData.tlphone}</p>
      `
    }
})

// The reset button just shows the entire list and all the locations on the map.
reset.addEventListener('click', function() {
  renderList()
})