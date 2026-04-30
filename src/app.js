const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.route");
const medicoRoutes = require("./routes/medico.route");
const citaRoutes = require("./routes/cita.route");
const pacienteMedicoRoutes = require("./routes/pacienteMedico.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/medico", medicoRoutes);
app.use("/citas", citaRoutes);
app.use("/paciente", pacienteMedicoRoutes);

module.exports = app;
