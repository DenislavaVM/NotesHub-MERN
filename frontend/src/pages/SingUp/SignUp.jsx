import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import PasswordInput from "../../components/input/PasswordInput";
import { Link } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import "./SignUp.css";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({});

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
  };

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <div className="signup-form">
          <form onSubmit={handleSignUp}>
            <h4 className="signup-title">Register</h4>

            <label htmlFor="firstName" className="visually-hidden">First name</label>
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
              {error.firstName && <span className="error-icon">!</span>}
              {error.firstName && <p className="error-message">{error.firstName}</p>}
            </div>

            <label htmlFor="lastName" className="visually-hidden">Last name</label>
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
              {error.lastName && <span className="error-icon">!</span>}
              {error.lastName && <p className="error-message">{error.lastName}</p>}
            </div>

            <label htmlFor="email" className="visually-hidden">Email</label>
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
              {error.email && <span className="error-icon">!</span>}
              {error.email && <p className="error-message">{error.email}</p>}
            </div>

            <div className={`input-wrapper ${error.password ? "input-error" : ""}`}>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              {error.password && <span className="error-icon">!</span>}
              {error.password && <p className="error-message">{error.password}</p>}
            </div>

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