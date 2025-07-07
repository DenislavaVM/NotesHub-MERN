import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import PasswordInput from "../../components/input/PasswordInput";
import apiClient from "../../utils/apiClient.js";
import { useAuth } from "../../hooks/useAuth";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await apiClient.post("/login", data);
      if (response.data && response.data.accessToken) {
        login(response.data.user, response.data.accessToken);
      }
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "An unexpected error occurred.";

      setError("root.serverError", { type: "manual", message });
    }
  };

  return (
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
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
        {errors.root?.serverError && (
          <p className="server-error-message">{errors.root.serverError.message}</p>
        )}
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="register-prompt">
        Not registered yet?{" "}
        <Link to="/signUp" className="signup-link">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default Login;