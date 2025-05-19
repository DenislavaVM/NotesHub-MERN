import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SingUp/SignUp";
import Labels from "./pages/Labels/Labels";
import PrivateRoute from "./routes/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/labels" element={<PrivateRoute><Labels /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} />
    </Router>
  );
};

export default App;