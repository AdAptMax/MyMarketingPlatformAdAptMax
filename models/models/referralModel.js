const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Linking to the User model
      required: true,
    },
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Linking to the User model
      required: true,
    },
    discountApplied: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
      unique: true,
      required: true,
    },
    referredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", referralSchema);

module.exports = Referral;
