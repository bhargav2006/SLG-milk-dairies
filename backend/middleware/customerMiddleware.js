const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const customerProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.customer = await Customer.findById(decoded.id);

      if (!req.customer) {
        return res.status(401).json({
          message: "Customer not found",
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        message: "Invalid Customer Token",
      });
    }
  } else {
    return res.status(401).json({
      message: "Customer authentication required",
    });
  }
};

module.exports = {
  customerProtect,
};
