import React, { useState, useCallback } from 'react';
import { api } from '../utils/api';
import { chiliVarieties } from '../utils/constants';
import type { ChiliData } from '../utils/types';

interface ChiliDatabaseProps {
    onDatabaseLookup: () => void;
}

export const ChiliDatabase = ({ onDatabaseLookup }: ChiliDatabaseProps) => {
    const [selectedChili, setSelectedChili] = useState<string | null>(null);
    const [chiliData, setChiliData] = useState<ChiliData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchChiliData = useCallback(async (chiliName: string) => {
        setLoading(true);
        setError(null);
        setChiliData(null);
        setSelectedChili(chiliName);

        try {
            const parsedData = await api.getChiliData(chiliName);
            setChiliData(parsedData);
            onDatabaseLookup();
        } catch (err: any) {
            console.error(err);
            setError(err.message || `Failed to fetch data for ${chiliName}. Please try again.`);
        } finally {
            setLoading(false);
        }
    }, [onDatabaseLookup]);

    return (
        <>
            <header>
                <h1><span className="chili-icon">📚</span> Chili Database</h1>
                <p>Explore Chili Varieties</p>
            </header>

            <div className="view-content">
                {error && <div className="error-message">{error}</div>}

                {!selectedChili && !loading && (
                     <div className="chili-list">
                        {chiliVarieties.map(chili => (
                            <button key={chili} className="chili-list-item" onClick={() => fetchChiliData(chili)}>
                                {chili}
                            </button>
                        ))}
                    </div>
                )}
               
                {loading && (
                    <div className="loader-container">
                        <div className="loader"></div>
                        <p>Fetching details for {selectedChili}...</p>
                    </div>
                )}

                {chiliData && (
                    <div className="results-card">
                        <h2>{chiliData.varietyName}</h2>
                        <div className="chili-details">
                            <p><strong>Species:</strong> {chiliData.species}</p>
                            <p><strong>Scoville Heat Units:</strong> {chiliData.shu}</p>
                            <p><strong>Origin:</strong> {chiliData.origin}</p>
                            <p><strong>Flavor Profile:</strong> {chiliData.flavorProfile}</p>
                        </div>
                        <button onClick={() => {
                            setSelectedChili(null);
                            setChiliData(null);
                        }}>Back to List</button>
                    </div>
                )}
            </div>
        </>
    );
};