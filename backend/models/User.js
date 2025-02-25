const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    transactions: [
      {
        ref: "transactions",
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    budgets: [
      {
        ref: "budgets",
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("users", UserSchema);
