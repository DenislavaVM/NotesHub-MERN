import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import Labels from "./pages/Labels/Labels";
import PrivateRoute from "./routes/PrivateRoute";
import { ErrorProvider } from "./context/ErrorProvider";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  return (

    <Router>
      <ThemeProvider>
        <ErrorProvider>
          <Routes>
            <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/labels" element={<PrivateRoute><Labels /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>

          <ToastContainer position="top-center" autoClose={3000} />
        </ErrorProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;