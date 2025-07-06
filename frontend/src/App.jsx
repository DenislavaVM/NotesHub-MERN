import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import Labels from "./pages/Labels/Labels";
import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./routes/Layout";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/labels" element={<Labels />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default App;