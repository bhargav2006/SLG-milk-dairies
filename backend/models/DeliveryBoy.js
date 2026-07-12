const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const DeliveryBoySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },
    orderHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

DeliveryBoySchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

DeliveryBoySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const DeliveryBoy = mongoose.model("DeliveryBoy", DeliveryBoySchema);

module.exports = DeliveryBoy;
