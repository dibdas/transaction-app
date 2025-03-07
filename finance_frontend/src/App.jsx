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
import RequireUser from "../requireuser";
import Home from "./pages/Home";
import CheckLoggedIn from "../checkLoggedin";

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
    <div className="App">
      <Routes>
        <Route element={<RequireUser />}>
          <Route element={<Home />}>
            <Route path="/addtransaction" element={<AddTransaction />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
        {/* if the user is there i.e access token is present then then move it to home page , otherwise */}
        {/* move to log or sign up  */}
        <Route element={<CheckLoggedIn />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
