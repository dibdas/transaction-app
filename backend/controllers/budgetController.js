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
// const getBugetsClubbedMonthsCategory = async (req, res) => {
//   try {
//     const currentUserId = req._id;
//     console.log("getBugetsClubbedMonthCategory", currentUserId);

//     const budgets = await Budgets.find({ owner: currentUserId });
//     const groupedBudgets = budgets.reduce((acc, budget) => {
//       const date = new Date(budget.date);
//       const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
//         .toString()
//         .padStart(2, "0")}`; // Format: YYYY-MM
//       if (!acc[monthYear]) {
//         acc[monthYear] = {};
//       }
//       if (!acc[monthYear][budget.category]) {
//         acc[monthYear][budget.category] = [];
//       }
//       acc[monthYear][budget.category].push(budgets);
//       return acc;
//     }, {});

//     return res.status(200).json({ groupedBudgets });
//   } catch (error) {
//     console.error("Error fetching budgets:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
// Example Output
// If we have the following budgets:

// json
// Copy
// Edit
// [
//   {
//     "_id": "67bcd82a591f7350115c1208",
//     "owner": "67bb6da598b3325eff931385",
//     "category": "Food",
//     "amount": 300,
//     "alertThreshold": 50,
//     "startDate": "2025-02-07T00:00:00.000+00:00",
//     "endDate": "2025-03-09T00:00:00.000+00:00",
//     "createdAt": "2025-02-24T20:35:54.049+00:00"
//   },
//   {
//     "_id": "67bcd82a591f7350115c1209",
//     "owner": "67bb6da598b3325eff931385",
//     "category": "Food",
//     "amount": 500,
//     "alertThreshold": 100,
//     "startDate": "2025-02-15T00:00:00.000+00:00",
//     "endDate": "2025-03-20T00:00:00.000+00:00",
//     "createdAt": "2025-02-24T20:40:00.000+00:00"
//   },
//   {
//     "_id": "67bcd82a591f7350115c1210",
//     "owner": "67bb6da598b3325eff931385",
//     "category": "Transport",
//     "amount": 200,
//     "alertThreshold": 30,
//     "startDate": "2025-02-10T00:00:00.000+00:00",
//     "endDate": "2025-02-28T00:00:00.000+00:00",
//     "createdAt": "2025-02-24T20:45:00.000+00:00"
//   }
// ]
// The API will return:

// json
// Copy
// Edit
// {
//   "budgets": {
//     "2025-02": {
//       "Food": {
//         "totalAmount": 800,
//         "budgets": [
//           {
//             "_id": "67bcd82a591f7350115c1208",
//             "owner": "67bb6da598b3325eff931385",
//             "category": "Food",
//             "amount": 300,
//             "alertThreshold": 50,
//             "startDate": "2025-02-07T00:00:00.000+00:00",
//             "endDate": "2025-03-09T00:00:00.000+00:00",
//             "createdAt": "2025-02-24T20:35:54.049+00:00"
//           },
//           {
//             "_id": "67bcd82a591f7350115c1209",
//             "owner": "67bb6da598b3325eff931385",
//             "category": "Food",
//             "amount": 500,
//             "alertThreshold": 100,
//             "startDate": "2025-02-15T00:00:00.000+00:00",
//             "endDate": "2025-03-20T00:00:00.000+00:00",
//             "createdAt": "2025-02-24T20:40:00.000+00:00"
//           }
//         ]
//       },
//       "Transport": {
//         "totalAmount": 200,
//         "budgets": [
//           {
//             "_id": "67bcd82a591f7350115c1210",
//             "owner": "67bb6da598b3325eff931385",
//             "category": "Transport",
//             "amount": 200,
//             "alertThreshold": 30,
//             "startDate": "2025-02-10T00:00:00.000+00:00",
//             "endDate": "2025-02-28T00:00:00.000+00:00",
//             "createdAt": "2025-02-24T20:45:00.000+00:00"
//           }
//         ]
//       }
//     }
//   }
// }

// considering only the start date
// const getBugetsClubbedMonthsCategory = async (req, res) => {
//   try {
//     const currentUserId = req._id;
//     console.log("getBudgets", currentUserId);

//     // Fetch budgets from the database
//     const budgets = await Budgets.find({ owner: currentUserId });

//     // Grouping budgets by month and category
//     const groupedBudgets = budgets.reduce((acc, budget) => {
//       const startDate = new Date(budget.startDate);
//       const monthYear = `${startDate.getFullYear()}-${(startDate.getMonth() + 1)
//         .toString()
//         .padStart(2, "0")}`; // Format: YYYY-MM

//       if (!acc[monthYear]) {
//         acc[monthYear] = {};
//       }

//       if (!acc[monthYear][budget.category]) {
//         acc[monthYear][budget.category] = {
//           totalAmount: 0,
//           budgets: [],
//         };
//       }

//       // Add the budget entry
//       acc[monthYear][budget.category].budgets.push(budget);
//       acc[monthYear][budget.category].totalAmount += budget.amount;

//       return acc;
//     }, {});

//     return res.status(200).json({ budgets: groupedBudgets });
//   } catch (error) {
//     console.error("Error fetching budgets:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// Example Output
// If we have the following budgets:

// json
// Copy
// Edit
// [
//   {
//     "_id": "67bcd82a591f7350115c1208",
//     "owner": "67bb6da598b3325eff931385",
//     "category": "Food",
//     "amount": 300,
//     "alertThreshold": 50,
//     "startDate": "2025-02-07T00:00:00.000+00:00",
//     "endDate": "2025-03-09T00:00:00.000+00:00",
//     "createdAt": "2025-02-24T20:35:54.049+00:00"
//   },
//   {
//     "_id": "67bcd82a591f7350115c1209",
//     "owner": "67bb6da598b3325eff931385",
//     "category": "Food",
//     "amount": 500,
//     "alertThreshold": 100,
//     "startDate": "2025-02-15T00:00:00.000+00:00",
//     "endDate": "2025-03-20T00:00:00.000+00:00",
//     "createdAt": "2025-02-24T20:40:00.000+00:00"
//   },
//   {
//     "_id": "67bcd82a591f7350115c1210",
//     "owner": "67bb6da598b3325eff931385",
//     "category": "Transport",
//     "amount": 200,
//     "alertThreshold": 30,
//     "startDate": "2025-02-10T00:00:00.000+00:00",
//     "endDate": "2025-02-28T00:00:00.000+00:00",
//     "createdAt": "2025-02-24T20:45:00.000+00:00"
//   }
// ]
// The API will return:

// json
// Copy
// Edit
// {
//   "budgets": {
//     "2025-02": {
//       "Food": {
//         "totalAmount": 800,
//         "budgets": [
//           {
//             "_id": "67bcd82a591f7350115c1208",
//             "owner": "67bb6da598b3325eff931385",
//             "category": "Food",
//             "amount": 300,
//             "alertThreshold": 50,
//             "startDate": "2025-02-07T00:00:00.000+00:00",
//             "endDate": "2025-03-09T00:00:00.000+00:00",
//             "createdAt": "2025-02-24T20:35:54.049+00:00"
//           },
//           {
//             "_id": "67bcd82a591f7350115c1209",
//             "owner": "67bb6da598b3325eff931385",
//             "category": "Food",
//             "amount": 500,
//             "alertThreshold": 100,
//             "startDate": "2025-02-15T00:00:00.000+00:00",
//             "endDate": "2025-03-20T00:00:00.000+00:00",
//             "createdAt": "2025-02-24T20:40:00.000+00:00"
//           }
//         ]
//       },
//       "Transport": {
//         "totalAmount": 200,
//         "budgets": [
//           {
//             "_id": "67bcd82a591f7350115c1210",
//             "owner": "67bb6da598b3325eff931385",
//             "category": "Transport",
//             "amount": 200,
//             "alertThreshold": 30,
//             "startDate": "2025-02-10T00:00:00.000+00:00",
//             "endDate": "2025-02-28T00:00:00.000+00:00",
//             "createdAt": "2025-02-24T20:45:00.000+00:00"
//           }
//         ]
//       }
//     }
//   }
// }
// Final Features
// ✔ Groups budgets by month (YYYY-MM format).
// ✔ Groups budgets by category inside each month.
// ✔ Calculates total spending per category.
// ✔ Maintains a list of all budgets under each category.

// Would you like to add filtering by a specific date range or alert threshold? 🚀


// 2/2

// You said:
// why end is not considered 
// ChatGPT said:
// You're right to ask about why endDate is not considered!

// Why startDate is used instead of endDate?
// startDate represents when the budget starts, so it's a natural choice for categorizing budgets into a particular month.
// endDate is the deadline for the budget, but using it alone would miss ongoing budgets that started earlier.
// What if we want to consider endDate too?
// If a budget spans multiple months, we should include it in each month between startDate and endDate.




const getBugetsClubbedMonthsCategory = async (req, res) => {
  try {
    const currentUserId = req._id;
    console.log("getBugetsClubbedMonthCategory", currentUserId);

    const budgets = await Budgets.find({ owner: currentUserId });
    const groupedBudgets = budgets.reduce((acc, budget) => {
      const start = new Date(budget.startDate);
      const end = new Date(budget.endDate);
      let current = new Date(start);
      while(current<=end){
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`; // Format: YYYY-MM
      if (!acc[monthYear]) {
        acc[monthYear] = {};
      }
      if (!acc[monthYear][budget.category]) {
        acc[monthYear][budget.category] = {
          totalAmount:0,
          budgets=[]
        }
      }
      acc[monthYear][budget.category].budgets.push(budget)
      acc[monthYear][budget.category].totalAmount=acc[monthYear][budget.category].totalAmount+budget.amount
    }
      return acc;
    }, {});

    return res.status(200).json({ groupedBudgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// How This Works?
// Loop from startDate to endDate month by month.
// For each month, the budget is added under its category.
// Handles budgets that span multiple months.
// Example
// Budget Entry
// json
// Copy
// Edit
// {
//   "_id": "67bcd82a591f7350115c1208",
//   "owner": "67bb6da598b3325eff931385",
//   "category": "Food",
//   "amount": 1000,
//   "alertThreshold": 50,
//   "startDate": "2025-02-07T00:00:00.000+00:00",
//   "endDate": "2025-04-09T00:00:00.000+00:00",
//   "createdAt": "2025-02-24T20:35:54.049+00:00"
// }
// Output
// json
// Copy
// Edit
// {
//   "budgets": {
//     "2025-02": {
//       "Food": {
//         "totalAmount": 1000,
//         "budgets": [{ "category": "Food", "amount": 1000, "startDate": "2025-02-07", "endDate": "2025-04-09" }]
//       }
//     },
//     "2025-03": {
//       "Food": {
//         "totalAmount": 1000,
//         "budgets": [{ "category": "Food", "amount": 1000, "startDate": "2025-02-07", "endDate": "2025-04-09" }]
//       }
//     },
//     "2025-04": {
//       "Food": {
//         "totalAmount": 1000,
//         "budgets": [{ "category": "Food", "amount": 1000, "startDate": "2025-02-07", "endDate": "2025-04-09" }]
//       }
//     }
//   }
// }
// Now, the budget appears in Feb, March, and April.


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
// Example
// Budget Entry
// json
// Copy
// Edit
// {
//   "_id": "67bcd82a591f7350115c1208",
//   "owner": "67bb6da598b3325eff931385",
//   "category": "Food",
//   "amount": 1000,
//   "alertThreshold": 50,
//   "startDate": "2025-02-07T00:00:00.000+00:00",
//   "endDate": "2025-04-09T00:00:00.000+00:00",
//   "createdAt": "2025-02-24T20:35:54.049+00:00"
// }
// Output
// json
// Copy
// Edit
// {
//   "budgets": {
//     "2025-02": {
//       "Food": {
//         "totalAmount": 1000,
//         "budgets": [{ "category": "Food", "amount": 1000, "startDate": "2025-02-07", "endDate": "2025-04-09" }]
//       }
//     },
//     "2025-03": {
//       "Food": {
//         "totalAmount": 1000,
//         "budgets": [{ "category": "Food", "amount": 1000, "startDate": "2025-02-07", "endDate": "2025-04-09" }]
//       }
//     },
//     "2025-04": {
//       "Food": {
//         "totalAmount": 1000,
//         "budgets": [{ "category": "Food", "amount": 1000, "startDate": "2025-02-07", "endDate": "2025-04-09" }]
//       }
//     }
//   }
// }

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

module.exports = {
  addBudgetController,
  getBugetsClubbedMonthsCategory,
  checkBudgetController,
  getBudgets,
};
