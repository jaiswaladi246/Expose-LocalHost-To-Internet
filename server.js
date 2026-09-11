const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const startedAt = new Date();

app.disable("x-powered-by");
app.use(express.static("public"));

const buildStatus = () => ({
  status: "healthy",
  service: "DevOps Shack Node.js App",
  message: "Hello from the DevOps Shack deployment lab!",
  runtime: `Node.js ${process.version}`,
  environment: process.env.NODE_ENV || "development",
  host: HOST,
  port: Number(PORT),
  uptimeSeconds: Math.floor(process.uptime()),
  startedAt: startedAt.toISOString(),
  time: new Date().toISOString()
});

app.get("/api/status", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(buildStatus());
});

app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(buildStatus());
});

app.listen(PORT, HOST, () => {
  console.log(`DevOps Shack application running at http://localhost:${PORT}`);
});
