const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { registerValidator, loginValidator } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, AuthController.register);
router.post('/login', loginValidator, validateRequest, AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/profile', authMiddleware, AuthController.profile);

module.exports = router;