'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '1rem',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            zIndex: 100
        }}>
            <Link href="/rank" style={{
                flex: 1,
                textAlign: 'center',
                color: isActive('/rank') ? 'var(--primary)' : '#666',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem'
            }}>
                RANK
            </Link>

            <Link href="/" style={{
                flex: 1,
                textAlign: 'center',
                color: pathname === '/' ? 'var(--primary)' : '#666',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                marginTop: '-5px'
            }}>
                SCAN
            </Link>

            <Link href="/me" style={{
                flex: 1,
                textAlign: 'center',
                color: isActive('/me') ? 'var(--primary)' : '#666',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem'
            }}>
                ME
            </Link>
        </div>
    );
}
