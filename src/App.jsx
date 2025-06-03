import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./user_components/Login";
import Registration from "./user_components/Registration";
import Home from "./core_components/Home";
function App() {
  return (
    <Routes>
      
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />

    </Routes>
  );
}

export default App;
