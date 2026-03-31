const API_URL = "https://mapita.onrender.com";

const map = L.map('map').setView([20.67, -103.35], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let tipoSeleccionado = "general";
let puntos = [];
let clickLatLng = null;
let ratingSeleccionado = 0;

// 📍 GPS
navigator.geolocation.getCurrentPosition(pos => {
  const { latitude, longitude } = pos.coords;
  map.setView([latitude, longitude], 15);
});

// 🔥 EVENTO FUNCIONAL EN MÓVIL Y PC
map.on('mousedown touchstart', function(e) {
  let latlng;

  if (e.latlng) {
    latlng = e.latlng;
  } else {
    latlng = map.mouseEventToLatLng(e.originalEvent);
  }

  clickLatLng = latlng;

  console.log("CLICK DETECTADO:", latlng);

  document.getElementById("menuAccion").classList.add("activo");
});

// ❌ CERRAR MODAL
function cerrarModal() {
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("activo"));
}

// ➕ MOSTRAR FORMULARIO
function mostrarFormulario() {
  cerrarModal();
  document.getElementById("formulario").classList.add("activo");
}

// ⭐ SELECCIONAR RATING
function setRating(r) {
  ratingSeleccionado = r;

  document.querySelectorAll("#estrellas span").forEach((el, i) => {
    el.style.opacity = i < r ? "1" : "0.3";
  });
}

// 💾 GUARDAR PUNTO
async function guardarPunto() {
  console.log("GUARDAR CLICK");

  if (!clickLatLng) {
    alert("Toca el mapa primero");
    return;
  }

  const descripcion = document.getElementById("descripcion").value;

  if (!descripcion) {
    alert("Escribe una descripción");
    return;
  }

  if (!ratingSeleccionado) {
    alert("Selecciona estrellas");
    return;
  }

  console.log("ENVIANDO:", {
    lat: clickLatLng.lat,
    lng: clickLatLng.lng,
    tipo: tipoSeleccionado,
    descripcion,
    rating: ratingSeleccionado
  });

  try {
    const res = await fetch(`${API_URL}/puntos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lat: clickLatLng.lat,
        lng: clickLatLng.lng,
        tipo: tipoSeleccionado,
        descripcion,
        rating: ratingSeleccionado
      })
    });

    console.log("RESPUESTA:", await res.json());

  } catch (err) {
    console.error("ERROR FETCH:", err);
    alert("Error al guardar");
    return;
  }

  cerrarModal();
  cargarPuntos();
}

// 🔍 BUSCAR PUNTO CERCANO
function buscarPuntoCercano(lat, lng) {
  return puntos.find(p => {
    const dist = Math.sqrt((p.lat - lat)**2 + (p.lng - lng)**2);
    return dist < 0.001;
  });
}

// 👀 VER PUNTO
function verPunto() {
  if (!clickLatLng) {
    alert("Toca el mapa primero");
    return;
  }

  const p = buscarPuntoCercano(clickLatLng.lat, clickLatLng.lng);

  if (!p) {
    alert("No hay punto cercano");
    cerrarModal();
    return;
  }

  const descripcion = p.descripcion ?? "Sin descripción";
  const rating = p.rating ?? 0;

  L.popup()
    .setLatLng([p.lat, p.lng])
    .setContent(`
      <b>${p.tipo}</b><br>
      ${descripcion}<br>
      ⭐ ${rating > 0 ? "★".repeat(rating) : "Sin calificación"}
    `)
    .openOn(map);

  cerrarModal();
}

// 🔄 CARGAR PUNTOS
async function cargarPuntos() {
  const res = await fetch(`${API_URL}/puntos`);
  const data = await res.json();

  puntos = data.map(p => ({
    lat: p.lat,
    lng: p.lng,
    tipo: p.tipo || "general",
    descripcion: p.descripcion ?? "Sin descripción",
    rating: p.rating ?? 0
  }));

  // eliminar markers viejos
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // dibujar puntos
  puntos.forEach(p => {
    L.marker([p.lat, p.lng]).addTo(map);
  });
}

// 🚀 iniciar
cargarPuntos();