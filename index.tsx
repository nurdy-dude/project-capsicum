import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { api } from './utils/api';

// Components
import { WeatherGuide } from './components/WeatherGuide';
import { DrChili } from './components/DrChili';
import { ChiliDatabase } from './components/ChiliDatabase';
import { CommunityFeed } from './components/CommunityFeed';
import { MyGarden } from './components/MyGarden';
import { PlantJournal } from './components/PlantJournal';
import { Profile } from './components/Profile';
import { Toast } from './components/Toast';
import { Auth } from './components/Auth';

// Types and Constants
import type { View, Plant, Post, JournalEntry, User } from './utils/types';
import { ACHIEVEMENTS } from './utils/constants';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [view, setView] = useState<View>('weather');
    const [plants, setPlants] = useState<Plant[]>([]);
    const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
    const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAuth = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getProfile();
            setUser(data.user);
            setUnlockedAchievements(data.achievements);
            setIsAuthenticated(true);
        } catch (error) {
            console.log("Not authenticated");
            setIsAuthenticated(false);
            setUser(null);
            api.setToken(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    
    const fetchData = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const [plantsData, postsData] = await Promise.all([
                api.getPlants(),
                api.getPosts()
            ]);
            setPlants(plantsData);
            setCommunityPosts(postsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setToastMessage("Could not load your data.");
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleUnlockAchievement = useCallback(async (achievementId: string) => {
        if (!unlockedAchievements.includes(achievementId)) {
            const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
            if (achievement) {
                try {
                    await api.unlockAchievement(achievementId);
                    setUnlockedAchievements(prev => [...prev, achievementId]);
                    setToastMessage(`Achievement Unlocked: ${achievement.name}`);
                } catch (error) {
                     console.error("Failed to unlock achievement", error);
                }
            }
        }
    }, [unlockedAchievements]);
    
    const handleLogout = () => {
        api.setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        setPlants([]);
        setCommunityPosts([]);
        setUnlockedAchievements([]);
        setView('weather');
    }

    const addPlant = async (name: string, variety: string) => {
        try {
            const newPlant = await api.addPlant(name, variety);
            setPlants(prev => [newPlant, ...prev]);
            if (plants.length === 0) handleUnlockAchievement('first_plant');
        } catch (error) {
            console.error(error);
            setToastMessage("Failed to add plant.");
        }
    };

    const deletePlant = async (plantId: string) => {
        if (window.confirm("Are you sure you want to delete this plant and all its entries?")) {
            try {
                await api.deletePlant(plantId);
                setPlants(prevPlants => prevPlants.filter(p => p.id !== plantId));
                setSelectedPlantId(null);
            } catch (error) {
                console.error(error);
                setToastMessage("Failed to delete plant.");
            }
        }
    };
    
    const addJournalEntry = async (plantId: string, newEntryData: Omit<JournalEntry, 'id' | 'date' | 'userId'>) => {
        try {
            const newEntry = await api.addJournalEntry(plantId, newEntryData);
            setPlants(prevPlants => prevPlants.map(p => 
                p.id === plantId ? { ...p, entries: [newEntry, ...p.entries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) } : p
            ));
            const plant = plants.find(p => p.id === plantId);
            if (plant && plant.entries.length === 0) handleUnlockAchievement('first_entry');
            if (newEntry.type === 'Harvested') handleUnlockAchievement('first_harvest');
        } catch (error) {
            console.error(error);
            setToastMessage("Failed to add journal entry.");
        }
    };
    
    const handleAddPost = async (text: string) => {
        try {
            const newPost = await api.addPost({text});
            setCommunityPosts(prevPosts => [newPost, ...prevPosts]);
            if (communityPosts.length === 0) handleUnlockAchievement('first_post');
        } catch (error) {
            console.error(error);
            setToastMessage("Failed to create post.");
        }
    };
    
    const handleShareDiagnosis = async (diagnosisName: string, imageUrl: string) => {
        try {
            const text = "My plant might have an issue. What do you all think? Here's what Dr. Chili suggested.";
            const newPost = await api.addPost({text, imageUrl, diagnosis: diagnosisName});
            setCommunityPosts(prevPosts => [newPost, ...prevPosts]);
            setView('community');
            handleUnlockAchievement('sharer');
        } catch (error) {
            console.error(error);
            setToastMessage("Failed to share diagnosis.");
        }
    };

    const selectedPlant = plants.find(p => p.id === selectedPlantId);

    const handleSetView = (newView: View) => {
        if (newView !== 'garden') {
          setSelectedPlantId(null);
        }
        setView(newView);
    }

    if (isLoading) {
        return <div className="loader-container"><div className="loader"></div></div>;
    }

    if (!isAuthenticated) {
        return <Auth onLoginSuccess={checkAuth} />;
    }

    const renderView = () => {
        switch(view) {
            case 'weather':
                return <WeatherGuide />;
            case 'diagnosis':
                return <DrChili onShareDiagnosis={handleShareDiagnosis} onDiagnoseComplete={() => handleUnlockAchievement('first_diagnosis')} />;
            case 'database':
                return <ChiliDatabase onDatabaseLookup={() => handleUnlockAchievement('researcher')} />;
            case 'community':
                return <CommunityFeed 
                            user={user!} 
                            posts={communityPosts} 
                            onAddPost={handleAddPost} 
                        />;
            case 'garden':
                return selectedPlant 
                    ? <PlantJournal 
                        plant={selectedPlant} 
                        onBack={() => setSelectedPlantId(null)}
                        onAddEntry={addJournalEntry}
                        onDeletePlant={deletePlant}
                      /> 
                    : <MyGarden 
                        plants={plants} 
                        onAddPlant={addPlant}
                        onSelectPlant={setSelectedPlantId} 
                      />;
            case 'profile':
                 return <Profile user={user!} unlockedAchievements={unlockedAchievements} allAchievements={ACHIEVEMENTS} onLogout={handleLogout} />;
            default:
                return <WeatherGuide />;
        }
    }

    return (
        <>
            <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
            <div className="container">
                {renderView()}
            </div>
            <nav className="bottom-nav">
                <button onClick={() => handleSetView('weather')} className={view === 'weather' ? 'active' : ''}>
                    <span className="nav-icon">☁️</span> <span className="nav-text">Weather</span>
                </button>
                <button onClick={() => handleSetView('garden')} className={view === 'garden' ? 'active' : ''}>
                    <span className="nav-icon">🌱</span> <span className="nav-text">Garden</span>
                </button>
                <button onClick={() => handleSetView('community')} className={view === 'community' ? 'active' : ''}>
                    <span className="nav-icon">💬</span> <span className="nav-text">Community</span>
                </button>
                <button onClick={() => handleSetView('database')} className={view === 'database' ? 'active' : ''}>
                    <span className="nav-icon">📚</span> <span className="nav-text">Database</span>
                </button>
                <button onClick={() => handleSetView('diagnosis')} className={view === 'diagnosis' ? 'active' : ''}>
                    <span className="nav-icon">🩺</span> <span className="nav-text">Dr. Chili</span>
                </button>
                <button onClick={() => handleSetView('profile')} className={view === 'profile' ? 'active' : ''}>
                    <span className="nav-icon">👤</span> <span className="nav-text">Profile</span>
                </button>
            </nav>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
