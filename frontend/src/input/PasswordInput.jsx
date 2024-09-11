import React, { useState } from "react";
import "./PasswordInput.css"; 
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setIsShowPassword((prevState) => !prevState);
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
       {isShowPassword ? (
        <FaRegEye
          size={22}
          onClick={toggleShowPassword}
          className="toggle-password-btn"
        />
      ) : (
        <FaRegEyeSlash
          size={22}
          onClick={toggleShowPassword}
          className="toggle-password-btn"
        />
      )}
    </div>
  );
};

export default PasswordInput;