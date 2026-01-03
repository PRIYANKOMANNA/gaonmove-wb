// GaonMove WB – Improved & safer version (January 2026)

const RATE_PER_KM_BASE = 40;

const VEHICLE_MULTIPLIER = {
  bike:   0.9,    // cheaper but limited weight/distance
  auto:   1.15,
  pickup: 1.5,
  truck:  2.3     // much higher for heavy/long hauls
};

const STATE = {
  role: "",
  pickup: null,
  drop: null,
  distance: 0,
  vehicle: "pickup",
  fare: 0,
  map: null,
  markers: [],
  transporterMarkers: [],
  bookingId: `GM${Date.now().toString(36).toUpperCase()}`
};

// ── DOM cache ────────────────────────────────────────
const els = {
  screens:          document.querySelectorAll(".screen"),
  mobile:           document.getElementById("mobile"),
  continueBtn:      document.getElementById("continueBtn"),
  statusText:       document.getElementById("statusText"),
  confirmBtn:       document.getElementById("confirmBtn"),
  vehicleSelect:    document.getElementById("vehicle"),
  summary:          document.getElementById("summary"),
  payBtn:           document.getElementById("payBtn"),
  paidBtn:          document.getElementById("paidBtn"),
  goOnlineBtn:      document.getElementById("goOnlineBtn"),
  jobCard:          document.getElementById("jobCard"),
  acceptJobBtn:     document.getElementById("acceptJobBtn"),
  adminBtn:         document.getElementById("adminBtn"),
  adminTableBody:   document.querySelector("#adminTable tbody")
};

// ── Helpers ──────────────────────────────────────────
function showScreen(id) {
  els.screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

function updateStatus(text, isError = false) {
  if (els.statusText) {
    els.statusText.textContent = text;
    els.statusText.style.color = isError ? "crimson" : "";
  }
}

function clearMarkers() {
  STATE.markers.forEach(m => m.remove());
  STATE.markers = [];
}

function addMarker(latlng, label, color = "#3388ff") {
  const marker = L.marker(latlng, {
    icon: L.divIcon({
      className: "custom-marker",
      html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
  }).addTo(STATE.map).bindPopup(label);
  STATE.markers.push(marker);
  return marker;
}

// ── Map initialization ───────────────────────────────
function initMap() {
  if (STATE.map) return;

  STATE.map = L.map("map").setView([23.68, 87.55], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19
  }).addTo(STATE.map);

  // Optional: show fake nearby transporters
  spawnFakeTransporters();

  STATE.map.on("click", e => {
    if (!STATE.pickup) {
      STATE.pickup = e.latlng;
      addMarker(e.latlng, "Pickup 📍", "#22c55e");
      updateStatus("Now tap to select Drop location");
    } else if (!STATE.drop) {
      STATE.drop = e.latlng;
      addMarker(e.latlng, "Drop 📦", "#ef4444");

      STATE.distance = STATE.map.distance(STATE.pickup, STATE.drop) / 1000;
      els.confirmBtn.disabled = false;
      updateStatus(`Distance ≈ ${STATE.distance.toFixed(1)} km – ready to confirm`);
    }
  });
}

function spawnFakeTransporters() {
  for (let i = 0; i < 6; i++) {
    const lat = 23.4 + Math.random() * 0.8;
    const lng = 87.0 + Math.random() * 0.8;
    const m = L.circleMarker([lat, lng], {
      radius: 7,
      fillColor: "#16a34a",
      color: "#fff",
      weight: 2,
      opacity: 0.9,
      fillOpacity: 0.7
    }).addTo(STATE.map);

    STATE.transporterMarkers.push(m);

    // Gentle random walk – much lighter than original
    setInterval(() => {
      const pos = m.getLatLng();
      const newLat = pos.lat + (Math.random() - 0.5) * 0.004;
      const newLng = pos.lng + (Math.random() - 0.5) * 0.006;
      m.setLatLng([newLat, newLng]);
    }, 8000); // much slower update = less CPU
  }
}

// ── Fare calculation ─────────────────────────────────
function calculateFare() {
  if (!STATE.distance) return 0;
  const mult = VEHICLE_MULTIPLIER[STATE.vehicle] || 1.0;
  return Math.round(STATE.distance * RATE_PER_KM_BASE * mult);
}

// ── Event listeners ──────────────────────────────────
els.mobile.addEventListener("input", () => {
  const val = els.mobile.value.replace(/\D/g, "").slice(0, 10);
  els.mobile.value = val;
  els.continueBtn.disabled = val.length !== 10;
});

els.continueBtn.addEventListener("click", () => {
  if (els.mobile.value.length === 10) {
    showScreen("roleScreen");
  }
});

// Role selection
document.querySelectorAll("[data-role]").forEach(btn => {
  btn.addEventListener("click", () => {
    STATE.role = btn.dataset.role;
    if (STATE.role === "customer") {
      showScreen("mapScreen");
      initMap();
    } else if (STATE.role === "transporter") {
      showScreen("transporterScreen");
    }
  });
});

els.adminBtn?.addEventListener("click", () => {
  showScreen("adminScreen");
  loadAdminDemo();
});

// Confirm button
els.confirmBtn?.addEventListener("click", () => {
  if (!STATE.pickup || !STATE.drop) return;

  STATE.vehicle = els.vehicleSelect?.value || "pickup";
  STATE.fare = calculateFare();

  const vehicleName = els.vehicleSelect?.selectedOptions[0]?.text || STATE.vehicle;

  els.summary.innerHTML = `
    Booking ID: <b>${STATE.bookingId}</b><br>
    Distance: <b>${STATE.distance.toFixed(1)} km</b><br>
    Vehicle: <b>${vehicleName}</b><br>
    Fare: <b>₹${STATE.fare}</b>
  `;

  showScreen("summaryScreen");
});

// Payment flow (demo)
els.payBtn?.addEventListener("click", () => showScreen("paymentScreen"));
els.paidBtn?.addEventListener("click", () => {
  alert(`Payment of ₹${STATE.fare} successful (Demo mode)\nBooking ${STATE.bookingId} confirmed!`);
  // Reset for next booking
  resetBooking();
  showScreen("roleScreen");
});

// Transporter demo
els.goOnlineBtn?.addEventListener("click", () => {
  els.jobCard?.classList.remove("hidden");
  els.goOnlineBtn.disabled = true;
  els.goOnlineBtn.textContent = "Online – Waiting…";
});

els.acceptJobBtn?.addEventListener("click", () => {
  alert("Job accepted! Contact customer now.");
  els.jobCard?.classList.add("hidden");
});

// ── Reset logic ──────────────────────────────────────
function resetBooking() {
  STATE.pickup = null;
  STATE.drop = null;
  STATE.distance = 0;
  STATE.fare = 0;
  clearMarkers();
  els.confirmBtn.disabled = true;
  updateStatus("Select Pickup location");
}

// ── Admin demo ───────────────────────────────────────
function loadAdminDemo() {
  if (!els.adminTableBody) return;

  els.adminTableBody.innerHTML = ""; // clear

  // Fake data – in real app you would fetch from sheet/API
  const fakeBookings = [
    { id: "GM1234a", dist: 14.2, fare: 840 },
    { id: "GM1234b", dist: 7.8,  fare: 420 },
    { id: "GM1234c", dist: 28.5, fare: 1950 },
  ];

  fakeBookings.forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${b.dist} km</td>
      <td>₹${b.fare}</td>
    `;
    els.adminTableBody.appendChild(tr);
  });
}

// ── Start ────────────────────────────────────────────
showScreen("loginScreen");