import { getGlobalLeaderboard, getRecentGlobalFirsts } from '@/app/actions/leaderboard';

export const dynamic = 'force-dynamic';

export default async function RankPage() {
    const leaderboard = await getGlobalLeaderboard();
    const recentFirsts = await getRecentGlobalFirsts();

    return (
        <div className="animate-enter" style={{ paddingBottom: '4rem' }}>
            <h1 className="heading-xl">Rank</h1>

            <section style={{ marginTop: '2rem' }}>
                <h3 className="heading-lg">🏆 Top Explorers</h3>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {leaderboard.length === 0 ? (
                        <p style={{ padding: '1rem', color: '#888' }}>No data yet.</p>
                    ) : (
                        leaderboard.map((entry, i) => (
                            <div key={entry.userId} style={{
                                padding: '1rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: i < 3 ? 'var(--primary)' : '#666',
                                        width: '20px'
                                    }}>
                                        #{i + 1}
                                    </span>
                                    <span>User {entry.userId.slice(0, 4)}...</span>
                                </div>
                                <span style={{ fontWeight: 'bold' }}>{entry.score} items</span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section style={{ marginTop: '2rem' }}>
                <h3 className="heading-lg">⚡ Recent Firsts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recentFirsts.map(sub => (
                        <div key={sub.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                Global Discovery
                            </div>
                            <div style={{ fontSize: '1.2rem' }}>
                                {JSON.parse(sub.confirmedItems).join(' + ')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                Found {new Date(sub.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
