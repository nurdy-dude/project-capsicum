import type { JournalEntryType, Achievement } from './types';

export const chiliVarieties = ["Jalapeño", "Habanero", "Carolina Reaper", "Ghost Pepper (Bhut Jolokia)", "Cayenne", "Serrano", "Poblano", "Scotch Bonnet", "Aji Charapita", "Bell Pepper"];

export const eventTypes: JournalEntryType[] = ['Note', 'Watered', 'Fertilized', 'Pest Control', 'First Flower', 'Harvested'];
export const eventIcons: Record<JournalEntryType, string> = {
    'Note': '📝',
    'Watered': '💧',
    'Fertilized': '🌿',
    'Pest Control': '🐞',
    'First Flower': '🌸',
    'Harvested': '🌶️'
};

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_plant',
        name: 'Green Thumb',
        description: 'You added your very first plant to the garden!',
        icon: '🌱',
    },
    {
        id: 'first_entry',
        name: 'Field Reporter',
        description: 'You made your first journal entry.',
        icon: '📝',
    },
    {
        id: 'first_harvest',
        name: 'Bountiful Harvest',
        description: 'You logged your first harvest. Well done!',
        icon: '🌶️',
    },
    {
        id: 'first_diagnosis',
        name: 'Plant Medic',
        description: 'You used Dr. Chili to diagnose a plant for the first time.',
        icon: '🩺',
    },
    {
        id: 'researcher',
        name: 'Researcher',
        description: 'You looked up a chili in the database.',
        icon: '📚',
    },
    {
        id: 'joined_community',
        name: 'Town Crier',
        description: 'You set a username and joined the community.',
        icon: '💬',
    },
    {
        id: 'first_post',
        name: 'On the Air',
        description: 'You made your first post in the community feed.',
        icon: '📢',
    },
    {
        id: 'sharer',
        name: 'Helpful Hand',
        description: 'You shared a diagnosis with the community for feedback.',
        icon: '🤝',
    },
];