function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

function goToRole() {
  showScreen('roleScreen');
}

function goToBooking() {
  showScreen('bookingScreen');
}

function showVehicles() {
  showScreen('vehicleScreen');
}