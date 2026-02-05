const fs = require("fs");
const path = require("path");



// 1. Importamos librerías
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// 2. Creamos la app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// 3. Configuración básica
app.use(cors());
app.use(express.json());

// 4. Datos de prueba
const usuarios = ["Juan", "María", "Carlos", "Ana"];
const puertas = ["Entrada", "Oficinas", "Almacén"];
const resultados = ["Acceso permitido", "Acceso denegado"];


function obtenerImagenAleatoria() {
  const carpeta = path.join(__dirname, "imagenes");
  const archivos = fs.readdirSync(carpeta);

  const imagen = archivos[Math.floor(Math.random() * archivos.length)];
  const ruta = path.join(carpeta, imagen);

  const base64 = fs.readFileSync(ruta).toString("base64");

  return `data:image/jpeg;base64,${base64}`;
}

function generarEvento() {
  return {
    usuario: "Usuario Simulado",
    puerta: "Entrada Principal",
    resultado: Math.random() > 0.5 ? "Acceso permitido" : "Acceso denegado",
    hora: new Date().toLocaleTimeString(),
    imagen: obtenerImagenAleatoria()
  };
}




// 6. Endpoint para enviar UN evento
app.post("/simular", (req, res) => {
  const evento = generarEvento();
  io.emit("nuevo-evento", evento);

  res.json({
    mensaje: "Evento simulado enviado",
    evento
  });
});

// 7. Envío automático cada 3 segundos
let intervalo = null;

app.post("/iniciar", (req, res) => {
  if (intervalo) return res.json({ mensaje: "Ya está corriendo" });

  intervalo = setInterval(() => {
    const evento = generarEvento();
    io.emit("nuevo-evento", evento);
    console.log("Evento:", evento);
  }, 3000);

  res.json({ mensaje: "Simulación iniciada" });
});

app.post("/detener", (req, res) => {
  clearInterval(intervalo);
  intervalo = null;
  res.json({ mensaje: "Simulación detenida" });
});

// 8. Cuando un kiosco se conecta
io.on("connection", (socket) => {
  console.log("Kiosco conectado");
});

// 9. Arrancar el servidor
server.listen(4000, "192.168.1.210", () => {
  console.log("API simuladora escuchando en todas las IPs en el puerto 4000");
});
