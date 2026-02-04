const prisma = require('../lib/prisma');

exports.getAll = async (req, res) => {
    try {
        const budgets = await prisma.budget.findMany({
            include: {
                lines: true,
                analyticAccount: true
            }
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch budgets', error: error.message });
    }
};

exports.setBudget = async (req, res) => {
    try {
        const { analyticAccountId, amount, fiscalYear, name } = req.body;

        const dateFrom = new Date(`${fiscalYear}-01-01`);
        const dateTo = new Date(`${fiscalYear}-12-31`);

        // Find existing budget for this CC and year
        const existingBudget = await prisma.budget.findFirst({
            where: {
                analyticAccountId,
                dateFrom: { gte: dateFrom },
                dateTo: { lte: dateTo }
            },
            include: { lines: true }
        });

        if (existingBudget) {
            // Update the existing budget line
            if (existingBudget.lines.length > 0) {
                await prisma.budgetLine.update({
                    where: { id: existingBudget.lines[0].id },
                    data: { plannedAmount: amount }
                });
            } else {
                await prisma.budgetLine.create({
                    data: {
                        budgetId: existingBudget.id,
                        plannedAmount: amount
                    }
                });
            }
            const updatedBudget = await prisma.budget.findUnique({
                where: { id: existingBudget.id },
                include: { lines: true }
            });
            return res.json(updatedBudget);
        }

        const budget = await prisma.budget.create({
            data: {
                name: name || `Budget FY ${fiscalYear}`,
                analyticAccountId,
                dateFrom,
                dateTo,
                state: 'ACTIVE',
                lines: {
                    create: {
                        plannedAmount: amount
                    }
                }
            },
            include: {
                lines: true
            }
        });
        res.status(201).json(budget);
    } catch (error) {
        console.error('Error setting budget:', error);
        res.status(400).json({ message: 'Failed to set budget', error: error.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const accounts = await prisma.analyticAccount.findMany({
            include: {
                budgets: {
                    include: { lines: true }
                },
                invoiceLines: {
                    include: { invoice: true }
                },
                purchase_orders: {
                    include: { vendor_bills: true }
                }
            }
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get summary', error: error.message });
    }
};
