// routes/userRoutes.js
const express = require('express');
const { getUsers, addUser, updateUser, deleteUser, toggleBlockUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getUsers);
router.post('/', auth, addUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);
router.put('/:id/block', auth, toggleBlockUser);

module.exports = router;
