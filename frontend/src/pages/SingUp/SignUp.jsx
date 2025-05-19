import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../../components/Navbar/Navbar";
import PasswordInput from "../../components/input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import "./SignUp.css";
import apiClient from "../../utils/apiClient";

const SignUp = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setFormError("");

    try {
      const response = await apiClient.post("/create-account", data);

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      } else if (response.data?.message) {
        setFormError(response.data.message);
      };
    } catch (error) {
      if (error.response?.data?.message) {
        setFormError(error.response.data.message);
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <div className="signup-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h4 className="signup-title">Register</h4>

            <div className="input-wrapper">
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                className="input-box"
                {...register("firstName", { required: "First name is required" })}
                aria-label="First name"
              />
              {errors.firstName && <p className="error-message">{errors.firstName.message}</p>}
            </div>

            <div className="input-wrapper">
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                className="input-box"
                {...register("lastName", { required: "Last name is required" })}
                aria-label="Last name"
              />
              {errors.lastName && <p className="error-message">{errors.lastName.message}</p>}
            </div>

            <div className="input-wrapper">
              <input
                id="email"
                type="text"
                placeholder="Email"
                className="input-box"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address"
                  }
                })}
              />
              {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <div className="input-wrapper">
              <PasswordInput
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
                    message: "Must be 8+ chars, 1 uppercase, 1 number"
                  }
                })}
              />
              {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            {formError && <p className="error-message">{formError}</p>}

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