const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
const sendWhatsapp = async (customerNumber, invoiceNumber, totalAmount) => {
  console.log("=================================");
  console.log("WHATSAPP MESSAGE");
  console.log("To:", customerNumber);
  console.log("Message:");
  console.log(`Hello,

Thank you for visiting Sri Sai Dairy Parlour.

Invoice: ${invoiceNumber} 
Bill Amount: ₹${totalAmount}
Final Paid: ₹${totalAmount}

To view your bill, use the following link:
${frontendUrl}/bill/${invoiceNumber}

We look forward to serving you again.
`);
  console.log("=================================");
};

module.exports = sendWhatsapp;
