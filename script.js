function showAvailability() {
  const result = document.getElementById("result");

  result.innerHTML = `
    <h3>Available Transporters</h3>
    <ul>
      <li>🚲 Bike – ₹250 – ETA 30 min</li>
      <li>🛺 Toto / Auto – ₹450 – ETA 45 min</li>
      <li>🚐 Pickup Van – ₹1,100 – ETA 1.5 hrs</li>
      <li>🚚 407 Truck – ₹2,200 – ETA 3 hrs</li>
    </ul>
    <p><i>This is a demo preview for investors.</i></p>
  `;
}
