export interface Diagnosis {
    diseaseName: string;
    description: string;
    organicTreatment: string[];
    chemicalTreatment: string[];
}

export interface ChiliData {
    varietyName: string;
    species: string;
    shu: string;
    origin: string;
    flavorProfile: string;
}

export type JournalEntryType = 'Watered' | 'Fertilized' | 'Pest Control' | 'First Flower' | 'Harvested' | 'Note';

export interface JournalEntry {
    id: string;
    date: string;
    type: JournalEntryType;
    notes: string;
    imageUrl?: string;
    userId: string;
}

export interface Plant {
    id: string;
    name: string;
    variety: string;
    userId: string;
    entries: JournalEntry[];
}

export interface Post {
    id: string;
    username: string; // From the user who created it
    text: string;
    date: string;
    imageUrl?: string;
    diagnosis?: string;
    userId: string;
}

export interface WeatherData {
    city: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface User {
    id: string;
    username: string;
}

export type View = 'weather' | 'diagnosis' | 'database' | 'garden' | 'community' | 'profile';