import express from 'express';
import { pool } from '../server';
import { authMiddleware } from '../middleware/auth';

export const gardenRouter = express.Router();
gardenRouter.use('/', authMiddleware);

// Get all plants for the logged-in user
gardenRouter.get('/plants', async (req, res) => {
    try {
        const plantsResult = await pool.query('SELECT * FROM plants WHERE user_id = $1 ORDER BY created_at DESC', [req.user.userId]);
        const plants = plantsResult.rows;

        // Fetch entries for all plants at once
        const plantIds = plants.map(p => p.id);
        if (plantIds.length > 0) {
            const entriesResult = await pool.query('SELECT * FROM journal_entries WHERE plant_id = ANY($1) ORDER BY date DESC', [plantIds]);
            const entriesByPlant = entriesResult.rows.reduce((acc, entry) => {
                if (!acc[entry.plant_id]) {
                    acc[entry.plant_id] = [];
                }
                acc[entry.plant_id].push(entry);
                return acc;
            }, {});

            plants.forEach(p => {
                p.entries = entriesByPlant[p.id] || [];
            });
        }

        res.json(plants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching plants.' });
    }
});

// Add a new plant
gardenRouter.post('/plants', async (req, res) => {
    const { name, variety } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO plants (user_id, name, variety) VALUES ($1, $2, $3) RETURNING *',
            [req.user.userId, name, variety]
        );
        res.status(201).json({...result.rows[0], entries: []});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding plant.' });
    }
});

// Delete a plant
gardenRouter.delete('/plants/:plantId', async (req, res) => {
    const { plantId } = req.params;
    try {
        await pool.query('DELETE FROM plants WHERE id = $1 AND user_id = $2', [plantId, req.user.userId]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting plant.' });
    }
});

// Add a journal entry to a plant
gardenRouter.post('/plants/:plantId/entries', async (req, res) => {
    const { plantId } = req.params;
    const { type, notes, imageUrl } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO journal_entries (plant_id, user_id, type, notes, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [plantId, req.user.userId, type, notes, imageUrl]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding journal entry.' });
    }
});