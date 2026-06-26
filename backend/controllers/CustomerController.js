const CustomerRecord = require("../models/CustomerRecord");

exports.getCustomerRecords = async (req, res) => {
  try {
    const customerRecords = await CustomerRecord.find();
    res.status(200).json(customerRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerRecordByPhone = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const customerRecord = await CustomerRecord.findOne({ customerPhone });
    if (!customerRecord) {
      return res.status(404).json({ message: "Customer record not found" });
    }
    res.status(200).json(customerRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCustomerRecord = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const {
      customerName,
      customerEmail,
      optOut,
      loyaltyPoints,
      productsHistory,
    } = req.body;
    const customerRecord = await CustomerRecord.findOne({ customerPhone });
    if (!customerRecord) {
      return res.status(404).json({ message: "Customer record not found" });
    } else {
      if (customerName !== undefined)
        customerRecord.customerName = customerName;
      if (customerEmail !== undefined)
        customerRecord.customerEmail = customerEmail;
      if (optOut !== undefined) customerRecord.optOut = optOut;
      if (loyaltyPoints !== undefined)
        customerRecord.loyaltyPoints = loyaltyPoints;
      if (productsHistory?.length) {
        customerRecord.productsHistory.push(...productsHistory);
      }
    }
    await customerRecord.save();
    res.status(200).json(customerRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCustomerRecord = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const customerRecord = await CustomerRecord.findOneAndDelete({
      customerPhone,
    });
    if (!customerRecord) {
      return res.status(404).json({ message: "Customer record not found" });
    }
    res.json({
      message: "Customer deleted successfully",
      customerRecord,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
