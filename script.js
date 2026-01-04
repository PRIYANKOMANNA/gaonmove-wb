/* =========================================
   GaonMove WB – Pickup → Drop Flow (FINAL)
   ========================================= */

let map;
let pickup = null;
let drop = null;
let pickupMarker = null;
let dropMarker = null;
let routeLine = null;

let stage = "pickup"; // pickup | drop

/* ---------- DOM ---------- */
const screens = document.querySelectorAll(".screen");

const mobileInput = document.getElementById("mobile");
const continueBtn = document.getElementById("continueBtn");

const statusText = document.getElementById("statusText");
const mapTitle = document.getElementById("mapTitle");
const stepNum = document.getElementById("stepNum");

const useMyLocationBtn = document.getElementById("useMyLocationBtn");
const confirmBtn = document.getElementById("confirmBtn");

const weightInput = document.getElementById("weight");
const vehicleSelect = document.getElementById("vehicle");

const summaryText = document.getElementById("summary");

/* ---------- SCREEN NAV ---------- */
function showScreen(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "mapScreen" && map) {
    setTimeout(() => map.invalidateSize(), 300);
  }
}

/* ---------- LOGIN ---------- */
continueBtn.disabled = true;

mobileInput.addEventListener("input", () => {
  const v = mobileInput.value.replace(/\D/g, "");
  mobileInput.value = v;
  continueBtn.disabled = v.length !== 10;
});

continueBtn.addEventListener("click", () => {
  if (mobileInput.value.length === 10) {
    showScreen("roleScreen");
  }
});

/* ---------- ROLE ---------- */
document.querySelector("[data-role='customer']").addEventListener("click", () => {
  showScreen("mapScreen");
  initMap();
});

/* ---------- MAP ---------- */
function initMap() {
  if (map) return;

  map = L.map("map").setView([23.685, 87.678], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  map.on("click", onMapClick);
}

/* ---------- USE MY LOCATION ---------- */
useMyLocationBtn.addEventListener("click", () => {
  statusText.innerText = "Detecting your location…";

  navigator.geolocation.getCurrentPosition(
    pos => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];
      map.setView(latlng, 15);

      if (pickupMarker) map.removeLayer(pickupMarker);
      pickup = latlng;

      pickupMarker = L.marker(latlng)
        .addTo(map)
        .bindPopup("Pickup location")
        .openPopup();

      stage = "drop";
      stepNum.innerText = "2";
      mapTitle.innerText = "Select Drop Location";
      statusText.innerText = "Now tap map to select drop location";

      confirmBtn.disabled = true;
    },
    () => {
      statusText.innerText = "Unable to detect location";
    },
    { enableHighAccuracy: true }
  );
});

/* ---------- MAP CLICK ---------- */
function onMapClick(e) {
  if (stage !== "drop") return;

  const latlng = [e.latlng.lat, e.latlng.lng];
  drop = latlng;

  if (dropMarker) map.removeLayer(dropMarker);
  dropMarker = L.marker(latlng)
    .addTo(map)
    .bindPopup("Drop location")
    .openPopup();

  drawRoute();
  confirmBtn.disabled = false;

  statusText.innerText = "Drop selected. Confirm to continue";
}

/* ---------- ROUTE + CALC ---------- */
function drawRoute() {
  if (routeLine) map.removeLayer(routeLine);

  routeLine = L.polyline([pickup, drop], {
    color: "#0a3d62",
    weight: 4
  }).addTo(map);

  map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
}

/* ---------- CONFIRM ---------- */
confirmBtn.addEventListener("click", () => {
  if (!pickup || !drop) return;

  const distanceKm = map.distance(pickup, drop) / 1000;

  const ratePerKm = 40;
  const vehicleMultiplier = {
    bike: 1,
    auto: 1.3,
    pickup: 1.6,
    truck: 2.2
  };

  const vehicle = vehicleSelect.value;
  const weight = parseFloat(weightInput.value) || 1;

  let fare = distanceKm * ratePerKm * vehicleMultiplier[vehicle];
  if (weight > 20) fare += 50;

  fare = Math.round(fare);

  summaryText.innerText =
    `Distance: ${distanceKm.toFixed(2)} km\n` +
    `Vehicle: ${vehicle}\n` +
    `Estimated Fare: ₹${fare}`;

  showScreen("summaryScreen");
});

/* ---------- INIT ---------- */
showScreen("loginScreen");