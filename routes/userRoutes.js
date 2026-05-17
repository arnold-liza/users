const express = require('express');
const router = express.Router();

// Import controllers and middlewares
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// ==========================================
// 1. PUBLIC AUTHENTICATION ROUTES
// ==========================================

// Register a new user account
router.post('/register', userController.register);

// Log in an existing user and return a JWT
router.post('/login', userController.login);

// ==========================================
// 2. PROTECTED USER PROFILE ROUTES
// ==========================================

// Get the currently authenticated user's profile
router.get('/user', auth, userController.getCurrentUser);

// Get a list of all users (Strictly Restricted to Admin)
router.get('/users', auth, role(['admin']), userController.getAllUsers);

// Get profile details for a specific user (User themselves or Admin)
router.get('/users/:id', auth, userController.getUserById);

// Update details for a specific user profile (User themselves or Admin)
router.put('/users/:id', auth, userController.updateUser);

// Delete a specific user profile permanently (User themselves or Admin)
router.delete('/users/:id', auth, userController.deleteUser);

module.exports = router;