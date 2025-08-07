import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../server';

export const authRouter = express.Router();

// Register a new user
authRouter.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserQuery = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, password_hash]
        );
        
        const user = newUserQuery.rows[0];

        // Unlock "Joined Community" achievement
        await pool.query(
            'INSERT INTO achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [user.id, 'joined_community']
        );

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        res.status(201).json({ token, user });

    } catch (error: any) {
        if (error.code === '23505') { // unique_violation
            return res.status(400).json({ message: 'Username already exists.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Login a user
authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});
