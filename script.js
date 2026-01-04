/* ==================================================
   GaonMove WB – Fresh Stable JS
   ================================================== */

/* ---------- DOM ELEMENTS ---------- */
const screens = document.querySelectorAll(".screen");

const mobileInput = document.getElementById("mobile");
const continueBtn = document.getElementById("continueBtn");

const roleButtons = document.querySelectorAll("[data-role]");

/* ---------- SCREEN NAVIGATION ---------- */
function showScreen(id) {
  screens.forEach(screen => screen.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

/* ---------- LOGIN LOGIC ---------- */
// Disable button initially
continueBtn.disabled = true;

// Enable Continue only when 10-digit mobile entered
mobileInput.addEventListener("input", () => {
  const value = mobileInput.value.replace(/\D/g, "");
  mobileInput.value = value;

  continueBtn.disabled = value.length !== 10;
});

// Continue → Role screen
continueBtn.addEventListener("click", () => {
  if (mobileInput.value.length === 10) {
    showScreen("roleScreen");
  }
});

/* ---------- ROLE SELECTION ---------- */
roleButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const role = btn.dataset.role;

    if (role === "customer") {
      showScreen("mapScreen");
      initMap();
    }
  });
});

/* ---------- MAP (BASIC, SAFE) ---------- */
let map;

function initMap() {
  if (map) return;

  map = L.map("map").setView([23.685, 87.678], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // Fix map render inside hidden screen
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}

/* ---------- INIT ---------- */
showScreen("loginScreen");