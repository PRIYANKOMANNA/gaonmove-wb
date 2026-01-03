let map, pickupMarker, dropMarker, routeLine;
let pickup, drop;
let selecting = "pickup";

const BOOKING_ID = "GM" + Date.now();
const SHEET_API = "PASTE_YOUR_WEB_APP_URL_HERE";

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === "mapScreen") setTimeout(() => map.invalidateSize(), 300);
}

function goToRole() {
  showScreen("roleScreen");
}

function goToMap() {
  showScreen("mapScreen");
  initMap();
}

function initMap() {
  if (map) return;

  map = L.map('map').setView([23.685, 87.678], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  map.on("click", e => {
    if (selecting === "pickup") {
      pickup = e.latlng;
      pickupMarker = L.marker(pickup).addTo(map).bindPopup("Pickup").openPopup();
      log("pickup", pickup.lat, pickup.lng);
      selecting = "drop";
      document.getElementById("statusText").innerText = "Now select Drop";
    } else {
      drop = e.latlng;
      dropMarker = L.marker(drop).addTo(map).bindPopup("Drop").openPopup();
      drawRoute();
      finishTrip();
    }
  });
}

function drawRoute() {
  routeLine = L.polyline([pickup, drop], { color: "blue" }).addTo(map);
}

function finishTrip() {
  const distance = map.distance(pickup, drop) / 1000;
  const fare = Math.round(40 * distance);

  log("drop", drop.lat, drop.lng, distance.toFixed(2), fare);

  document.getElementById("summary").innerText =
    `Booking: ${BOOKING_ID}\nDistance: ${distance.toFixed(2)} km\nFare: ₹${fare}`;

  showScreen("vehicleScreen");
}

function log(type, lat, lng, distance="", fare="") {
  fetch(SHEET_API, {
    method: "POST",
    body: JSON.stringify({
      bookingId: BOOKING_ID,
      type,
      lat,
      lng,
      distance,
      fare
    })
  });
}