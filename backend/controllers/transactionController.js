const Users = require("../models/User");
const Transactions = require("../models/Transaction");
const { error, success } = require("../utils/responseWrapper");
const createTransactionController = async (req, res) => {
  try {
    const owner = req._id;
    const {
      amount,
      description,
      type,
      category,
      date,
      isRecurring,
      recurrence,
    } = req.body;

    // Validate required fields
    if (!amount || !description || !category || !type) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate type field
    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transaction type" });
    }

    // Validate recurrence if transaction is recurring
    if (isRecurring && !["daily", "weekly", "monthly"].includes(recurrence)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid recurrence type" });
    }

    // Find the user
    const user = await Users.findById(owner);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create the transaction
    const transaction = await Transactions.create({
      owner,
      amount,
      description,
      type,
      category,
      date: date || Date.now(), // Default to current date if not provided
      isRecurring: isRecurring || false,
      recurrence: isRecurring ? recurrence : null,
    });

    // Add transaction to user's transactions list
    user.transactions.push(transaction._id);
    await user.save();

    return res.status(201).json({ success: true, transaction });
  } catch (err) {
    console.error("Error creating transaction:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const updateTransactionController = async (req, res) => {
  try {
    const currentUserId = req._id;
    const {
      transactionId,
      amount,
      description,
      type,
      category,
      date,
      isRecurring,
      recurrence,
    } = req.body;
    console.log(req.body);
    const transaction = await Transactions.findById(transactionId);
    console.log("transaction owner", transaction.owner.toString());
    if (!transaction) {
      return res.send(error(404, `transaction  not found`));
    }
    // checking whether the owner of the post is the currentuser or not, if not then the post cant be updated
    if (transaction.owner.toString() !== currentUserId) {
      return res.send(
        error(403, `unauthorized attempt to update the transaction`)
      );
    }
    // Update fields selectively
    if (amount !== undefined) {
      transaction.amount = amount;
    }
    if (description !== undefined) {
      transaction.description = description;
    }
    if (type !== undefined) {
      transaction.type = type;
    }
    if (category !== undefined) {
      transaction.category = category;
    }
    if (date !== undefined) {
      transaction.date = Date.now();
    }
    if (isRecurring !== undefined) {
      transaction.isRecurring = isRecurring;
    }
    if (recurrence !== undefined) {
      transaction.recurrence = recurrence;
    }
    const updatedTransaction = await transaction.save();

    return res.send(
      success(
        201,
        `updated transaction successfully saved ${updatedTransaction}`
      )
    );
  } catch (err) {
    return res.send(error(500, err));
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const currentUserId = req._id;
    const { transactionId } = req.body;
    const currentUser = await Users.findById(currentUserId);

    const transaction = await Transactions.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.owner.toString() !== currentUserId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const index = currentUser.transactions.indexOf(transactionId);
    console.log(index);
    currentUser.transactions.splice(index, 1);
    await currentUser.save();
    await transaction.deleteOne();
    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getRecurringTransactions = async (req, res) => {
  try {
    const currentUserId = req._id;
    const transactions = await Transactions.find({
      owner: currentUserId,
      category: "recurring",
    }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const currentUserId = req._id;
    const transactions = await Transactions.find({ owner: currentUserId }).sort(
      {
        date: -1,
      }
    );

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTransaction = async (req, res) => {
  try {
    const currentUserId = req._id;
    const { transactionId } = req.body;
    console.log(req.body);
    const transaction = await Transactions.findById(transactionId);
    if (transaction.owner.toString() !== currentUserId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTransactionController,
  updateTransactionController,
  deleteTransaction,
  getRecurringTransactions,
  getAllTransactions,
  getTransaction,
};
