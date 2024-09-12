import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import "./Login.css";
import PasswordInput from "../../components/input/PasswordInput";
import { validateEmail } from "../../utils/helper";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-form">
          <h4 className="login-title">Login</h4>
          <form onSubmit={handleLogin}>
            <input 
              id="email"
              type="text" 
              placeholder="Email" 
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
            />
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
               {error && <p className="error-message">{error}</p>}
            <button type="submit" className="btn-primary">Login</button>
          </form>
          <p className="register-prompt">
            Not registered yet?{" "}
            <Link to="/signUp" className="signup-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};


export default Login;