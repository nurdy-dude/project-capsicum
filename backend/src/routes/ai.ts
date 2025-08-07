import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import type { WeatherData, Diagnosis, ChiliData } from '../../../utils/types';

export const aiRouter = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

aiRouter.post('/diagnose', async (req, res) => {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) {
        return res.status(400).json({ message: 'Image data and mimeType are required.' });
    }

    try {
        const imagePart = {
            inlineData: { data: imageBase64, mimeType },
        };
        const textPart = {
            text: `You are "Dr. Chili", an expert AI specializing in diagnosing diseases and pests affecting chili pepper plants. Analyze this image and provide a diagnosis. If the image is not a chili plant or the issue is unclear, state that clearly.`
        };

        const diagnosisSchema = {
            type: Type.OBJECT,
            properties: {
                diseaseName: { type: Type.STRING, description: "The common name of the disease or pest." },
                description: { type: Type.STRING, description: "A detailed description of the issue, its causes, and symptoms." },
                organicTreatment: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of organic treatment options." },
                chemicalTreatment: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of chemical treatment options." }
            },
            required: ["diseaseName", "description", "organicTreatment", "chemicalTreatment"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: diagnosisSchema,
            }
        });

        const parsedDiagnosis = JSON.parse(response.text) as Diagnosis;
        res.json(parsedDiagnosis);

    } catch (err) {
        console.error("AI Diagnosis Error:", err);
        res.status(500).json({ message: "Failed to get AI diagnosis." });
    }
});


aiRouter.post('/chili-data', async (req, res) => {
    const { chiliName } = req.body;
    if (!chiliName) {
        return res.status(400).json({ message: 'chiliName is required.' });
    }

    try {
        const chiliDataSchema = {
            type: Type.OBJECT,
            properties: {
                varietyName: { type: Type.STRING, description: "The name of the chili variety." },
                species: { type: Type.STRING, description: "The species of the chili (e.g., Capsicum annuum)." },
                shu: { type: Type.STRING, description: "The Scoville Heat Unit (SHU) range." },
                origin: { type: Type.STRING, description: "The geographical origin of the chili pepper." },
                flavorProfile: { type: Type.STRING, description: "A brief description of its flavor." }
            },
            required: ["varietyName", "species", "shu", "origin", "flavorProfile"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide a detailed profile for the ${chiliName} chili pepper.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: chiliDataSchema,
            }
        });
        
        const parsedData = JSON.parse(response.text) as ChiliData;
        res.json(parsedData);

    } catch (err) {
        console.error("AI Chili Data Error:", err);
        res.status(500).json({ message: "Failed to get chili data." });
    }
});


aiRouter.post('/weather-tip', async (req, res) => {
    const weatherData: WeatherData = req.body;
    if (!weatherData) {
        return res.status(400).json({ message: 'Weather data is required.' });
    }

    try {
        const prompt = `
            You are an expert chili pepper gardener. Based on the following weather conditions, provide a short, actionable tip for a chili grower.
            Keep the tip concise and easy to understand (2-3 sentences).
            
            Weather Data:
            - Location: ${weatherData.city}
            - Temperature: ${weatherData.temperature}°C
            - Condition: ${weatherData.condition}
            - Humidity: ${weatherData.humidity}%
            - Wind Speed: ${weatherData.windSpeed} km/h
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ tip: response.text });
    } catch (err) {
        console.error("AI Weather Tip Error:", err);
        res.status(500).json({ message: "Failed to get AI weather tip." });
    }
});