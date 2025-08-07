import React, { useState } from 'react';
import type { Post, User } from '../utils/types';

interface CommunityFeedProps {
    user: User;
    posts: Post[];
    onAddPost: (text: string) => void;
}

export const CommunityFeed = ({ user, posts, onAddPost }: CommunityFeedProps) => {
    const [postText, setPostText] = useState('');

    const handleAddPost = (e: React.FormEvent) => {
        e.preventDefault();
        if (postText.trim()) {
            onAddPost(postText.trim());
            setPostText('');
        }
    };
    
    return (
        <>
            <header>
                <h1><span className="chili-icon">💬</span> Community Feed</h1>
                <p>Welcome, {user.username}!</p>
            </header>
            <div className="view-content">
                <form onSubmit={handleAddPost} className="add-post-form">
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="Share an update or ask a question..."
                        rows={4}
                        required
                    ></textarea>
                    <button type="submit">Post to Feed</button>
                </form>

                <div className="post-list">
                    {posts.length === 0 ? (
                        <p className="empty-state">No posts yet. Be the first!</p>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="post-card">
                                <div className="post-header">
                                    <span className="post-username">{post.username}</span>
                                    <span className="post-date">{new Date(post.date).toLocaleString()}</span>
                                </div>
                                
                                {post.diagnosis && post.imageUrl && (
                                    <div className="post-diagnosis-banner">
                                        <strong>Dr. Chili Suggests:</strong> {post.diagnosis}
                                    </div>
                                )}

                                {post.imageUrl && (
                                     <div className="post-image">
                                        <img src={post.imageUrl} alt="User shared content" />
                                    </div>
                                )}
                                
                                <p className="post-text">{post.text}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};