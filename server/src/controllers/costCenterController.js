const prisma = require('../lib/prisma');

exports.getAll = async (req, res) => {
    try {
        const accounts = await prisma.analyticAccount.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        res.json(accounts);
    } catch (error) {
        console.error('Error fetching cost centers:', error);
        res.status(500).json({ message: 'Failed to fetch cost centers', error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, code } = req.body;

        // Find existing cost center by code
        const existingCC = await prisma.analyticAccount.findFirst({
            where: { code }
        });

        if (existingCC) {
            // Update existing instead of failing
            const updatedCC = await prisma.analyticAccount.update({
                where: { id: existingCC.id },
                data: { name, active: true }
            });
            return res.json(updatedCC);
        }

        const account = await prisma.analyticAccount.create({
            data: { name, code, active: true }
        });
        res.status(201).json(account);
    } catch (error) {
        console.error('Error creating cost center:', error);
        res.status(400).json({ message: error.message || 'Failed to create cost center' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, active } = req.body;
        const account = await prisma.analyticAccount.update({
            where: { id },
            data: { name, code, active }
        });
        res.json(account);
    } catch (error) {
        console.error('Error updating cost center:', error);
        res.status(400).json({ message: 'Failed to update cost center', error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        await prisma.analyticAccount.update({
            where: { id },
            data: { active: false }
        });
        res.json({ message: 'Cost center deactivated' });
    } catch (error) {
        console.error('Error deleting cost center:', error);
        res.status(400).json({ message: 'Failed to delete cost center', error: error.message });
    }
};
