const API_KEY = "e66a8629805b4161aa7c9d66f2dddbbc";

let startCoords = [60.1699, 24.9384];
let isoLayer = null;
let destMarker = null;
let startMarker = null;
let timer = null;

const map = L.map("map", { zoomControl: true, scrollWheelZoom: true, dragging: true })
  .setView(startCoords, 8);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "© OpenStreetMap · © CARTO"
}).addTo(map);

function makeDot(color) {
  return L.divIcon({
    className: "",
    iconAnchor: [6, 6],
    html: `<div style="width:16px;height:16px;background:${color};border-radius:50%;border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,0.25)"></div>`
  });
}

startMarker = L.marker(startCoords, { icon: makeDot("#2a5c24") }).addTo(map).bindTooltip("Helsinki");

function calcRange(base, temp, kg) {
  let range = base;

  if (temp >= 15) range = base * 1.0;
  else if (temp >= 5) range = base * 0.90;
  else if (temp >= 0) range = base * 0.80;
  else if (temp >= -10) range = base * 0.70;
  else if (temp >= -20) range = base * 0.50;
  else range = base * 0.40;

  let weightFactor = 1.0 - ((kg - 75) / 10) * 0.04;
  if (weightFactor < 0.80) weightFactor = 0.80;
  if (weightFactor > 1.10) weightFactor = 1.10;

  return Math.round(range * weightFactor);
}

async function fetchIsoline(rangeKm) {
  document.getElementById("loadingOverlay").classList.add("visible");

  const url = `https://api.geoapify.com/v1/isoline?lat=${startCoords[0]}&lon=${startCoords[1]}&type=distance&mode=bicycle&range=${rangeKm * 1000}&apiKey=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (isoLayer) map.removeLayer(isoLayer);
  isoLayer = L.geoJSON(data, {
    style: { color: "#2a5c24", fillColor: "#2a5c24", weight: 1.5, fillOpacity: 0.12 }
  }).addTo(map);

  document.getElementById("loadingOverlay").classList.remove("visible");
}

function update() {
  const temp = parseInt(document.getElementById("tempSlider").value);
  const kg = parseInt(document.getElementById("massSlider").value);
  const base = parseInt(document.getElementById("bikeSelect").value);
  const range = calcRange(base, temp, kg);

  const sign = temp >= 0 ? "+" : "";
  document.getElementById("tempVal").textContent = sign + temp + "°C";
  document.getElementById("massVal").textContent = kg + " kg";
  document.getElementById("rangeNum").innerHTML = range + " km";

  clearTimeout(timer);
  timer = setTimeout(() => fetchIsoline(range), 550);
}

document.getElementById("tempSlider").addEventListener("input", update);
document.getElementById("massSlider").addEventListener("input", update);
document.getElementById("bikeSelect").addEventListener("change", update);

let startTimer = null;
document.getElementById("startInput").addEventListener("input", function() {
  clearTimeout(startTimer);
  const q = document.getElementById("startInput").value.trim();
  if (!q) return;

  startTimer = setTimeout(async function() {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(q)}&apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const lon = data.features[0].geometry.coordinates[0];
    const lat = data.features[0].geometry.coordinates[1];

    startCoords = [lat, lon];
    startMarker.remove();
    startMarker = L.marker(startCoords, { icon: makeDot("#2a5c24") }).addTo(map).bindTooltip(q);
    map.setView(startCoords, 7);
    update();
  }, 700);
});

let destTimer = null;
document.getElementById("destInput").addEventListener("input", function() {
  clearTimeout(destTimer);
  const q = document.getElementById("destInput").value.trim();

  if (!q) {
    if (destMarker) {
      map.removeLayer(destMarker);
      destMarker = null;
    }
    return;
  }

  destTimer = setTimeout(async function() {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(q)}&apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const lon = data.features[0].geometry.coordinates[0];
    const lat = data.features[0].geometry.coordinates[1];

    if (destMarker) map.removeLayer(destMarker);
    destMarker = L.marker([lat, lon], { icon: makeDot("#e74c3c") }).addTo(map).bindTooltip(q);
  }, 700);
});

update();