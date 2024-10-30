const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Register a new user
exports.register = async (req, res) => {
  const { name, email, password, role="player" } = req.body;
  try {
    const user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login a user and return a token
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user.isBlocked) {
      return res.status(401).json({ message: 'Your Account Blocked' });
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role}, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verify = async (req, res)=>{
    const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    try {
      const user = await User.findById(decoded.userId);
      if(user.isBlocked){
        return res.status(401).json({ message: "Blocked Your Account" });
      }else{
        res.status(200).json({ message: "Token valid", user: decoded });
      }
    } catch (error) {
      res.status(200).json({ message: "Internal server error"});
    }
  });
}

exports.verifyAdmin = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Check if the user role is 'admin'
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }
        // Token is valid and user is an admin
        res.status(200).json({ message: "Token valid", user: decoded });
    });
};

