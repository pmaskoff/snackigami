import { processCombo } from '../src/lib/combo';
// We can't import prisma directly easily in a standalone ts-node script without setting up ts-node for the project path, 
// so we'll use a fetch-based verification if server is running, OR just rely on unit tests.
// Given I am in the agent environment, I can write a script that imports prisma if I run it with `npx tsx`.

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Starting verification...');

    // 1. Clean DB (optional, but good for deterministic test)
    // await prisma.submission.deleteMany();
    // await prisma.groupMember.deleteMany();
    // await prisma.group.deleteMany();
    // await prisma.combo.deleteMany();
    // await prisma.user.deleteMany();

    const user1Id = 'user-test-1';
    const user2Id = 'user-test-2';
    const groupName = 'TestGroup';
    const items = ['Chips', 'Soda'];

    // Create Users
    await prisma.user.upsert({ where: { id: user1Id }, update: {}, create: { id: user1Id } });
    await prisma.user.upsert({ where: { id: user2Id }, update: {}, create: { id: user2Id } });

    // Create Group
    const group = await prisma.group.create({
        data: {
            name: groupName,
            inviteCode: 'TEST12',
            members: { create: { userId: user1Id } }
        }
    });
    // Add User 2 to Group
    await prisma.groupMember.create({ data: { userId: user2Id, groupId: group.id } });

    console.log('Setup complete. Testing Logic...');

    // User 1 logs Combo (Should be Global NEW, Group NEW)
    // We will call the logic we put in the API route, but we can't easily import the route handler. 
    // So we will verify the LIB logic or just replicate the API logic here to test the detailed interactions.

    // Replicating API logic for test:
    const { hash, sortedItems } = processCombo(items);
    const itemListString = JSON.stringify(sortedItems);

    let combo = await prisma.combo.findUnique({ where: { hash } });
    const isGlobalNew = !combo;

    if (!combo) {
        combo = await prisma.combo.create({ data: { hash, itemList: itemListString, seenCount: 1 } });
    } else {
        combo = await prisma.combo.update({ where: { id: combo.id }, data: { seenCount: { increment: 1 } } });
    }

    // Check Group
    const existingGroupSubmission = await prisma.submission.findFirst({
        where: { groupId: group.id, comboId: combo.id }
    });
    const isGroupNew = !existingGroupSubmission;

    await prisma.submission.create({
        data: { userId: user1Id, groupId: group.id, comboId: combo.id, confirmedItems: itemListString }
    });

    console.log(`User 1 Logged: GlobalNew=${isGlobalNew}, GroupNew=${isGroupNew}`);
    if (!isGlobalNew) console.error('FAIL: Expected Global New');
    if (!isGroupNew) console.error('FAIL: Expected Group New');

    // User 2 logs Same Combo (Should be Global SEEN, Group SEEN)
    const combo2 = await prisma.combo.findUnique({ where: { hash } }); // fetch fresh
    const isGlobalNew2 = !combo2; // Should be false (it exists)

    // Increment
    await prisma.combo.update({ where: { id: combo2!.id }, data: { seenCount: { increment: 1 } } });

    const existingGroupSubmission2 = await prisma.submission.findFirst({
        where: { groupId: group.id, comboId: combo2!.id }
    });
    // existingGroupSubmission2 SHOULD exist now because User 1 logged it
    const isGroupNew2 = !existingGroupSubmission2;

    await prisma.submission.create({
        data: { userId: user2Id, groupId: group.id, comboId: combo2!.id, confirmedItems: itemListString }
    });

    console.log(`User 2 Logged: GlobalNew=${isGlobalNew2}, GroupNew=${isGroupNew2}`);
    if (isGlobalNew2) console.error('FAIL: Expected Global SEEN');
    if (isGroupNew2) console.error('FAIL: Expected Group SEEN');

    console.log('Verification Complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
