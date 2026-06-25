const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.status(200).json({ message: "Webhook received" });
});

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];
  console.log("mode", mode);
  console.log("challenge", challenge);
  console.log("verifyToken", verifyToken);
  if (mode === "subscribe" && verifyToken === process.env.WHATSAPP_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ message: "Invalid webhook" });
  }
});

module.exports = router;
