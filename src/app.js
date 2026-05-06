require("dotenv").config();
const express = require("express");
const cors = require("cors");

const globalRoutes = require("./routes/global.route");
const authRoutes = require("./routes/auth.route");
const medicoRoutes = require("./routes/medico.route");
const pacienteRoutes = require("./routes/paciente.route");
const adminRoutes = require("./routes/admin.route");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/global", globalRoutes);
app.use("/auth", authRoutes);
app.use("/medico", medicoRoutes);
app.use("/admin", adminRoutes);
app.use("/paciente", pacienteRoutes);

module.exports = app;
