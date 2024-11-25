import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Function to generate a token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const signup = async (req, res) => {
    const { name, email, password, role, address } = req.body; // Include address
    if (!name || !email || !password || !role || !address) // Validate address field
        return res.status(400).json({ message: 'All fields are required' });

    try {
        const userExists = await User.findOne({ email });
        if (userExists) 
            return res.status(400).json({ message: 'User already exists' });

        // Create the user
        const user = await User.create({ name, email, password, role, address });

        // Generate a token
        const token = generateToken(user._id);

        res.status(201).json({ status: true, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a token
        const token = generateToken(user._id);

        res.json({ status: true, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const logout = async (req, res) => {
    try {
        // Respond with a success message
        res.status(200).json({ status: true, message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Logout failed', error: err.message });
    }
};
