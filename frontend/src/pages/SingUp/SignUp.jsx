import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import PasswordInput from "../../components/input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import "./SignUp.css";
import apiClient from "../../utils/apiClient";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({});

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    let errors = {};

    if (!firstName) {
      errors.firstName = "First name is required";
    }

    if (!lastName) {
      errors.lastName = "Last name is required";
    }

    if (!validateEmail(email)) {
      errors.email = "Email address is required";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    setError({}); 

    try {
      const response = await apiClient.post("/create-account", {
        firstName,
        lastName,
        email,
        password,
      });

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      } else if (response.data && response.data.message) {
        setError({ form: response.data.message });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError({ form: error.response.data.message });
      } else {
        setError({ form: "An unexpected error occurred. Please try again." });
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <div className="signup-form">
          <form onSubmit={handleSignUp}>
            <h4 className="signup-title">Register</h4>

            <div className={`input-wrapper ${error.firstName ? "input-error" : ""}`}>
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                className="input-box"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                aria-label="First name"
              />
              {error.firstName && <p className="error-message">{error.firstName}</p>}
            </div>

            <div className={`input-wrapper ${error.lastName ? "input-error" : ""}`}>
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                className="input-box"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                aria-label="Last name"
              />
              {error.lastName && <p className="error-message">{error.lastName}</p>}
            </div>

            <div className={`input-wrapper ${error.email ? "input-error" : ""}`}>
              <input
                id="email"
                type="text"
                placeholder="Email"
                className="input-box"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email"
              />
              {error.email && <p className="error-message">{error.email}</p>}
            </div>

            <div className={`input-wrapper ${error.password ? "input-error" : ""}`}>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              {error.password && <p className="error-message">{error.password}</p>}
            </div>

            {error.form && <p className="error-message">{error.form}</p>}

            <button type="submit" className="btn-primary">Create account</button>
          </form>
          <p className="signup-prompt">
            Already have an account?{" "}
            <Link to="/login" className="signup-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;