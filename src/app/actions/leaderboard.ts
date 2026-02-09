'use server';

import { prisma } from '@/lib/db';

export async function getGlobalLeaderboard() {
    // Aggregate submissions by user
    const grouped = await prisma.submission.groupBy({
        by: ['userId'],
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: 'desc',
            },
        },
        take: 50,
    });

    // Since we don't have a robust Profile sync yet, we will just return the anonymous IDs 
    // or fetch profiles if they exist.
    // In a real app, we would join with the Profile table.

    return grouped.map(g => ({
        userId: g.userId,
        score: g._count.id,
        username: null // Placeholder until we link Profiles
    }));
}

export async function getRecentGlobalFirsts() {
    // Find combos where seenCount is 1 (or derived from valid firsts)
    // For Beta/v1, we can query recent Submissions where the associated Combo has seenCount = 1

    const recentFirsts = await prisma.submission.findMany({
        where: {
            combo: {
                seenCount: 1
            }
        },
        include: {
            combo: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    });

    return recentFirsts;
}
