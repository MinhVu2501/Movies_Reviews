import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./user_components/Login";
import Registration from "./user_components/Registration";
function App() {
  return (
    <Routes>
      
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />

    </Routes>
  );
}

export default App;
