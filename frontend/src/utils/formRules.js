export const emailValidation = {
    required: "Email is required",
    pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address",
    },
};

export const passwordValidation = {
    required: "Password is required",
    minLength: {
        value: 8,
        message: "Password must be at least 8 characters long",
    },
    pattern: {
        value: /^(?=.*[A-Z])(?=.*\d)/,
        message: "Must contain at least one uppercase letter and one number",
    },
};

export const requiredField = (label) => ({
    required: `${label} is required`,
});