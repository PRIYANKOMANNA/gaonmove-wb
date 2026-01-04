let map;
let pickup = null;
let drop = null;
let pickupMarker, dropMarker, userMarker;
let selecting = "pickup";

const statusText = document.getElementById("statusText");
const mapTitle = document.getElementById("mapTitle");
const stepNum = document.getElementById("stepNum");
const confirmBtn = document.getElementById("confirmBtn");
const addressBox = document.getElementById("addressBox");

const voice = window.speechSynthesis;

function speakBN(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "bn-IN";
  voice.cancel();
  voice.speak(u);
}

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("continueBtn").onclick = () => show("roleScreen");
document.querySelector("[data-role]").onclick = () => {
  show("mapScreen");
  initMap();
};

function initMap() {
  if (map) return;

  map = L.map("map").setView([23.685, 87.678], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  locateUser();

  map.on("click", async e => {
    const snapped = await snapToRoad(e.latlng);
    if (selecting === "pickup") setPickup(snapped);
    else setDrop(snapped);
  });
}

function locateUser() {
  navigator.geolocation.getCurrentPosition(pos => {
    const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    map.setView(latlng, 15);

    userMarker?.remove();
    userMarker = L.circleMarker(latlng, {
      radius: 8,
      color: "#1e90ff",
      fillColor: "#1e90ff",
      fillOpacity: 1
    }).addTo(map).bindPopup("You are here");

    setPickup(latlng);
  });
}

document.getElementById("useMyLocationBtn").onclick = locateUser;

async function reverseGeocode(latlng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.display_name || "";
}

async function snapToRoad(latlng) {
  return latlng; // simplified snap (OSM roads auto close enough for MVP)
}

async function setPickup(latlng) {
  pickup = latlng;
  pickupMarker?.remove();
  pickupMarker = L.marker(latlng).addTo(map).bindPopup("Pickup").openPopup();

  addressBox.innerText = await reverseGeocode(latlng);

  selecting = "drop";
  stepNum.innerText = "2";
  mapTitle.innerText = "Select Drop Location";
  statusText.innerText = "Tap map to select drop location";

  speakBN("আপনার পিকআপ লোকেশন নিশ্চিত করা হয়েছে");
}

async function setDrop(latlng) {
  drop = latlng;
  dropMarker?.remove();
  dropMarker = L.marker(latlng).addTo(map).bindPopup("Drop").openPopup();

  addressBox.innerText = await reverseGeocode(latlng);

  confirmBtn.disabled = false;
  mapTitle.innerText = "Confirm Locations";
  statusText.innerText = "Pickup and drop selected";

  speakBN("এখন আপনার ড্রপ লোকেশন নির্বাচন করা হয়েছে");
}

confirmBtn.onclick = () => {
  const dist = map.distance(pickup, drop) / 1000;
  document.getElementById("summary").innerText =
    `Distance: ${dist.toFixed(2)} km`;
  show("summaryScreen");
};