const jwt = require("jsonwebtoken");
const DeliveryBoy = require("../models/DeliveryBoy");

const deliveryProtect = async (req, res, next) => {
  let token;

  // Check Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract Token
      token = req.headers.authorization.split(" ")[1];

      // Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find Delivery Boy
      req.deliveryBoy = await DeliveryBoy.findById(decoded.id).select(
        "-password",
      );

      if (!req.deliveryBoy) {
        return res.status(401).json({
          message: "Delivery boy not found",
        });
      }

      next();
    } catch (error) {
      console.error(error);

      return res.status(401).json({
        message: "Not authorized, token failed",
      });
    }
  } else {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
};

module.exports = {
  deliveryProtect,
};
