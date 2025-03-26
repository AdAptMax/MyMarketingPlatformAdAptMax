const express = require('express');
const Campaign = require('../models/Campaign');
const mongoose = require('mongoose');

const router = express.Router();

// Create a new campaign (POST)
router.post('/', async (req, res) => {
  try {
    const { name, type, scheduledAt, createdBy } = req.body;

    // Validate input fields
    if (!name || !type || !scheduledAt || !createdBy) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Create the new campaign
    const newCampaign = new Campaign({
      name,
      type,
      scheduledAt,
      createdBy,
    });

    // Save the campaign to the database
    await newCampaign.save();

    res.status(201).json({
      message: 'Campaign created successfully!',
      campaign: newCampaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ message: "Error creating campaign", error: error.message });
  }
});

// Get all campaigns (GET)
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('createdBy', 'name email'); // Populate the createdBy field with user info
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Error fetching campaigns", error: error.message });
  }
});

// Get a single campaign by ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;

    // Validate if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID!' });
    }

    const campaign = await Campaign.findById(campaignId).populate('createdBy', 'name email');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found!' });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ message: "Error fetching campaign", error: error.message });
  }
});

// Update a campaign by ID (PUT)
router.put('/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { name, type, scheduledAt, status } = req.body;

    // Validate if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID!' });
    }

    // Find and update the campaign
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { name, type, scheduledAt, status },
      { new: true } // Return the updated campaign
    );

    if (!updatedCampaign) {
      return res.status(404).json({ message: 'Campaign not found!' });
    }

    res.status(200).json({
      message: 'Campaign updated successfully!',
      campaign: updatedCampaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ message: "Error updating campaign", error: error.message });
  }
});

// Delete a campaign by ID (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;

    // Validate if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID!' });
    }

    const deletedCampaign = await Campaign.findByIdAndDelete(campaignId);
    if (!deletedCampaign) {
      return res.status(404).json({ message: 'Campaign not found!' });
    }

    res.status(200).json({ message: 'Campaign deleted successfully!' });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ message: "Error deleting campaign", error: error.message });
  }
});

module.exports = router;
