const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function check() {
    const prisma = new PrismaClient();
    try {
        console.log('Fetching contacts...');
        const contacts = await prisma.contact.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        fs.writeFileSync('diagnostic_result.txt', `Success! Found ${contacts.length} contacts.`);
        console.log('Success!');
    } catch (e) {
        console.error('Error:', e);
        fs.writeFileSync('diagnostic_error.txt', e.stack || e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
