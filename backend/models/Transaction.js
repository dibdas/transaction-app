const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  amount: { type: Number, required: true },
  description: { type: String },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String },
  date: { type: Date, default: Date.now },
  isRecurring: { type: Boolean, default: false }, // Flag to check if transaction recurs
  recurrence: {
    type: String,
    enum: ["daily", "weekly", "monthly", null], // Only valid when isRecurring is true
    default: null,
  },
});

module.exports = mongoose.model("transactions", TransactionSchema);
