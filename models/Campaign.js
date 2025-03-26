// models/Campaign.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'email', 'sms'
  status: { type: String, required: true, default: 'active' }, // 'active' or 'inactive'
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;

