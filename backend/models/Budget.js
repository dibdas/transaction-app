const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  category: { type: String, required: true },
  amount: { type: Number, required: true }, // Budget limit
  alertThreshold: { type: Number, default: 0.9 }, // Default: 90% of budget
  createdAt: { type: Date, default: Date.now },
  startDate: { type: Date, required: true }, // Optional budget start date
  endDate: { type: Date, required: true }, // Optional budget end date
});

module.exports = mongoose.model("Budget", BudgetSchema);
