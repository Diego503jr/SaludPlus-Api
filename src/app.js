require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.route");
const medicoRoutes = require("./routes/medico.route");
const citaRoutes = require("./routes/cita.route");
const adminRoutes = require("./routes/admin.route.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/medico", medicoRoutes);
app.use("/admin", adminRoutes);
app.use("/citas", medicoRoutes);
app.use("/medicina", medicoRoutes);
app.use("/asistencia", medicoRoutes);
app.use("/paciente", medicoRoutes);
app.use("/receta", medicoRoutes);
app.use("/recetaMedicamento", medicoRoutes);
app.use("/api/citas", citaRoutes);

module.exports = app;
