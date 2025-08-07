// A centralized API wrapper
const API_BASE_URL = '/api';

interface ApiConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: object;
    token?: string | null;
}

const request = async (endpoint: string, config: ApiConfig = {}) => {
    const { method = 'GET', body, token } = config;
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'API request failed');
    }

    if (response.status === 204) { // No Content
        return;
    }
    
    return response.json();
};

let authToken: string | null = localStorage.getItem('project-capsicum-token');

export const api = {
    setToken: (token: string | null) => {
        authToken = token;
        if (token) {
            localStorage.setItem('project-capsicum-token', token);
        } else {
            localStorage.removeItem('project-capsicum-token');
        }
    },

    register: (username, password) => request('/auth/register', { method: 'POST', body: { username, password } }),
    login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),

    getProfile: () => request('/profile', { token: authToken }),
    unlockAchievement: (achievementId) => request('/profile/achievements', { method: 'POST', body: { achievementId }, token: authToken }),

    getPlants: () => request('/garden/plants', { token: authToken }),
    addPlant: (name, variety) => request('/garden/plants', { method: 'POST', body: { name, variety }, token: authToken }),
    deletePlant: (plantId) => request(`/garden/plants/${plantId}`, { method: 'DELETE', token: authToken }),
    
    addJournalEntry: (plantId, entryData) => request(`/garden/plants/${plantId}/entries`, { method: 'POST', body: entryData, token: authToken }),

    getPosts: () => request('/community/posts', { token: authToken }),
    addPost: (postData: {text: string, imageUrl?: string, diagnosis?: string}) => request('/community/posts', { method: 'POST', body: postData, token: authToken }),

    // AI Endpoints
    diagnosePlant: (imageBase64: string, mimeType: string) => request('/ai/diagnose', { method: 'POST', body: { imageBase64, mimeType }, token: authToken }),
    getChiliData: (chiliName: string) => request('/ai/chili-data', { method: 'POST', body: { chiliName }, token: authToken }),
    getWeatherTip: (weatherData) => request('/ai/weather-tip', { method: 'POST', body: weatherData, token: authToken }),
};
