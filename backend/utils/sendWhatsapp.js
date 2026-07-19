const axios = require("axios");
const Customer = require("../models/Customer");

const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:5173";

const sendWhatsapp = async (customerNumber, invoice_number, bill_amount) => {
  try {
    // FIX: Explicitly declared variable to prevent strict mode crashes
    const amount_paid = bill_amount;

    if (!customerNumber) {
      console.log("⚠️ No customer number provided");
      return;
    }

    const tenDigitPhone =
      customerNumber.startsWith("91") && customerNumber.length === 12
        ? customerNumber.substring(2)
        : customerNumber;

    const formattedCustomer = `91${tenDigitPhone}`;

    const customer = await Customer.findOne({
      customerPhone: tenDigitPhone,
    });
    // console.log("Customer OptOut Status:", customer?.optOut);

    if (customer?.optOut) {
      // console.log(
      //   `CustomerNumber:${tenDigitPhone} opted out... not sending message`,
      // );
      return;
    } else {
      await Customer.findOneAndUpdate(
        { customerPhone: tenDigitPhone },
        { optOut: false },
        { upsert: true },
      );
      // console.log(
      //   `CustomerNumber:${tenDigitPhone} opted in... sending message`,
      // );
    }

    // CONFIGURATION NOTE: If your template URL button was created with a base URL like
    // "https://yourdomain.com", then this variable should only be the invoice_number string.
    // If your template button relies entirely on a text parameter inside the body, keep it as-is.
    const bill_link = `${frontendUrl}/bill/${invoice_number}`;

    await axios.post(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        //to: destinationNumber,
        to: formattedCustomer,
        type: "template",
        template: {
          name: "slg_invoice",
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  parameter_name: "invoice_number",
                  text: String(invoice_number),
                },
                {
                  type: "text",
                  parameter_name: "bill_amount",
                  text: String(bill_amount),
                },
                {
                  type: "text",
                  parameter_name: "amount_paid",
                  text: String(amount_paid),
                },
                {
                  type: "text",
                  parameter_name: "bill_link",
                  text: String(bill_link),
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    await Customer.findOneAndUpdate(
      { customerPhone: tenDigitPhone },
      { $inc: { msgSent: 1 } },
      { upsert: true },
    );

    // console.log("=================================");
    // console.log("✅ WhatsApp sent successfully");
    // console.log("Customer Entered:", customerNumber);
    // console.log("Message Sent To:", formattedCustomer);
    // console.log("Invoice:", invoice_number);
    // console.log("=================================");
  } catch (error) {
    // console.log("=================================");
    // Pro-Tip: Deep logging ensures you see the exact reason why Meta rejected a request
    console.error(
      "❌ WhatsApp Error:",
      error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message,
    );
    // console.log("=================================");
  }
};

module.exports = sendWhatsapp;
