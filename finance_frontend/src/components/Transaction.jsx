import React, { useState, useEffect } from "react";
import axios from "axios";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:9000/api/transactions",
          {
            // Important: Add full URL
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTransactions(response.data);
        console.log(transactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transactions</h2>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction._id} className="mb-2">
            {transaction.description} - ${transaction.amount} (
            {transaction.type})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Transactions;
