const axios = require("axios");

exports.verifyWebhook = async (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const verifyToken = req.query["hub.verify_token"];
    console.log("mode", mode);
    console.log("challenge", challenge);
    console.log("verifyToken", verifyToken);
    if (mode === "subscribe" && verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ message: "Invalid webhook" });
    }
  } catch (error) {
    console.log("Error while verifying webhook:", error);
    res.status(500).json({ message: "Failed to verify webhook" });
  }
};

exports.webhookEvents = async (req, res) => {
  try {
    const message = req.body;
    console.log("Message received:", message);
    if (message.object) {
      if (
        message.entry &&
        message.entry[0].changes &&
        message.entry[0].changes[0].value.message &&
        message.entry[0].changes[0].value.message[0]
      ) {
        const phnNumberId =
          message.entry[0].changes[0].value.metadata.phone_number_id;
        const messageFrom = message.entry[0].changes[0].value.message[0].from;
        const messageText =
          message.entry[0].changes[0].value.message[0].text.body;
        const messageId = message.entry[0].changes[0].value.message[0].id;
        const messageTimestamp =
          message.entry[0].changes[0].value.message[0].timestamp;
        console.log("Phone Number Id", phnNumberId);
        console.log("Message From", messageFrom);
        console.log("Message Text", messageText);
        console.log("Message Id", messageId);
        console.log("Message Timestamp", messageTimestamp);

        axios({
          method: "POST",
          url:
            "https://graph.facebook.com/v13.0/" +
            phnNumberId +
            "/messages?access_token=" +
            process.env.WHATSAPP_TOKEN,
          data: {
            messaging_product: "whatsapp",
            to: messageFrom,
            text: {
              body: "Hi.. I'm SLG",
            },
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
        res.sendStatus(200);
      } else {
        res.status(400).json({ message: "Invalid request" });
      }
    }
  } catch (error) {
    console.log("Error while receiving webhook:", error);
    res.status(500).json({ message: "Failed to receive webhook" });
  }
};
