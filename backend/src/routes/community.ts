import express from 'express';
import { pool } from '../server';

export const communityRouter = express.Router();

// Get all community posts
communityRouter.get('/posts', async (req, res) => {
    try {
        // Join with users table to get the username
        const result = await pool.query(
            'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC LIMIT 50'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching posts.' });
    }
});

// Add a new post
communityRouter.post('/posts', async (req, res) => {
    const { text, imageUrl, diagnosis } = req.body;
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            'INSERT INTO posts (user_id, text, image_url, diagnosis) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, text, imageUrl, diagnosis]
        );
        
        // We need to return the username with the new post
        const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
        const newPost = {
            ...result.rows[0],
            username: userResult.rows[0].username,
        }

        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating post.' });
    }
});