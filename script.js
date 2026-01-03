const RATE = 40;
const VEHICLE_MULTIPLIER = {
  bike: 1,
  auto: 1.2,
  pickup: 1.5,
  truck: 2.2
};

let state = {
  role: "",
  pickup: null,
  drop: null,
  map: null,
  markers: [],
  transporters: [],
};

const els = {
  screens: document.querySelectorAll(".screen"),
  mobile: mobile,
  continueBtn,
  statusText,
  confirmBtn,
  summary,
  weight,
  vehicle,
  payBtn,
  paidBtn,
  goOnlineBtn,
  jobCard,
  acceptJobBtn,
  adminTable: document.querySelector("#adminTable tbody"),
};

function show(id){
  els.screens.forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

mobile.addEventListener("input",()=>continueBtn.disabled=mobile.value.length!==10);
continueBtn.onclick=()=>show("roleScreen");

document.querySelectorAll("[data-role]").forEach(b=>{
  b.onclick=()=>{
    state.role=b.dataset.role;
    if(state.role==="customer"){ show("mapScreen"); initMap(); }
    if(state.role==="transporter"){ show("transporterScreen"); }
  };
});

adminBtn.onclick=()=>{ show("adminScreen"); loadAdmin(); };

function initMap(){
  if(state.map) return;
  state.map=L.map("map").setView([23.6,87.6],7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(state.map);

  spawnTransporters();

  state.map.on("click",e=>{
    if(!state.pickup){
      state.pickup=e.latlng;
      addMarker(e.latlng,"Pickup");
      statusText.innerText="Select Drop";
    } else {
      state.drop=e.latlng;
      addMarker(e.latlng,"Drop");
      confirmBtn.disabled=false;
    }
  });
}

function addMarker(latlng,label){
  const m=L.marker(latlng).addTo(state.map).bindPopup(label);
  state.markers.push(m);
}

confirmBtn.onclick=()=>{
  const dist=state.map.distance(state.pickup,state.drop)/1000;
  const fare=Math.round(dist*RATE*VEHICLE_MULTIPLIER[vehicle.value]);
  summary.innerText=`Distance: ${dist.toFixed(2)} km\nFare: ₹${fare}`;
  show("summaryScreen");
};

payBtn.onclick=()=>show("paymentScreen");
paidBtn.onclick=()=>alert("Payment successful (Demo)");

/* TRANSPORTER */
goOnlineBtn.onclick=()=>{
  jobCard.classList.remove("hidden");
};
acceptJobBtn.onclick=()=>{
  alert("Job accepted!");
};

/* NEARBY TRANSPORTERS */
function spawnTransporters(){
  for(let i=0;i<5;i++){
    const lat=23.5+Math.random();
    const lng=87+Math.random();
    const m=L.circleMarker([lat,lng],{radius:6,color:"green"}).addTo(state.map);
    moveDot(m);
  }
}
function moveDot(m){
  setInterval(()=>{
    const p=m.getLatLng();
    m.setLatLng([p.lat+(Math.random()-0.5)*0.01,p.lng+(Math.random()-0.5)*0.01]);
  },2000);
}

/* ADMIN */
function loadAdmin(){
  // Demo data
  [["GM123",12,"₹480"],["GM124",8,"₹320"]].forEach(r=>{
    const tr=document.createElement("tr");
    r.forEach(c=>{
      const td=document.createElement("td");
      td.innerText=c;
      tr.appendChild(td);
    });
    els.adminTable.appendChild(tr);
  });
}