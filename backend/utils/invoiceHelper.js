const Bill = require("../models/Bill");
const Counter = require("../models/Counter");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const sendEmail = require("./sendEmail");
const sendWhatsapp = require("./sendWhatsapp");

/**
 * Creates a delivery invoice (Bill) from a successfully delivered Order,
 * updates customer loyalty points and products history, sets order invoice link,
 * and sends email/WhatsApp.
 *
 * @param {Object} order - The Order document
 */
const createInvoiceFromOrder = async (order) => {
  try {
    // 1. Fetch customer details
    const customer = await Customer.findById(order.customerId);
    if (!customer) {
      console.error(`Customer not found for order ${order.OrderNumber}`);
      return;
    }

    const customerNumber = customer.customerPhone
      ? (customer.customerPhone.startsWith("91") && customer.customerPhone.length === 12
        ? customer.customerPhone.substring(2)
        : customer.customerPhone)
      : null;

    const customerMail = customer.customerEmail || null;

    // 2. Generate sequential invoice number combining year and month (e.g. INV-D-202606-0001)
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1-indexed
    const yearMonthStr = `${year}${month.toString().padStart(2, "0")}`;
    const prefix = "INV-D"; // 'D' for online delivery things
    const counterName = `${prefix}-${yearMonthStr}`;

    const counter = await Counter.findOneAndUpdate(
      { name: counterName },
      { $inc: { sequence: 1 } },
      { returnDocument: "after", upsert: true },
    );

    const sequence = counter.sequence.toString().padStart(4, "0");
    const invoiceNumber = `${prefix}-${yearMonthStr}-${sequence}`;

    // 3. Prepare bill details
    // Match the order's actual payment method (COD, card, online)
    const paymentMethod = order.paymentMethod || "COD";
    const billType = "delivery";
    const deliveryFee = order.deliveryFee || 0;

    // Map products format from order to bill
    const products = order.products.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    // Use order's totalAmount (which includes delivery fee)
    const totalAmount = order.totalAmount || order.subtotal;

    // Create the Bill (Invoice)
    const bill = new Bill({
      invoiceNumber,
      customerNumber,
      customerMail,
      accountant: order.accountantId || null,
      products,
      totalAmount,
      paymentMethod,
      billType,
      deliveryFee,
    });

    await bill.save();
    console.log(`✅ Invoice ${invoiceNumber} created for Order ${order.OrderNumber}`);

    // Update order with the invoice number reference
    order.invoiceNumber = invoiceNumber;
    await order.save();
    console.log(`✅ Order ${order.OrderNumber} updated with invoiceNumber ${invoiceNumber}`);

    // 4. Update customer purchase history and loyalty points
    customer.productsHistory.push(
      ...products.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        invoiceNumber,
      })),
    );
    customer.loyaltyPoints += Math.floor(totalAmount / 100);
    
    if (customerMail && !customer.customerEmail) {
      customer.customerEmail = customerMail;
    }
    await customer.save();

    // 5. Build products list for email representation
    const billItems = [];
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (product) {
        const price = product.retailPrice !== undefined ? product.retailPrice : (product.price || 0);
        billItems.push({
          name: product.name,
          quantity: item.quantity,
          price: price,
          lineTotal: price * item.quantity,
        });
      }
    }

    // 6. Send Email if customer has mail
    if (customerMail) {
      let frontendUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
      const emailHtml = `
    <div style="margin:0 auto;max-width:640px;padding:24px;background:#F8FAFC;font-family:Arial,sans-serif;color:#1F2937;line-height:1.5;">
      <div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(74,144,226,0.08);">
        <div style="padding:24px 24px 20px;background:linear-gradient(135deg,#4A90E2 0%,#7ED6A7 100%);color:#FFFFFF;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">Sri Sai Dairy Parlour</p>
          <h2 style="margin:0;font-size:24px;line-height:1.2;">Invoice ${bill.invoiceNumber}</h2>
        </div>

        <div style="padding:24px;">
          <p style="margin:0 0 16px;color:#6B7280;">Thanks for shopping with us. Here is a quick summary of your order.</p>

          <table style="width:100%;margin-bottom:20px;border-collapse:collapse;border:0;">
            <tr>
              <td style="width:33.3%;padding-right:6px;border:0;vertical-align:top;">
                <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:12px;padding:12px 14px;">
                  <div style="font-size:12px;color:#6B7280;margin-bottom:4px;">Customer Number</div>
                  <div style="font-size:15px;font-weight:600;color:#1F2937;">${customerNumber || "-"}</div>
                </div>
              </td>
              <td style="width:33.3%;padding-left:3px;padding-right:3px;border:0;vertical-align:top;">
                <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:12px;padding:12px 14px;">
                  <div style="font-size:12px;color:#6B7280;margin-bottom:4px;">Order System</div>
                  <div style="font-size:15px;font-weight:600;color:#1F2937;text-transform:capitalize;">Online Delivery</div>
                </div>
              </td>
              <td style="width:33.3%;padding-left:6px;border:0;vertical-align:top;">
                <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:12px;padding:12px 14px;">
                  <div style="font-size:12px;color:#6B7280;margin-bottom:4px;">Payment Method</div>
                  <div style="font-size:15px;font-weight:600;color:#1F2937;">${paymentMethod.toUpperCase()}</div>
                </div>
              </td>
            </tr>
          </table>

          <table style="width:100%;border-collapse:collapse;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;">
            <thead>
              <tr style="background:#EBF3FC;color:#1F2937;text-align:left;">
                <th style="padding:12px;border-bottom:1px solid #E5E7EB;">Product</th>
                <th style="padding:12px;border-bottom:1px solid #E5E7EB;">Qty</th>
                <th style="padding:12px;border-bottom:1px solid #E5E7EB;">Price</th>
                <th style="padding:12px;border-bottom:1px solid #E5E7EB;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${billItems
                .map(
                  (item, index) => `
              <tr style="background:${index % 2 === 0 ? "#FFFFFF" : "#F8FAFC"};">
                <td style="padding:12px;border-bottom:1px solid #E5E7EB;">${item.name}</td>
                <td style="padding:12px;border-bottom:1px solid #E5E7EB;">${item.quantity}</td>
                <td style="padding:12px;border-bottom:1px solid #E5E7EB;">₹${item.price}</td>
                <td style="padding:12px;border-bottom:1px solid #E5E7EB;font-weight:600;">₹${item.lineTotal}</td>
              </tr>`,
                )
                .join("")}
            </tbody>
          </table>

          <table style="width:100%;margin-top:20px;background:#FFF9E6;border:1px solid #FFD166;border-radius:12px;border-collapse:collapse;border-spacing:0;">
            <tr>
              <td style="font-size:14px;color:#6B7280;padding:10px 16px;border:0;vertical-align:middle;">Subtotal</td>
              <td style="font-size:14px;font-weight:600;color:#1F2937;text-align:right;padding:10px 16px;border:0;vertical-align:middle;">₹${(totalAmount - deliveryFee).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#6B7280;padding:10px 16px;border:0;vertical-align:middle;">Delivery Fee</td>
              <td style="font-size:14px;font-weight:600;color:#1F2937;text-align:right;padding:10px 16px;border:0;vertical-align:middle;">${deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</td>
            </tr>
            <tr style="border-top:1px solid #FFD166;">
              <td style="font-size:14px;font-weight:bold;color:#1F2937;padding:16px;border:0;vertical-align:middle;">Grand Total</td>
              <td style="font-size:20px;font-weight:bold;color:#1F2937;text-align:right;padding:16px;border:0;vertical-align:middle;">₹${totalAmount.toFixed(2)}</td>
            </tr>
          </table>

          <p style="margin:20px 0 0;font-size:14px;color:#6B7280;">
            View your bill online: <a href="${frontendUrl}/bill/${bill.invoiceNumber}" style="color:#4A90E2;">Open bill</a>
          </p>
        </div>
      </div>
    </div>
  `;

      sendEmail(customerMail, `Invoice ${bill.invoiceNumber}`, emailHtml).catch(
        (err) => {
          console.error("Failed to send email:", err);
        },
      );
    }

    // 7. Send WhatsApp message (simulated)
    if (customerNumber) {
      sendWhatsapp(customerNumber, invoiceNumber, totalAmount).catch((err) => {
        console.error("Failed to send WhatsApp message:", err);
      });
    }
  } catch (error) {
    console.error(`Error creating invoice from order ${order.OrderNumber}:`, error);
  }
};

module.exports = { createInvoiceFromOrder };
