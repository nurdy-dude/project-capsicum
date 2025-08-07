import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { authRouter } from './routes/auth';
import { gardenRouter } from './routes/garden';
import { communityRouter } from './routes/community';
import { profileRouter } from './routes/profile';
import { aiRouter } from './routes/ai';
import { authMiddleware } from './middleware/auth';


const app = express();
const port = process.env.PORT || 3000;

// Database connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createDbTables = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS plants (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                variety VARCHAR(100) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS journal_entries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                date TIMESTAMPTZ DEFAULT NOW(),
                type VARCHAR(50) NOT NULL,
                notes TEXT,
                image_url TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                image_url TEXT,
                diagnosis VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS achievements (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                achievement_id VARCHAR(100) NOT NULL,
                unlocked_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(user_id, achievement_id)
            );
        `);
        console.log("Database tables are set up.");
    } catch (err) {
        console.error("Error creating database tables:", err);
    } finally {
        client.release();
    }
}

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for images

// API routes
app.use('/api/auth', authRouter);
app.use('/api/ai', authMiddleware, aiRouter);
app.use('/api/garden', authMiddleware, gardenRouter);
app.use('/api/community', authMiddleware, communityRouter);
app.use('/api/profile', authMiddleware, profileRouter);

app.get('/api', (req, res) => {
    res.send('Project Capsicum API is running!');
});

app.listen(port, async () => {
    console.log(`Backend server listening on port ${port}`);
    await createDbTables();
});