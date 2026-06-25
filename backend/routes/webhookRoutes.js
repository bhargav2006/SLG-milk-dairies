const express = require("express");
const router = express.Router();
const {
  verifyWebhook,
  webhookEvents,
} = require("../controllers/webhookController");

//webhook verification
router.get("/", verifyWebhook);

//webhook events
router.post("/", webhookEvents);

module.exports = router;
