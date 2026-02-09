'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function AuthComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const supabase = createClient();

    const handleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });
        if (error) setMessage(error.message);
        else setMessage('Check your email for the confirmation link!');
        setLoading(false);
    };

    const handleSignIn = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) setMessage(error.message);
        else window.location.reload(); // Refresh to update auth state
        setLoading(false);
    };

    return (
        <div className="card">
            <h3>Sign In / Sign Up</h3>
            <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn" onClick={handleSignIn} disabled={loading}>
                    {loading ? '...' : 'Sign In'}
                </button>
                <button className="btn btn-secondary" onClick={handleSignUp} disabled={loading}>
                    Sign Up
                </button>
            </div>

            {message && <p style={{ marginTop: '1rem', color: 'var(--accent)' }}>{message}</p>}
        </div>
    );
}
