import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transaction";
import AddTransaction from "./components/AddTransaction";
import BudgetManager from "./components/BudgetManager";

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isAuthenticated = () => {
    return localStorage.getItem("accesstoken");
  };

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated() ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="bg-gray-600 text-white min-h-screen">
        {/* Navbar (Fixed) */}
        {isLoggedIn && (
          <nav className="bg-gray-800 p-4 flex justify-between items-center shadow-lg fixed top-0 left-0 w-full z-50">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="text-white text-xl"
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">My App</h1>
            <button
              onClick={() => {
                localStorage.removeItem("accesstoken");
                setIsLoggedIn(false);
              }}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </nav>
        )}

        {/* Sidebar (Slider) */}
        <div
          className={`fixed top-0 left-0 h-full bg-gray-400 text-white w-64 p-4 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 shadow-lg z-40`}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white text-lg"
          >
            ✖ Close
          </button>
          <ul className="mt-4 space-y-4">
            <li>
              <Link
                to="/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="block py-2 px-4 rounded hover:bg-gray-700 transition"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/transaction"
                onClick={() => setSidebarOpen(false)}
                className="block py-2 px-4 rounded hover:bg-gray-700 transition"
              >
                Transactions
              </Link>
            </li>
            <li>
              <Link
                to="/addbudget"
                onClick={() => setSidebarOpen(false)}
                className="block py-2 px-4 rounded hover:bg-gray-700 transition"
              >
                AddBudget
              </Link>
            </li>
            <li>
              <Link
                to="/addtransaction"
                onClick={() => setSidebarOpen(false)}
                className="block py-2 px-4 rounded hover:bg-gray-700 transition"
              >
                AddTransactions
              </Link>
            </li>
            <li>
              <Link
                to="/logout"
                onClick={() => {
                  setSidebarOpen(false);
                  localStorage.removeItem("accesstoken");
                }}
                className="block py-2 px-4 rounded hover:bg-red-600 transition"
              >
                Logout
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Content (with padding to prevent overlap) */}
        <div className="pt-16 p-6">
          <Routes>
            <Route
              path="/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Dashboard />} />}
            />
            <Route
              path="/addtransaction"
              element={<ProtectedRoute element={<AddTransaction />} />}
            />
            <Route
              path="/transaction"
              element={<ProtectedRoute element={<Transactions />} />}
            />
            <Route
              path="/addbudget"
              element={<ProtectedRoute element={<BudgetManager />} />}
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
