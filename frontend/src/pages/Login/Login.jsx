import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Link } from "react-router-dom";
import "./Login.css";
import PasswordInput from "../../input/PasswordInput";

const Login = () => {
  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-form">
          <h4 className="login-title">Login</h4>
          <form onSubmit={() => {}}>
            <input type="text" placeholder="Email" className="input-box" />
              <PasswordInput/>
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