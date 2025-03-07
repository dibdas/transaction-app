import React, { Component, useEffect } from "react";

import { Link, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      {/* <Link to="/login">Log In</Link>
      <Link to="/signup">Sign Up</Link> */}
      <Navbar />
      <Outlet />
    </>
  );
}

export default Home;
