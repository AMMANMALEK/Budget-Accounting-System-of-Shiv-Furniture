const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Clearing old data in correct order...');

    // 1. Clear tables that depend on others
    await prisma.vendor_bills.deleteMany({});
    await prisma.purchase_order_lines.deleteMany({});
    await prisma.purchase_orders.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.invoiceLine.deleteMany({});
    await prisma.customerInvoice.deleteMany({});
    await prisma.salesOrderLine.deleteMany({});
    await prisma.salesOrder.deleteMany({});
    await prisma.budgetLine.deleteMany({});
    await prisma.budget.deleteMany({});
    await prisma.autoAnalyticRule.deleteMany({});

    // 2. Clear mid-level tables
    await prisma.product.deleteMany({});
    await prisma.productCategory.deleteMany({});

    // 3. Clear base tables
    await prisma.analyticAccount.deleteMany({});
    await prisma.contact.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Seeding data...');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const portalPassword = await bcrypt.hash('portal123', 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@shivfurniture.com',
            login: 'admin',
            passwordHash: adminPassword,
            role: 'ADMIN',
            active: true
        },
    });

    const portalUser = await prisma.user.create({
        data: {
            name: 'Portal User',
            email: 'portal@shivfurniture.com',
            login: 'portal',
            passwordHash: portalPassword,
            role: 'PORTAL',
            active: true
        },
    });

    const costCenters = [
        { name: 'Marketing', code: 'MKT', budget: 50000 },
        { name: 'Operations', code: 'OPS', budget: 120000 },
        { name: 'IT & Technology', code: 'IT', budget: 80000 },
        { name: 'Human Resources', code: 'HR', budget: 40000 },
        { name: 'Sales & Business Dev', code: 'SALES', budget: 60000 },
    ];

    console.log('Seeding Cost Centers and Budgets...');
    for (const cc of costCenters) {
        const account = await prisma.analyticAccount.create({
            data: {
                name: cc.name,
                code: cc.code,
                active: true
            },
        });

        // Create a budget for each CC
        await prisma.budget.create({
            data: {
                name: `Budget FY 2026 - ${cc.name}`,
                analyticAccountId: account.id,
                dateFrom: new Date('2026-01-01'),
                dateTo: new Date('2026-12-31'),
                state: 'ACTIVE',
                lines: {
                    create: {
                        plannedAmount: cc.budget
                    }
                }
            }
        });

        // Create a sample vendor
        const vendor = await prisma.contact.create({
            data: {
                name: `Vendor for ${cc.name}`,
                email: `vendor.${cc.code.toLowerCase()}@example.com`,
                contactType: 'VENDOR',
                active: true
            }
        });

        // Create a sample PO and Bill to show "spent"
        const po = await prisma.purchase_orders.create({
            data: {
                order_number: `PO-2026-${cc.code}-001`,
                vendor_id: vendor.id,
                analytic_account_id: account.id,
                status: 'purchase',
                date: new Date()
            }
        });

        await prisma.vendor_bills.create({
            data: {
                bill_number: `BILL-2026-${cc.code}-001`,
                vendor_id: vendor.id,
                purchase_order_id: po.id,
                amount: cc.budget * 0.1, // Spend 10% of budget
                status: 'paid',
                date: new Date()
            }
        });
    }

    console.log('Seeding Products...');
    const furnitureCat = await prisma.productCategory.create({
        data: { name: 'Furniture' }
    });

    const standardProduct = await prisma.product.create({
        data: {
            id: 'f8d38e78-fcd1-432d-83b6-200388d77685',
            name: 'Standard Service/Product',
            categoryId: furnitureCat.id,
            price: 0,
            active: true
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
