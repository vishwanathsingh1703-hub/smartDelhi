const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be a valid 10-digit number'),
  body('ward').trim().notEmpty().withMessage('Ward selection is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
  body('role')
    .isIn(['Citizen', 'Worker', 'Admin'])
    .withMessage('Invalid role specified'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  registerValidator,
  loginValidator,
};