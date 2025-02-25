import React, { useState, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import axios from "axios";
Chart.register(...registerables);

const Dashboard = () => {
  // Placeholder data (replace with actual data from your API)
  const [incomeTotalNumber, setTotalIncomeNumber] = useState(0);
  const [expenseTotalNumber, setTotalExpensesNumber] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [incomes, setTotalIncome] = useState({});
  const [expenses, setTotalExpenses] = useState({});
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      console.log(token);
      const response = await axios.get(
        "http://localhost:9000/api/transaction/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      setTransactions(response.data);
      console.log(transactions);
      const incomeTotals = response.data.reduce((acc, t) => {
        if (t.type == "income") {
          acc[t.category] = acc[t.category]
            ? acc[t.category] + t.amount
            : t.amount;
        }
        return acc;
      }, {});
      const expenseTotals = response.data.reduce((acc, t) => {
        if (t.type == "expense") {
          acc[t.category] = acc[t.category]
            ? acc[t.category] + t.amount
            : t.amount;
        }
        return acc;
      }, {});

      console.log("expenstools", expenseTotals);
      setTotalExpenses(expenseTotals);
      console.log("incometools", incomeTotals);
      setTotalIncome(incomeTotals);
      // console.log("setTotalIncome", incomes);
      // console.log("setExpensetotal", expenses);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };
  function totalExpenses() {
    const total = Object.entries(expenses)
      .map(([key, value]) => value)
      .reduce((sum, curr) => sum + curr, 0);
    setTotalExpensesNumber(total);
    return total;
  }
  function totalIncome() {
    const total = Object.entries(incomes)
      .map(([key, value]) => value)
      .reduce((sum, curr) => sum + curr, 0);
    setTotalIncomeNumber(total);
    return total;
  }
  useEffect(() => {
    totalIncome();
    totalExpenses();
    console.log("Updated Expenses:", expenses);
    console.log("Updated Incomes:", incomes);
    console.log("Updated transactions:", transactions);
    console.log(incomeTotalNumber);
    console.log(expenseTotalNumber);
    const expensesCategories = Object.keys(expenses);
    const incomeCategories = Object.keys(incomes);
    setExpenseCategories(expensesCategories);
    setIncomeCategories(incomeCategories);
    console.log(expenseCategories);
    console.log(incomeCategories);
  }, [expenses, incomes, transactions]);
  useEffect(() => {
    fetchTransactions();
  }, []);

  const barChartData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        label: "Financial Overview",
        data: [incomeTotalNumber, expenseTotalNumber],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const pieChartDataExpense = {
    labels: Object.keys(expenses), // Extracting expense categories dynamically
    datasets: [
      {
        data: Object.values(expenses), // Extracting corresponding amounts dynamically
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)", // Additional colors for dynamic categories
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const pieChartDataIncome = {
    labels: Object.keys(incomes), // Extracting expense categories dynamically
    datasets: [
      {
        data: Object.values(incomes), // Extracting corresponding amounts dynamically
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)", // Additional colors for dynamic categories
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",

          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  console.log(pieChartDataIncome);
  console.log(pieChartDataExpense);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 bg-white shadow-lg rounded-lg w-full max-w-4xl text-center text-black">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Financial Summary</h2>
          <p className="text-lg">Income: ${incomeTotalNumber}</p>
          <p className="text-lg">Expenses: ${expenseTotalNumber}</p>
          <p className="text-lg font-medium">
            Balance: ${incomeTotalNumber - expenseTotalNumber}
          </p>
        </div>

        {/* Bar Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Income vs. Expenses</h2>
          <Bar data={barChartData} />
        </div>

        {/* Pie Charts */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Expense Breakdown</h2>
          <Pie data={pieChartDataExpense} />
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Income Breakdown</h2>
          <Pie data={pieChartDataIncome} />
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <ul className="list-none">
            {transactions.map((transaction, index) => (
              <li
                key={transaction._id || index}
                className="border-b py-3 text-lg"
              >
                <span className="font-medium">{transaction?.category}</span> - $
                {transaction?.amount}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
