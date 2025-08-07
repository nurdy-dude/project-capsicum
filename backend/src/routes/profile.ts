import express from 'express';
import { pool } from '../server';
import { authMiddleware } from '../middleware/auth';

export const profileRouter = express.Router();
profileRouter.use('/', authMiddleware);

// Get user profile (username) and their unlocked achievements
profileRouter.get('/', async (req, res) => {
    const userId = req.user.userId;
    try {
        const userResult = await pool.query('SELECT id, username FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const achievementsResult = await pool.query('SELECT achievement_id FROM achievements WHERE user_id = $1', [userId]);
        
        const profileData = {
            user: userResult.rows[0],
            achievements: achievementsResult.rows.map(r => r.achievement_id),
        };

        res.json(profileData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
});

// Unlock an achievement
profileRouter.post('/achievements', async (req, res) => {
    const { achievementId } = req.body;
    const userId = req.user.userId;

    if (!achievementId) {
        return res.status(400).json({ message: 'achievementId is required.' });
    }

    try {
        await pool.query(
            'INSERT INTO achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, achievementId]
        );
        res.status(201).json({ message: 'Achievement unlocked.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error unlocking achievement.' });
    }
});