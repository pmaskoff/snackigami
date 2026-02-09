export const getApiUrl = () => {
    // If we are in the browser/Vercel, use relative path (proxied)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.protocol.includes('http')) {
        // Actually, Capacitor apps run on http://localhost or capacitor://localhost
        // But simpler: use an ENV var.
    }

    // For this beta, we will hardcode the production URL for the mobile build
    // or use a public environment variable.
    return process.env.NEXT_PUBLIC_API_URL || '';
};
