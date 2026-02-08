import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processCombo } from '@/lib/combo';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, items, groupId, imageUrl } = body;

        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // 1. Ensure User Exists
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({ data: { id: userId } });
        }

        // 2. Process Combo
        const { hash, sortedItems } = processCombo(items);
        const itemListString = JSON.stringify(sortedItems);

        // 3. Find or Create Combo (Global Check)
        let combo = await prisma.combo.findUnique({ where: { hash } });
        const isGlobalNew = !combo;

        if (!combo) {
            combo = await prisma.combo.create({
                data: {
                    hash,
                    itemList: itemListString,
                    seenCount: 1,
                },
            });
        } else {
            // Increment seen count
            combo = await prisma.combo.update({
                where: { id: combo.id },
                data: { seenCount: { increment: 1 } },
            });
        }

        // 4. Check Group Newness (if groupId provided)
        let isGroupNew = false;
        let groupName = null;

        if (groupId) {
            const group = await prisma.group.findUnique({ where: { id: groupId } });
            if (group) {
                groupName = group.name;
                // Check if this group has seen this combo before
                // We check if there are ANY submissions for this combo in this group
                // EXCLUDING the one we are about to create (which doesn't exist yet)
                const existingGroupSubmission = await prisma.submission.findFirst({
                    where: {
                        groupId: groupId,
                        comboId: combo.id,
                    },
                });
                isGroupNew = !existingGroupSubmission;
            }
        }

        // 5. Create Submission
        const submission = await prisma.submission.create({
            data: {
                userId: user.id,
                groupId: groupId || null,
                comboId: combo.id,
                imageUrl: imageUrl || null,
                confirmedItems: itemListString,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                comboId: combo.id,
                hash: combo.hash,
                items: sortedItems,
                isGlobalNew,
                isGroupNew,
                seenCount: combo.seenCount,
                groupName,
                submissionId: submission.id,
            },
        });

    } catch (error) {
        console.error('Error logging snackigami:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
