const prisma = require('../lib/prisma');

exports.getAll = async (req, res) => {
    try {
        const contacts = await prisma.contact.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        res.json(contacts);
    } catch (error) {
        console.error('Prisma Error fetching contacts:', error);
        res.status(500).json({ message: 'Failed to fetch contacts', error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, email, contactType, phone, address } = req.body;
        const contact = await prisma.contact.create({
            data: {
                name,
                email,
                contactType: contactType?.toUpperCase() || 'VENDOR',
                phone,
                // The schema has specific address fields, I'll map them if available
                city: address?.city,
                state: address?.state,
                country: address?.country,
                pincode: address?.pincode,
                active: true
            }
        });
        res.status(201).json(contact);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create contact', error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const contact = await prisma.contact.update({
            where: { id },
            data: updates
        });
        res.json(contact);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update contact', error: error.message });
    }
};
