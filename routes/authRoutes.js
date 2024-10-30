const express = require('express');
const { register, login, verify, verifyAdmin } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/verify', verify);
router.post('/verify-admin', verifyAdmin);
router.post('/login', login);

module.exports = router;
