import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const API_URL = "http://localhost:9000";

const AddTransaction = ({ refreshTransactions }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState("monthly");
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransactionId, setEditingTrasactionId] = useState(null);
  const handleView = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };
  useEffect(() => {
    console.log("Modal state changed:", isModalOpen);
    console.log("Selected transaction updated:", selectedTransaction);
  }, [isModalOpen, selectedTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accesstoken");
      if (editingTransactionId) {
        console.log("recurrence", recurrence);
        console.log("isrecurring", isRecurring);
        const editTransactionSaved = await axios.post(
          `${API_URL}/api/transaction/update`,
          {
            transactionId: editingTransactionId,
            description,
            amount,
            type,
            category,
            isRecurring,
            recurrence,
          },

          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDescription("");
        setAmount("");
        setCategory("");
        setIsRecurring(false);
        setEditingTrasactionId(null);
        console.log(editTransactionSaved);
        fetchTransactions();
      } else {
        const transactionSaved = await axios.post(
          `${API_URL}/api/transaction/add`,
          { description, amount, type, category, isRecurring, recurrence },

          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // refreshTransactions();
        setDescription("");
        setAmount("");
        setCategory("");
        setIsRecurring(false);
        console.log(transactionSaved);
      }
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };
  const handleDelete = async (transactionId) => {
    const token = localStorage.getItem("accesstoken");
    const deleteTransactionSaved = await axios.post(
      `${API_URL}/api/transaction/delete`,
      {
        transactionId,
      },

      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(deleteTransactionSaved);
    fetchTransactions();
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("accesstoken");
      console.log(token);
      if (!token) {
        <Navigate to="/login" />;
      }
      const response = await axios.get(
        "http://localhost:9000/api/transaction/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };
  const handleUpdate = (transaction) => {
    setEditingTrasactionId(transaction._id);
    setDescription(transaction.description);
    setAmount(transaction.amount);
    setCategory(transaction.category);
    setIsRecurring(transaction.isRecurring);
    setRecurrence(transaction.recurrence);
  };

  useEffect(() => {
    fetchTransactions();
    const token = localStorage.getItem("accesstoken");
    if (!token) {
      <Navigate to="/login" />;
    }
  }, []);

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-cyan-900 p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-black mb-6 text-center">
            Add Transaction
          </h2>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-4 w-full mb-4 rounded-lg text-lg placeholder:text-black text-black"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-4 w-full mb-4 rounded-lg text-lg placeholder:text-black  text-black"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-4 w-full mb-4 rounded-lg text-lg text-black"
          >
            <option value="expense" className="text-black">
              Expense
            </option>
            <option value="income" className="text-black">
              Income
            </option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-4 w-full mb-4 rounded-lg text-lg placeholder:text-black  text-black"
          />
          <label className="flex items-center mb-4  text-black">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
              className="mr-2"
            />
            <span className="text-gray-200 text-lg">Recurring Transaction</span>
          </label>
          {isRecurring && (
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="border p-4 w-full mb-4 rounded-lg text-lg  text-black"
            >
              <option value="daily" className="text-black">
                Daily
              </option>
              <option value="weekly" className="text-black">
                Weekly
              </option>
              <option value="monthly" className="text-black">
                Monthly
              </option>
            </select>
          )}
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-3 w-full rounded-lg text-lg font-semibold hover:bg-green-600 transition"
          >
            Add Transaction
          </button>
        </form>
        <div className="mt-10">
          <ul className="space-y-6">
            {transactions.map((transaction, index) => (
              <li
                key={transaction._id || index}
                className={`p-6 rounded-lg shadow-md flex justify-between items-center ${
                  transaction.type === "income"
                    ? "bg-green-100 border-l-4 border-green-500"
                    : "bg-red-100 border-l-4 border-red-500"
                }`}
              >
                <div>
                  <h3 className="text-xl font-semibold">
                    {transaction.category}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {transaction.description}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      handleView(transaction);
                    }}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleUpdate(transaction)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(transaction._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal */}

        {isModalOpen && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl">
              <h2 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
                Transaction Details
              </h2>

              <div className="grid grid-cols-2 gap-6 text-lg text-gray-700">
                <p>
                  <span className="font-semibold">Category:</span>{" "}
                  {selectedTransaction?.category || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Description:</span>{" "}
                  {selectedTransaction?.description || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Amount:</span>{" "}
                  <span className="text-green-600 font-bold">
                    ${selectedTransaction?.amount || "0.00"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Type:</span>{" "}
                  {selectedTransaction?.type || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Recurring:</span>{" "}
                  {selectedTransaction?.isRecurring
                    ? selectedTransaction?.recurrence
                    : "No"}
                </p>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleClose}
                  className="bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900 transition text-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddTransaction;
