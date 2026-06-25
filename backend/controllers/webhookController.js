const axios = require("axios");

exports.verifyWebhook = async (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const verifyToken = req.query["hub.verify_token"];
    console.log("mode", mode);
    console.log("challenge", challenge);
    console.log("verifyToken", verifyToken);
    if (
      mode === "subscribe" &&
      verifyToken === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
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
    const body = req.body;
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // 1. Check if it's a WhatsApp Business Account event
    if (body.object === "whatsapp_business_account") {
      // 2. Safely check if this is an incoming message
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages && // FIXED: Changed to "messages" (plural)
        body.entry[0].changes[0].value.messages[0]
      ) {
        const value = body.entry[0].changes[0].value;
        const phnNumberId = value.metadata.phone_number_id;
        const messageObj = value.messages[0];

        const messageFrom = messageObj.from;
        const messageId = messageObj.id;
        const messageTimestamp = messageObj.timestamp;

        console.log("Phone Number Id:", phnNumberId);
        console.log("Message From:", messageFrom);
        console.log("Message Id:", messageId);

        // 3. Ensure it's a text message before trying to read 'text.body'
        if (messageObj.type === "text") {
          const messageText = messageObj.text.body;
          console.log("Message Text:", messageText);
          if (messageText === "Stop" || messageText === "STOP") {
            try {
              // 4. Await the Axios call and use the Authorization header
              await axios({
                method: "POST",
                url: `https://graph.facebook.com/v25.0/${phnNumberId}/messages`,
                data: {
                  messaging_product: "whatsapp",
                  to: messageFrom,
                  text: {
                    body: "Hi.. I'm SLG",
                  },
                },
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, // Standard auth method
                },
              });
              console.log("Reply sent successfully.");
            } catch (apiError) {
              console.log(
                "Error sending WhatsApp reply:",
                apiError.response ? apiError.response.data : apiError.message,
              );
            }
          }
        }
      }

      // 5. CRITICAL: Always return 200 OK for any valid WhatsApp webhook (including read/delivered receipts)
      res.sendStatus(200);
    } else {
      // If the event is not from WhatsApp, return 404
      res.sendStatus(404);
    }
  } catch (error) {
    console.log("Error while processing webhook:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
