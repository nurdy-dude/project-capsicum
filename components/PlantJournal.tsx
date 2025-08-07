import React, { useState } from 'react';
import { eventTypes, eventIcons } from '../utils/constants';
import { fileToDataUrl } from '../utils/helpers';
import type { Plant, JournalEntry, JournalEntryType } from '../utils/types';

export const PlantJournal = ({ plant, onBack, onAddEntry, onDeletePlant }: { plant: Plant, onBack: () => void, onAddEntry: (plantId: string, entry: Omit<JournalEntry, 'id' | 'date' | 'userId'>) => void, onDeletePlant: (plantId: string) => void }) => {
    const [entryType, setEntryType] = useState<JournalEntryType>('Note');
    const [entryNotes, setEntryNotes] = useState("");
    const [entryImage, setEntryImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEntryImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (entryNotes.trim() || entryImage) {
            let imageUrl: string | undefined = undefined;
            if (entryImage) {
                imageUrl = await fileToDataUrl(entryImage);
            }
            onAddEntry(plant.id, {
                type: entryType,
                notes: entryNotes.trim(),
                imageUrl
            });
            setEntryType('Note');
            setEntryNotes("");
            setEntryImage(null);
            setImagePreview(null);
        }
    };
    
    return (
        <>
            <header>
                <button onClick={onBack} className="back-button">← Back to Garden</button>
                <h1>{plant.name}</h1>
                <p className="journal-subtitle">{plant.variety}</p>
            </header>

            <div className="view-content">
                <form onSubmit={handleAddEntry} className="add-entry-form">
                    <select value={entryType} onChange={e => setEntryType(e.target.value as JournalEntryType)}>
                        {eventTypes.map(type => (
                            <option key={type} value={type}>{eventIcons[type]} {type}</option>
                        ))}
                    </select>
                    <textarea 
                        value={entryNotes} 
                        onChange={e => setEntryNotes(e.target.value)} 
                        placeholder="Add notes... (e.g., Watered with nutrients, spotted first ripe pod!)"
                        rows={3}
                    ></textarea>

                    <input type="file" id="entry-image-upload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    <label htmlFor="entry-image-upload" className="file-upload-button">
                        {imagePreview ? 'Change Photo' : '📷 Add Photo'}
                    </label>

                    {imagePreview && (
                        <div className="entry-image-preview">
                            <img src={imagePreview} alt="Journal entry preview" />
                        </div>
                    )}
                    
                    <button type="submit">Add Journal Entry</button>
                </form>
                
                <div className="journal-entries">
                    <h3>Journal Entries</h3>
                    {plant.entries.length === 0 ? (
                        <p className="empty-state">No entries yet. Add one above!</p>
                    ) : (
                        [...plant.entries].reverse().map(entry => (
                            <div key={entry.id} className="entry-card">
                                <div className="entry-header">
                                    <span className="entry-icon">{eventIcons[entry.type]}</span>
                                    <h4 className="entry-title">{entry.type}</h4>
                                    <span className="entry-date">{new Date(entry.date).toLocaleString()}</span>
                                </div>
                                {entry.notes && <p className="entry-notes">{entry.notes}</p>}
                                {entry.imageUrl && (
                                    <div className="entry-image">
                                        <img src={entry.imageUrl} alt={`Journal entry for ${entry.type}`} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <button onClick={() => onDeletePlant(plant.id)} className="delete-button">Delete Plant</button>
            </div>
        </>
    );
};