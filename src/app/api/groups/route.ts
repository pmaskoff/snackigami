import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, userId, name, inviteCode } = body;

        // specific actions: 'create' or 'join'
        if (!userId || !action) {
            return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
        }

        // Ensure User Exists (idempotent check similar to log)
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({ data: { id: userId } });
        }

        if (action === 'create') {
            if (!name) return NextResponse.json({ error: 'Group name required' }, { status: 400 });

            // Generate a simple 6-char invite code
            const code = crypto.randomBytes(3).toString('hex').toUpperCase();

            const group = await prisma.group.create({
                data: {
                    name,
                    inviteCode: code,
                    members: {
                        create: { userId: user.id }
                    }
                },
            });

            return NextResponse.json({ success: true, group });
        }

        if (action === 'join') {
            if (!inviteCode) return NextResponse.json({ error: 'Invite code required' }, { status: 400 });

            const group = await prisma.group.findUnique({ where: { inviteCode } });
            if (!group) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });

            // Check if already a member
            const membership = await prisma.groupMember.findUnique({
                where: {
                    userId_groupId: {
                        userId: user.id,
                        groupId: group.id
                    }
                }
            });

            if (!membership) {
                await prisma.groupMember.create({
                    data: {
                        userId: user.id,
                        groupId: group.id
                    }
                });
            }

            return NextResponse.json({ success: true, group });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in groups API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
