import React from 'react';
import type { Achievement, User } from '../utils/types';

interface ProfileProps {
    user: User;
    unlockedAchievements: string[];
    allAchievements: Achievement[];
    onLogout: () => void;
}

export const Profile = ({ user, unlockedAchievements, allAchievements, onLogout }: ProfileProps) => {
    return (
        <>
            <header>
                <h1><span className="chili-icon">👤</span> Profile & Achievements</h1>
            </header>
            <div className="view-content">
                <h2 className="profile-username">Hey, {user.username}!</h2>
                
                <div className="achievement-list">
                    <h3>Your Badges</h3>
                    {allAchievements.map(ach => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        return (
                            <div key={ach.id} className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                                <div className="achievement-icon">{ach.icon}</div>
                                <div className="achievement-details">
                                    <h4>{ach.name}</h4>
                                    <p>{ach.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button onClick={onLogout} className="delete-button" style={{marginTop: '2rem'}}>Logout</button>
            </div>
        </>
    );
};