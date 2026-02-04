const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function check() {
    const prisma = new PrismaClient();
    try {
        console.log('Fetching dependencies...');
        const customer = await prisma.contact.findFirst();
        const analyticAccount = await prisma.analyticAccount.findFirst();
        const product = await prisma.product.findFirst();

        if (!customer || !analyticAccount || !product) {
            console.error('Missing prerequisites:');
            console.error('Customer:', !!customer);
            console.error('AnalyticAccount:', !!analyticAccount);
            console.error('Product:', !!product);
            fs.writeFileSync('diagnostic_error.txt', 'Missing prerequisites in database for testing invoice creation.');
            return;
        }

        console.log('Attempting to create invoice...');
        const invoice = await prisma.customerInvoice.create({
            data: {
                customerId: customer.id,
                invoiceDate: new Date(),
                state: 'DRAFT',
                lines: {
                    create: [
                        {
                            productId: product.id,
                            quantity: 1,
                            price: 100,
                            analyticAccountId: analyticAccount.id
                        }
                    ]
                }
            },
            include: { lines: true }
        });

        fs.writeFileSync('diagnostic_result.txt', `Success! Created invoice with ID: ${invoice.id}`);
        console.log('Success!');
    } catch (e) {
        console.error('Error:', e);
        fs.writeFileSync('diagnostic_error.txt', JSON.stringify(e, null, 2) + '\n' + e.stack);
    } finally {
        await prisma.$disconnect();
    }
}

check();
