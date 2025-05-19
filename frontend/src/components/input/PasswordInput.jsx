import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import "./PasswordInput.css";

const PasswordInput = React.forwardRef(({ name, onChange, onBlur, placeholder }, ref) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword((prevState) => !prevState);
  };

  return (
    <div className="password-input-container">
      <input
        ref={ref}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        type={isShowPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        className="password-input-field"
        aria-label={placeholder || "Password"}
      />
      <button
        type="button"
        onClick={toggleShowPassword}
        className="toggle-password-btn"
        aria-label={isShowPassword ? "Hide password" : "Show password"}
      >
        {isShowPassword ? (
          <FaRegEyeSlash size={22} />
        ) : (
          <FaRegEye size={22} />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;