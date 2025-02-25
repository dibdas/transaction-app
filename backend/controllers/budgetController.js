const Budgets = require("../models/Budget");
const Transactions = require("../models/Transaction");
const Users = require("../models/User");
const { error, success } = require("../utils/responseWrapper");

const addBudgetController = async (req, res) => {
  try {
    const { category, amount, alertThreshold, startDate, endDate } = req.body;
    if (!amount || !alertThreshold || !category || !startDate || !endDate) {
      return res.send(error(400, `all field are required`));
    }
    const owner = req._id;
    const user = await Users.findById(owner);

    // Create a new budget
    const newBudget = await Budgets.create({
      owner,
      category,
      amount,
      alertThreshold: alertThreshold || 0.9, // Default: 90%
      startDate,
      endDate,
    });

    user.budgets.push(newBudget._id);
    const userSavedBudget = await user.save();
    return res.status(201).json({
      message: "Budget created successfully",
      budget: newBudget,
      userSavedBudget: userSavedBudget,
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getBudgets = async (req, res) => {
  try {
    const currentUserId = req._id;
    console.log("getBudgets", currentUserId);

    const budgets = await Budgets.find({ owner: currentUserId });

    return res.status(200).json({ budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const updateBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const currentUserId = req._id;
    const { category, amount, alertThreshold, startDate, endDate } = req.body;
    const budget = await Budgets.findById(budgetId);
    if (budget.owner.toString() !== currentUserId) {
      return res.send(
        error(403, `unauthorized attempt to update the transaction`)
      );
    }
    if (!budget) {
      return res.send(error(404, `budget not found`));
    }

    const updatedBudget = await Budgets.findByIdAndUpdate(
      budgetId,
      { category, amount, alertThreshold, startDate, endDate },
      { new: true } // Return updated budget
    );

    if (!updatedBudget) {
      return res.status(404).json({ error: "Budget update error" });
    }

    res
      .status(200)
      .json({ message: "Budget updated successfully", budget: updatedBudget });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const currentUserId = req._id;
    const budget = await Budgets.findById(budgetId);
    if (!budget) {
      return res.send(error(404, `budget not found`));
    }
    if (budget.owner.toString() !== currentUserId) {
      return res.send(
        error(403, `unauthorized attempt to update the transaction`)
      );
    }
    const deletedBudget = await Budgets.findByIdAndDelete(budgetId);
    if (!deletedBudget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check Budget & Alerts
const checkBudgetController = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const currentUserId = req._id; // Logged-in user's ID

    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({ error: "Invalid startDate format" });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({ error: "Invalid endDate format" });
    }

    // Build a date filter if startDate or endDate is provided
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    console.log("dateFilter:", dateFilter);

    // Fetch user's budgets
    const budgets = await Budgets.find({ owner: currentUserId });

    if (!budgets.length) {
      return res.json({ alerts: [], message: "No budgets set." });
    }

    console.log("Budgets found:", budgets);

    let alerts = [];
    let spendingDetails = [];

    // Loop through each budget category to check spending
    for (let budget of budgets) {
      console.log("Processing budget:", budget); // Debugging

      // Find total expenses in this category within the date range
      const totalSpent = await Transactions.aggregate([
        {
          $match: {
            owner: currentUserId,
            category: budget.category,
            type: "expense",
            ...dateFilter,
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = totalSpent[0]?.total || 0; // Default to 0 if no expenses found
      const threshold = budget.alertThreshold || 0.9; // Default alert threshold: 90% of budget

      console.log(
        `Category: ${budget.category}, Spent: ${spent}, Budget: ${budget.amount}`
      );

      let alertMessage = null;
      if (spent >= budget.amount) {
        alertMessage = `🚨 Budget exceeded for ${budget.category}!`;
      } else if (spent >= budget.amount * threshold) {
        alertMessage = `⚠️ You are nearing your budget for ${budget.category}.`;
      }

      if (alertMessage) {
        alerts.push({ category: budget.category, alert: alertMessage });
      }

      // Store spending details
      spendingDetails.push({
        category: budget.category,
        spent,
        budget: budget.amount || 0, // Ensure budget is always present
      });
    }

    return res.json({
      alerts,
      spendingDetails,
      message: "Budget check completed.",
    });
  } catch (error) {
    console.error("Error checking budget:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { addBudgetController, checkBudgetController, getBudgets };
