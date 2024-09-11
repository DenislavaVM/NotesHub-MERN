import React, { useState } from "react";
import "./PasswordInput.css"; // Import the dedicated CSS file

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className="password-input-container">
      <input
        value={value}
        onChange={onChange}
        type={isShowPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        className="password-input-field"
      />
      <button type="button" onClick={toggleShowPassword} className="toggle-password-btn">
        {isShowPassword ? "Hide" : "Show"}
      </button>
    </div>
  );
};

export default PasswordInput;
