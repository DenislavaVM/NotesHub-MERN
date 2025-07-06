const { check, validationResult } = require("express-validator");
const { ValidationError } = require("../errors");

const atLeastOneField = (fields) => (req, res, next) => {
    const hasAtLeastOne = fields.some(field => req.body[field] !== undefined);
    if (!hasAtLeastOne) {
        return next(new ValidationError("At least one field must be provided to update."));
    }
    next();
};

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ValidationError(errors.array()[0].msg));
    };
    next();
};

const validateIsPinned = [
    check("isPinned")
        .isBoolean()
        .withMessage('"isPinned" must be a boolean value.'),
    handleValidationErrors
];

const validateIsArchived = [
    check("isArchived")
        .isBoolean()
        .withMessage('"isArchived" must be a boolean value.'),
    handleValidationErrors
];

const validateIsCompleted = [
    check("isCompleted")
        .isBoolean()
        .withMessage('"isCompleted" must be a boolean value.'),
    handleValidationErrors
];

const validateNoteFields = [
    check("title").notEmpty().withMessage("Title is required"),
    check("content").notEmpty().withMessage("Content is required"),
    handleValidationErrors
];

const validateRegisterFields = [
    check("firstName").notEmpty().withMessage("First name is required"),
    check("lastName").notEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
        .withMessage("Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character"),
    handleValidationErrors,
];

const validateLoginFields = [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
];

const validateEditNoteFields = [
    atLeastOneField(["title", "content", "labels", "reminder", "isPinned", "color"]),
    check("title").optional().notEmpty().withMessage("Title cannot be empty"),
    check("content").optional(),
    check("labels").optional().isArray().withMessage("Labels must be an array"),
    check("reminder")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Invalid reminder date format"),
    check("isPinned").optional().isBoolean().withMessage("isPinned must be a boolean"),
    check("color")
        .optional()
        .isHexColor()
        .withMessage("Invalid color format"),
    handleValidationErrors,
];

const validateNoteLabelField = [
    check("label").trim().notEmpty().withMessage("Label is required"),
    handleValidationErrors
];

const validateReminderField = [
    check("reminder").notEmpty().isISO8601().withMessage("A valid reminder date is required"),
    handleValidationErrors
];

const validateShareNoteFields = [
    check("emails").isArray({ min: 1 }).withMessage("Emails must be a non-empty array"),
    check("emails.*").isEmail().withMessage("Provide at least one valid email address"),
    handleValidationErrors
];

const validateLabel = [
    check("name").trim().notEmpty().withMessage("Label name is required"),
    handleValidationErrors,
];

module.exports = {
    validateRegisterFields,
    validateLoginFields,
    validateNoteFields,
    validateIsPinned,
    validateIsArchived,
    validateIsCompleted,
    validateEditNoteFields,
    validateNoteLabelField,
    validateReminderField,
    validateShareNoteFields,
    validateLabel,
};