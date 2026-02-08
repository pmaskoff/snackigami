'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface RevealData {
    comboId: string;
    hash: string;
    items: string[];
    isGlobalNew: boolean;
    isGroupNew: boolean;
    seenCount: number;
    groupName?: string;
}

export default function SnackLogger() {
    const [items, setItems] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [groupId, setGroupId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [revealData, setRevealData] = useState<RevealData | null>(null);

    useEffect(() => {
        // Initialize User
        let storedUserId = localStorage.getItem('snackigami_user_id');
        if (!storedUserId) {
            storedUserId = uuidv4();
            localStorage.setItem('snackigami_user_id', storedUserId);
        }
        setUserId(storedUserId);

        // Initialize Group
        const storedGroupId = localStorage.getItem('snackigami_group_id');
        if (storedGroupId) {
            setGroupId(storedGroupId);
        }
    }, []);

    const addItem = () => {
        if (!inputValue.trim()) return;
        if (items.length >= 6) return;
        setItems([...items, inputValue.trim()]);
        setInputValue('');
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (items.length === 0 || !userId) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    items,
                    groupId,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setRevealData(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (revealData) {
        return (
            <div className="card animate-enter">
                <h2 className="heading-xl" style={{ textAlign: 'center' }}>
                    {revealData.isGlobalNew ? 'GLOBAL NEW! 🌍' : 'GLOBAL SEEN 🥱'}
                </h2>
                {revealData.groupName && (
                    <h3 style={{ textAlign: 'center', color: revealData.isGroupNew ? 'var(--success)' : 'var(--text-muted)' }}>
                        {revealData.isGroupNew ? `NEW IN ${revealData.groupName.toUpperCase()}! 👥` : `SEEN IN ${revealData.groupName.toUpperCase()}`}
                    </h3>
                )}

                <div style={{ margin: '2rem 0', textAlign: 'center' }}>
                    <p className="text-muted">Combo #{revealData.seenCount}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                        {revealData.items.map((item, i) => (
                            <span key={i} style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontWeight: 'bold'
                            }}>
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                <button className="btn" style={{ marginBottom: '0.5rem' }} onClick={() => {
                    const date = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    const emojis = ['🥨', '🍫', '🥤', '🍟', '🍕', '🍩', '🍪', '🌭', '🌮', '🍿'];
                    // Deterministic emoji selection based on hash chars
                    const itemEmojis = revealData.items.map((_, i) => emojis[revealData.hash.charCodeAt(i) % emojis.length]).join('');

                    const shareText = `SNACKIGAMI 🥨\n🌍 Global: ${revealData.isGlobalNew ? '🆕' : '🥱'}\n${revealData.groupName ? `👥 ${revealData.groupName}: ${revealData.isGroupNew ? '🆕' : '🥱'}\n` : ''}${itemEmojis} (${revealData.items.length} items)\n#${revealData.seenCount} • ${date}`;

                    navigator.clipboard.writeText(shareText);
                    alert('Copied to clipboard!');
                }}>
                    Share Result 📤
                </button>

                <button className="btn btn-secondary" onClick={() => {
                    setItems([]);
                    setRevealData(null);
                }}>
                    Scan Another
                </button>
            </div>
        );
    }

    return (
        <div className="card animate-enter">
            <h1 className="heading-xl">Snackigami</h1>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Log your snack combo.</p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                    className="input"
                    style={{ marginBottom: 0 }}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    placeholder="Ex. Doritos Nacho Cheese"
                />
                <button className="btn" style={{ width: 'auto', padding: '0 1.5rem' }} onClick={addItem}>+</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {items.map((item, i) => (
                    <div key={i} onClick={() => removeItem(i)} style={{
                        background: 'var(--surface-highlight)',
                        border: '1px solid var(--primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {item} <span style={{ opacity: 0.5 }}>×</span>
                    </div>
                ))}
            </div>

            <button
                className="btn"
                disabled={items.length === 0 || isSubmitting}
                onClick={handleSubmit}
                style={{ opacity: items.length === 0 ? 0.5 : 1 }}
            >
                {isSubmitting ? 'Checking...' : 'Check Combo'}
            </button>
        </div>
    );
}
