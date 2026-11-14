/* ============================================================
   REPRODUCTOR DE MÚSICA (barra de abajo)
   Es lo único de JavaScript de la página. Si lo borras, las
   canciones se siguen escuchando con su reproductor normal.
   ============================================================ */

// Todas las canciones de la página (cada una con su <audio>)
const tarjetas = document.querySelectorAll(".cancion");
const audios = document.querySelectorAll(".cancion audio");

// Piezas de la barra de abajo
const barra = document.getElementById("reproductor");
const botonPausa = document.getElementById("rp-pausa");
const botonAleatorio = document.getElementById("rp-aleatorio");

let actual = 0;          // número de la canción que suena
let aleatorio = false;   // ¿está activado el botón de aleatorio?

// Convierte segundos a minutos:segundos (ej: 83 -> 1:23)
function mmss(segundos) {
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return m + ":" + (s < 10 ? "0" : "") + s;
}

// Actualiza la barra roja y el minuto
function actualizarTiempo() {
  const audio = audios[actual];
  const total = audio.duration || 0;
  const porcentaje = total ? (audio.currentTime / total) * 100 : 0;
  document.getElementById("rp-progreso").style.width = porcentaje + "%";
  document.getElementById("rp-tiempo").textContent = mmss(audio.currentTime) + " / " + mmss(total);
}

// Muestra la barra con la canción que está sonando
function mostrar(n) {
  audios.forEach(function (audio, i) {
    if (i !== n) audio.pause();   // solo una canción a la vez
  });
  actual = n;
  const tarjeta = tarjetas[n];
  document.getElementById("rp-portada").src = tarjeta.querySelector("img").src;
  document.getElementById("rp-titulo").textContent = tarjeta.querySelector("h3").textContent;
  document.getElementById("rp-artista").textContent = tarjeta.querySelector(".detalle").textContent;
  barra.classList.add("activo");
  document.body.classList.add("con-reproductor");
  botonPausa.innerHTML = "&#9208;";
  actualizarTiempo();
}

// Pasa a la siguiente (paso = 1) o a la anterior (paso = -1)
function cambiar(paso) {
  let siguiente = (actual + paso + audios.length) % audios.length;
  if (aleatorio && audios.length > 1) {
    do {
      siguiente = Math.floor(Math.random() * audios.length);
    } while (siguiente === actual);
  }
  audios[siguiente].currentTime = 0;
  audios[siguiente].play();
}

// Avisos de cada canción: cuando suena, se pausa, avanza el tiempo o termina
audios.forEach(function (audio, n) {
  audio.addEventListener("play", function () { mostrar(n); });
  audio.addEventListener("pause", function () {
    if (n === actual) botonPausa.innerHTML = "&#9654;";
  });
  audio.addEventListener("timeupdate", function () {
    if (n === actual) actualizarTiempo();
  });
  audio.addEventListener("loadedmetadata", function () {
    if (n === actual) actualizarTiempo();
  });
  audio.addEventListener("ended", function () { cambiar(1); });
});

// Botones de la barra
document.getElementById("rp-siguiente").onclick = function () { cambiar(1); };
document.getElementById("rp-anterior").onclick = function () { cambiar(-1); };

botonPausa.onclick = function () {
  if (audios[actual].paused) audios[actual].play();
  else audios[actual].pause();
};

document.getElementById("rp-reiniciar").onclick = function () {
  audios[actual].currentTime = 0;
  audios[actual].play();
};

botonAleatorio.onclick = function () {
  aleatorio = !aleatorio;
  botonAleatorio.classList.toggle("on", aleatorio);
};

// Clic en la barra roja para ir a otro minuto
document.getElementById("rp-barra").onclick = function (evento) {
  const caja = this.getBoundingClientRect();
  const audio = audios[actual];
  if (audio.duration) {
    audio.currentTime = ((evento.clientX - caja.left) / caja.width) * audio.duration;
  }
};

// Botón X: cierra el reproductor y detiene la canción
document.getElementById("rp-cerrar").onclick = function () {
  audios[actual].pause();
  barra.classList.remove("activo");
  document.body.classList.remove("con-reproductor");
};
