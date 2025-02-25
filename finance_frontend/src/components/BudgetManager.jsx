import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:9000";

const BudgetManager = () => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [alertThreshold, setThreshold] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      const response = await axios.get(`${API_URL}/api/budget/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response);
      setBudgets(response?.data?.budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const addBudget = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accesstoken");
      await axios.post(
        `${API_URL}/api/budget/add`,
        { category, amount, startDate, endDate, alertThreshold },

        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCategory("");
      setAmount("");
      setThreshold("");
      setCategory("");
      setEndDate("");
      setStartDate("");
      fetchBudgets();
    } catch (error) {
      console.error("Error setting budget:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-10 ">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Manage Budget
      </h2>

      <form
        onSubmit={addBudget}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
        />
        <input
          type="number"
          placeholder="Threshold"
          value={alertThreshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
        />

        {/* Start Date Field */}
        <input
          type={startDate ? "date" : "text"}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          onFocus={(e) => (e.target.type = "date")}
          placeholder="Start Date"
          className="border border-gray-300 p-3 rounded-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
        />

        {/* End Date Field */}
        <input
          type={endDate ? "date" : "text"}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          onFocus={(e) => (e.target.type = "date")}
          placeholder="End Date"
          className="border border-gray-300 p-3 rounded-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
        />

        <button
          type="submit"
          className="bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300"
        >
          Set Budget
        </button>
      </form>

      {/* Budget List */}
      <ul className="bg-gray-100 p-4 rounded-lg shadow-md divide-y divide-gray-300">
        {budgets.length === 0 ? (
          <p className="text-center text-gray-500">No budgets added yet.</p>
        ) : (
          budgets.map((b) => (
            <li key={b._id} className="flex justify-around items-center p-3">
              <span className="font-semibold text-gray-800">
                {b.category} - Limit: ${b.amount} |
              </span>
              <span className="text-sm text-black font-semibold ">
                {new Date(b.startDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                --
                {new Date(b.endDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default BudgetManager;
