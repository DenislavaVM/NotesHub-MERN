import { useForm } from "react-hook-form";
import PasswordInput from "../../components/input/PasswordInput";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import { useAuth } from "../../hooks/useAuth";
import "./SignUp.css";

const SignUp = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await apiClient.post("/auth/create-account", data);
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
    <div className="signup-page-container">
      <div className="signup-form">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h4 className="signup-title">Register</h4>

          <div className="name-inputs">
            <div className="input-wrapper">
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                className="input-box"
                {...register("firstName", { required: "First name is required" })}
                aria-label="First name"
              />
              {errors.firstName && (
                <p className="error-message">{errors.firstName.message}</p>
              )}
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
              {errors.lastName && (
                <p className="error-message">{errors.lastName.message}</p>
              )}
            </div>
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
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <div className="input-wrapper">
            <PasswordInput
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                  message:
                    "Password must be 8+ chars, with uppercase, lowercase, number & special character.",
                },
              })}
            />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          {errors.root?.serverError && (
            <p className="error-message">{errors.root.serverError.message}</p>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="signup-prompt">
          Already have an account?{" "}
          <Link to="/login" className="signup-link">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;