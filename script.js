let map;
let pickupMarker = null;
let dropMarker = null;
let step = 0;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });

  const screen = document.getElementById(id);
  screen.classList.add('active');

  if (id === 'mapScreen') {
    setTimeout(() => {
      initMap();
      map.invalidateSize();
    }, 300);
  }
}

function goToRole() {
  showScreen('roleScreen');
}

function goToMap() {
  showScreen('mapScreen');
}

function initMap() {
  if (map) return;

  map = L.map('map').setView([23.685, 87.678], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  map.on('click', function (e) {
    if (step === 0) {
      if (pickupMarker) map.removeLayer(pickupMarker);

      pickupMarker = L.marker(e.latlng)
        .addTo(map)
        .bindPopup("📍 Pickup Location")
        .openPopup();

      step = 1;
    } else {
      if (dropMarker) map.removeLayer(dropMarker);

      dropMarker = L.marker(e.latlng)
        .addTo(map)
        .bindPopup("🏁 Drop Location")
        .openPopup();

      step = 0;
    }
  });
}

function confirmLocations() {
  if (!pickupMarker || !dropMarker) {
    alert("Please select both pickup and drop locations");
    return;
  }
  showScreen('vehicleScreen');
}