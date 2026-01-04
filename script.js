/* =========================================
   GaonMove WB – Stable JS with Location Fix
   ========================================= */

let map;
let pickupMarker = null;
let userMarker = null;

/* ---------- DOM ---------- */
const screens = document.querySelectorAll(".screen");
const mobileInput = document.getElementById("mobile");
const continueBtn = document.getElementById("continueBtn");
const useMyLocationBtn = document.getElementById("useMyLocationBtn");
const statusText = document.getElementById("statusText");

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
}

/* ---------- USE MY LOCATION (FIXED) ---------- */
useMyLocationBtn.addEventListener("click", () => {
  statusText.innerText = "Detecting your location…";

  if (!navigator.geolocation) {
    statusText.innerText = "Location not supported on this device";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const latlng = [lat, lng];

      map.setView(latlng, 15);

      // User location dot
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker(latlng, {
        radius: 8,
        color: "#1e90ff",
        fillColor: "#1e90ff",
        fillOpacity: 1
      }).addTo(map).bindPopup("You are here").openPopup();

      // Pickup marker
      if (pickupMarker) map.removeLayer(pickupMarker);
      pickupMarker = L.marker(latlng)
        .addTo(map)
        .bindPopup("Pickup location")
        .openPopup();

      statusText.innerText = "Pickup set to your current location";

      // Safari rendering fix
      setTimeout(() => map.invalidateSize(), 300);
    },
    err => {
      if (err.code === 1) {
        statusText.innerText = "Location permission denied";
      } else {
        statusText.innerText = "Unable to detect location";
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
});

/* ---------- INIT ---------- */
showScreen("loginScreen");