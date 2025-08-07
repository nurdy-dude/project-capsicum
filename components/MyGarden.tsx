import React, { useState } from 'react';
import { chiliVarieties } from '../utils/constants';
import type { Plant } from '../utils/types';

export const MyGarden = ({ plants, onAddPlant, onSelectPlant }: { plants: Plant[], onAddPlant: (name: string, variety: string) => void, onSelectPlant: (id: string) => void}) => {
    const [plantName, setPlantName] = useState("");
    const [plantVariety, setPlantVariety] = useState(chiliVarieties[0]);

    const handleAddPlant = (e: React.FormEvent) => {
        e.preventDefault();
        if (plantName.trim()) {
            onAddPlant(plantName.trim(), plantVariety);
            setPlantName("");
            setPlantVariety(chiliVarieties[0]);
        }
    };

    return (
        <>
            <header>
                <h1><span className="chili-icon">🌱</span> My Garden</h1>
                <p>Your Personal Grow Journal</p>
            </header>

            <div className="view-content">
                <form onSubmit={handleAddPlant} className="add-plant-form">
                    <h3>Add a New Plant</h3>
                    <input 
                        type="text" 
                        value={plantName} 
                        onChange={(e) => setPlantName(e.target.value)}
                        placeholder="E.g., Balcony Jalapeño" 
                        required 
                    />
                    <select value={plantVariety} onChange={(e) => setPlantVariety(e.target.value)}>
                        {chiliVarieties.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button type="submit">Add to Garden</button>
                </form>

                <div className="plant-list">
                    {plants.length === 0 ? (
                        <p className="empty-state">Your garden is empty. Add a plant to start journaling!</p>
                    ) : (
                        plants.map(plant => (
                            <div key={plant.id} className="plant-card" onClick={() => onSelectPlant(plant.id)}>
                                <h4>{plant.name}</h4>
                                <p>{plant.variety}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};
