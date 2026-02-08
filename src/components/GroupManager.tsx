'use client';

import { useState, useEffect } from 'react';

export default function GroupManager() {
    const [groupId, setGroupId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [groupName, setGroupName] = useState<string | null>(null);
    const [inviteCode, setInviteCode] = useState<string | null>(null);

    const [inputName, setInputName] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [view, setView] = useState<'menu' | 'create' | 'join'>('menu');

    useEffect(() => {
        // Sync with local storage
        const uid = localStorage.getItem('snackigami_user_id');
        const gid = localStorage.getItem('snackigami_group_id');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserId(uid);
        setGroupId(gid);

        if (uid && gid) {
            // Fetch group details if we have time, but for now just rely on local state or simple fetch
            // In beta, we might just want to fetch the group name if it's not stored
        }
    }, []);

    const handleCreate = async () => {
        if (!inputName || !userId) return;
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                body: JSON.stringify({ action: 'create', userId, name: inputName })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('snackigami_group_id', data.group.id);
                setGroupId(data.group.id);
                setGroupName(data.group.name);
                setInviteCode(data.group.inviteCode);
                setView('menu');
            }
        } catch (e) { console.error(e); }
    };

    const handleJoin = async () => {
        if (!inputCode || !userId) return;
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                body: JSON.stringify({ action: 'join', userId, inviteCode: inputCode })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('snackigami_group_id', data.group.id);
                setGroupId(data.group.id);
                setGroupName(data.group.name);
                setInviteCode(data.group.inviteCode);
                setView('menu');
            } else {
                alert(data.error);
            }
        } catch (e) { console.error(e); }
    };

    if (groupId) {
        return (
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '2rem' }}>
                <p className="text-muted">Your Group</p>
                <h3>{groupName || 'Member'} <span style={{ fontSize: '0.8em', opacity: 0.7 }}>#{localStorage.getItem('snackigami_group_id')?.slice(0, 4)}</span></h3>
                {inviteCode && <p style={{ color: 'var(--secondary)' }}>Invite Code: {inviteCode}</p>}
                <button
                    style={{ background: 'transparent', border: 'none', color: '#666', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                    onClick={() => {
                        localStorage.removeItem('snackigami_group_id');
                        setGroupId(null);
                        setGroupName(null);
                        setInviteCode(null);
                    }}
                >
                    Leave Group
                </button>
            </div>
        );
    }

    if (view === 'create') {
        return (
            <div className="card">
                <h3>Create Group</h3>
                <input className="input" placeholder="Group Name" value={inputName} onChange={e => setInputName(e.target.value)} />
                <button className="btn" onClick={handleCreate}>Create</button>
                <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setView('menu')}>Cancel</button>
            </div>
        );
    }

    if (view === 'join') {
        return (
            <div className="card">
                <h3>Join Group</h3>
                <input className="input" placeholder="Invite Code" value={inputCode} onChange={e => setInputCode(e.target.value)} />
                <button className="btn" onClick={handleJoin}>Join</button>
                <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setView('menu')}>Cancel</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem', marginTop: '2rem', textAlign: 'center' }}>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>Join a group to track local combos.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setView('create')}>Create Group</button>
                <button className="btn btn-secondary" onClick={() => setView('join')}>Join Group</button>
            </div>
        </div>
    );
}
