const { check, validationResult } = require("express-validator");

const validateRegisterFields = [
    check("firstName").notEmpty().withMessage("First name is required"),
    check("lastName").notEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password")
        .matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
        .withMessage("Password must be at least 8 characters, include one uppercase letter and one number"),
    handleValidationErrors,
];

const validateLoginFields = [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
];

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({ error: true, message: errors.array()[0].msg });
    }
    next();
}

module.exports = {
    validateRegisterFields,
    validateLoginFields,
};