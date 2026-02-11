const fs = require("fs");
const path = require("path");

// ===== IMPORTS =====
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// ===== APP =====
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// ===== DATOS SIMULADOS =====
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

// ===== ENDPOINTS =====

// Endpoint de prueba (muy importante)
app.get("/", (req, res) => {
  res.send("API simulador kiosco activa");
});

// Enviar UN evento
app.post("/simular", (req, res) => {
  const evento = generarEvento();

  console.log("📤 Enviando evento al kiosco:", evento);

  io.emit("nuevo-evento", evento);

  res.json({
    mensaje: "Evento simulado enviado",
    evento
  });
});

// ===== SOCKET =====
io.on("connection", (socket) => {
  console.log("✅ Kiosco conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Kiosco desconectado:", socket.id);
  });
});

// ===== SERVIDOR (RENDER FRIENDLY) =====
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log("Servidor escuchando en puerto", PORT);
});
