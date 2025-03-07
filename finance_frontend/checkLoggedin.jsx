import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function CheckLoggedIn() {
  const user = localStorage.getItem("accesstoken");
  //   if the user is present then go to home , otherwise go the login and signup
  return user ? <Navigate to="/" /> : <Outlet />;
}

export default CheckLoggedIn;
