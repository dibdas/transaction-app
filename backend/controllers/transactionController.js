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
const getTransactionClubbedCategory = async (req, res) => {
  const currentUserId = req._id;
  console.log("getBugetsClubbedTransactionsMonthCategory", currentUserId);

  const transactions = await Transactions.find({ owner: currentUserId });
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = new Date(budget.date);

    if (!acc[monthYear]) {
      acc[monthYear] = {};
    }
    if (!acc[monthYear][transaction.category]) {
      acc[monthYear][transaction.category] = [];
    }
    acc[monthYear][budget.category].push(transactions);
    return acc;
  }, {});
};
// by reduce method
const getTransactionClubbedMonthsCategory = async (req, res) => {
  try {
    const currentUserId = req._id;
    console.log("getBugetsClubbedTransactionsMonthCategory", currentUserId);

    const transactions = await Transactions.find({ owner: currentUserId });
    const groupedTransactions = transactions.reduce((acc, transaction) => {
      const date = new Date(budget.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`; // Format: YYYY-MM
      if (!acc[monthYear]) {
        acc[monthYear] = { income: 0, expense: 0, details: [] };
      }
      if (transaction.type === "income") {
        acc[monthYear].income = acc[monthYear].income + transaction.amount;
      } else if (transaction.type === "expense") {
        acc[monthYear].expense = acc[monthYear].expense + transaction.amount;
      }
      acc[monthYear].details.push(transaction);
      return acc;
    }, {});
    console.log(groupedTransactions);

    return res.status(200).json({ groupedTransactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// by  foreach method
const getTransactionClubbedMonthsCategoryForEach = async (req, res) => {
  try {
    const currentUserId = req._id;
    console.log("getBugetsClubbedTransactionsMonthCategory", currentUserId);

    const transactions = await Transactions.find({ owner: currentUserId });
    const groupedTransactions = {};
    transactions.forEach((transaction) => {
      const date = new Date(budget.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`; // Format: YYYY-MM

      if (!groupedTransactions[monthYear]) {
        groupedTransactions[monthYear] = {
          income: 0,
          expenses: 0,
          details: [],
        };
      }

      if (transaction.type === "income") {
        groupedTransactions[monthYear].income =
          groupedTransactions[monthYear].income + transaction.amount;
      } else if (transaction.type === "expense") {
        groupedTransactions[monthYear].expense =
          groupedTransactions[monthYear].expenses + transaction.amount;
      }
      groupedTransactions[monthYear].details.push(transaction);
    });
    console.log(groupedTransactions);

    return res.status(200).json({ groupedTransactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMonthCategoryTransactionsForEach = async (req, res) => {
  try {
    const currentUserId = req._id;
    console.log("getBugetsClubbedTransactionsMonthCategory", currentUserId);

    const transactions = await Transactions.find({ owner: currentUserId });
    const groupedTransactions = {};
    transactions.forEach((transaction) => {
      const date = new Date(budget.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`; // Format: YYYY-MM
      if (!groupedTransactions[monthYear]) {
        groupedTransactions[monthYear] = {};
      }

      if (!groupedTransactions[monthYear][transaction.category]) {
        groupedTransactions[monthYear][transaction.category] = {
          income: 0,
          expenses: 0,
          details: [],
        };
      }

      if (transaction.type === "income") {
        groupedTransactions[monthYear][transaction.category].income =
          groupedTransactions[monthYear][transaction.category].income +
          transaction.amount;
      } else if (transaction.type === "expense") {
        groupedTransactions[monthYear][transaction.category].expense =
          groupedTransactions[monthYear][transaction.category].expenses +
          transaction.amount;
      }
      groupedTransactions[monthYear][transaction.category].details.push(
        transaction
      );
    });
    console.log(groupedTransactions);

    return res.status(200).json({ groupedTransactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Example Output
// For your provided transactions, the API would return:

// json
// Copy
// Edit
// {
//   "2025-02": {
//     "Groceries": {
//       "income": 0,
//       "expenses": 50,
//       "transactions": [
//         {
//           "_id": "67bc3c641107d9e8f43b47c5",
//           "amount": 50,
//           "description": "Bought groceries",
//           "type": "expense",
//           "category": "Groceries",
//           "date": "2025-02-20T00:00:00.000+00:00"
//         }
//       ]
//     },
//     "Freelance Work": {
//       "income": 1000,
//       "expenses": 0,
//       "transactions": [
//         {
//           "_id": "67bc3c8d1107d9e8f43b47ca",
//           "amount": 1000,
//           "description": "Freelance project payment",
//           "type": "income",
//           "category": "Freelance Work",
//           "date": "2025-02-18T00:00:00.000+00:00"
//         }
//       ]
//     },
//     "Job Work": {
//       "income": 1000,
//       "expenses": 0,
//       "transactions": [
//         {
//           "_id": "67bc6d75bfdaaf3bf28b3674",
//           "amount": 1000,
//           "description": "Job project payment",
//           "type": "income",
//           "category": "Job Work",
//           "date": "2025-02-18T00:00:00.000+00:00"
//         }
//       ]
//     },
//     "side Job Work": {
//       "income": 800,
//       "expenses": 0,
//       "transactions": [
//         {
//           "_id": "67bc6dabbfdaaf3bf28b367d",
//           "amount": 800,
//           "description": "side project payment",
//           "type": "income",
//           "category": "side Job Work",
//           "date": "2025-02-18T00:00:00.000+00:00"
//         }
//       ]
//     }
//   }
// }

const getMonthCategoryTransactionsReduce = async (req, res) => {
  try {
    const currentUserId = req._id;
    console.log("getBugetsClubbedTransactionsMonthCategory", currentUserId);

    const transactions = await Transactions.find({ owner: currentUserId });
    const groupedTransactions = transaction.reduce((acc, transaction) => {
      const date = new Date(budget.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`; // Format: YYYY-MM
      if (!acc[monthYear]) {
        acc[monthYear] = {};
      }

      if (!acc[monthYear][transaction.category]) {
        acc[monthYear][transaction.category] = {
          income: 0,
          expenses: 0,
          details: [],
        };
      }

      if (transaction.type === "income") {
        acc[monthYear][transaction.category].income =
          acc[monthYear][transaction.category].income + transaction.amount;
      } else if (transaction.type === "expense") {
        acc[monthYear][transaction.category].expense =
          acc[monthYear][transaction.category].expenses + transaction.amount;
      }
      acc[monthYear][transaction.category].details.push(transaction);
      return acc;
    }, {});
    console.log(groupedTransactions);

    return res.status(200).json({ groupedTransactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Example Output
// json
// Copy
// Edit
// {
//   "2025-02": {
//     "Groceries": {
//       "income": 0,
//       "expense": 50,
//       "transactions": [
//         {
//           "_id": "67bc3c641107d9e8f43b47c5",
//           "amount": 50,
//           "description": "Bought groceries",
//           "type": "expense",
//           "category": "Groceries",
//           "date": "2025-02-20T00:00:00.000+00:00"
//         }
//       ]
//     },
//     "Freelance Work": {
//       "income": 1000,
//       "expense": 0,
//       "transactions": [
//         {
//           "_id": "67bc3c8d1107d9e8f43b47ca",
//           "amount": 1000,
//           "description": "Freelance project payment",
//           "type": "income",
//           "category": "Freelance Work",
//           "date": "2025-02-18T00:00:00.000+00:00"
//         }
//       ]
//     },
//     "Job Work": {
//       "income": 1000,
//       "expense": 0,
//       "transactions": [
//         {
//           "_id": "67bc6d75bfdaaf3bf28b3674",
//           "amount": 1000,
//           "description": "Job project payment",
//           "type": "income",
//           "category": "Job Work",
//           "date": "2025-02-18T00:00:00.000+00:00"
//         }
//       ]
//     }
//   }
// }
module.exports = {
  createTransactionController,
  updateTransactionController,
  deleteTransaction,
  getRecurringTransactions,
  getAllTransactions,
  getTransaction,
};
