const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.route");
const medicoRoutes = require("./routes/medico.route");
const citaRoutes = require("./routes/cita.route");
const pacienteMedicoRoutes = require("./routes/pacienteMedico.route");
const medicamentoRoutes = require("./routes/medicamento.route");
const asistenciaRoutes = require("./routes/asistenciaCita.route");
const historialPaciente = require("./routes/historialPaciente.route");
const recetaRoutes = require("./routes/receta.route");
const recetaMedicamentoRoutes = require("./routes/recetaMedicamento.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/medico", medicoRoutes);
app.use("/citas", citaRoutes);
app.use("/paciente", pacienteMedicoRoutes);
app.use("/medicina", medicamentoRoutes);
app.use("/asistencia", asistenciaRoutes);
app.use("/paciente", historialPaciente);
app.use("/receta", recetaRoutes);
app.use("/recetaMedicamento", recetaMedicamentoRoutes);

module.exports = app;
