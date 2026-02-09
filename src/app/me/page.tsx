import { createClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import AuthComponent from '@/components/AuthComponent';

export const dynamic = 'force-dynamic';

export default async function MePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="animate-enter">
                <h1 className="heading-xl">My Profile</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>Sign in to track your snack history.</p>
                <AuthComponent />
            </div>
        );
    }

    return (
        <div className="animate-enter">
            <h1 className="heading-xl">Me</h1>
            <div className="card">
                <p className="text-muted">Signed in as:</p>
                <h3>{user.email}</h3>

                <form action="/auth/signout" method="post">
                    <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>Sign Out</button>
                </form>
            </div>

            <h2 style={{ marginTop: '2rem' }}>My Pantry 🥨</h2>
            <p className="text-muted">Your combo history will appear here.</p>
        </div>
    );
}
