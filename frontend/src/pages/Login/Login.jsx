import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../../components/Navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import PasswordInput from "../../components/input/PasswordInput";
import apiClient from "../../utils/apiClient.js";
import { useAuth } from "../../hooks/useAuth.js";

const Login = () => {
  const { setUser } = useAuth();
  const { register, handleSubmit, formState: { errors }, } = useForm();
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setFormError("");

    try {
      const response = await apiClient.post("/login", data);

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        const userRes = await apiClient.get("/get-user", {
          headers: { Authorization: `Bearer ${response.data.accessToken}` }
        });
        setUser(userRes.data.user);
        setTimeout(() => {
          navigate("/dashboard");
        }, 100);
      };
    } catch (error) {
      if (error.response?.data?.message) {
        setFormError(error.response.data.message);
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      };
    };
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-form">
          <h4 className="login-title">Login</h4>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              id="email"
              type="text"
              placeholder="Email"
              className="input-box"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              aria-label="Email"
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
            <PasswordInput
              {...register("password", {
                required: "Password is required",
              })}
              placeholder="Password"
            />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
            {formError && <p className="error-message">{formError}</p>}
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