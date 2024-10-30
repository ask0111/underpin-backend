// controllers/userController.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new user
exports.addUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, count: 0, password: hashedPassword, role: 'player' });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { name, email, password, count } = req.body;
  try {
    const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: 'Email not found in the database' });
        }

        const updateData = { name, email, count };

        // If a new password is provided, hash it and add to the updateData
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
            updateData.password = hashedPassword; // Add hashed password to the update
        }

        // Update the user by ID
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(updatedUser); // Send the updated user back
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Block/unblock a user
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
