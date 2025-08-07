import React, { useState } from 'react';
import { api } from '../utils/api';

interface AuthProps {
    onLoginSuccess: () => void;
}

export const Auth = ({ onLoginSuccess }: AuthProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const authFn = isLogin ? api.login : api.register;
            const data = await authFn(username, password);
            api.setToken(data.token);
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <header>
                <h1><span className="chili-icon">🌶️</span> Project Capsicum</h1>
                <p>{isLogin ? 'Login to your garden' : 'Create a new account'}</p>
            </header>
            <div className="view-content">
                <form onSubmit={handleSubmit} className="add-plant-form">
                    {error && <p className="error-message" style={{marginBottom: '1rem'}}>{error}</p>}
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
                <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    disabled={loading}
                    style={{ background: 'transparent', color: 'var(--primary-color)', marginTop: '1rem' }}
                >
                    {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
};
