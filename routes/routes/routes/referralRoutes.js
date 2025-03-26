const express = require("express");
const router = express.Router();
const Referral = require("../models/referralModel");
const User = require("../models/userModel"); // Assuming you have a User model

// 🔹 Create a Referral Code for a User (POST)
router.post("/create", async (req, res) => {
  try {
    const { referrerId } = req.body;

    // Generate a unique referral code
    const referralCode = `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create a new referral document
    const referral = new Referral({
      referrerId,
      referralCode,
    });

    await referral.save();
    res.status(201).json({ message: "Referral code created!", referralCode });
  } catch (error) {
    res.status(500).json({ error: "Failed to create referral code." });
  }
});

// 🔹 Track a Referred User (POST)
router.post("/track", async (req, res) => {
  try {
    const { referralCode, referredUserId } = req.body;

    // Find the referral by referral code
    const referral = await Referral.findOne({ referralCode });

    if (!referral) {
      return res.status(404).json({ error: "Referral code not found." });
    }

    // Create the referral relationship
    referral.referredUserId = referredUserId;
    await referral.save();

    res.status(200).json({ message: "Referral tracked successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to track referral." });
  }
});

// 🔹 Apply Referral Discount (POST)
router.post("/apply-discount", async (req, res) => {
  try {
    const { referralCode, referrerId } = req.body;

    // Find the referral document
    const referral = await Referral.findOne({ referralCode, referrerId });

    if (!referral) {
      return res.status(404).json({ error: "Referral not found." });
    }

    if (referral.discountApplied) {
      return res.status(400).json({ error: "Discount already applied." });
    }

    // Apply the discount logic (simulated for now)
    referral.discountApplied = true;
    await referral.save();

    res.status(200).json({ message: "Discount applied successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to apply discount." });
  }
});

module.exports = router;
