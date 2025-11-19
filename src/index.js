import express from "express";
import "dotenv/config";
import kommoRouter from "./routes/kommo.route.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use("/kommo", kommoRouter);

app.listen(PORT, () => {
  console.log(`Server running 🏃`);
});

app.post("/kommo/webhook", (req, res) => {
  console.log("======== WEBHOOK RECIBIDO ========");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("===================================");
  res.sendStatus(200);
});