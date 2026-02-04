const prisma = require('../lib/prisma');

exports.getAll = async (req, res) => {
    try {
        const invoices = await prisma.customerInvoice.findMany({
            include: {
                customer: true,
                lines: {
                    include: { product: true }
                }
            }
        });
        const bills = await prisma.vendor_bills.findMany({
            include: {
                contacts: true,
                purchase_orders: true
            }
        });

        // Combine for a unified frontend view if needed, or keep separate
        res.json({ invoices, bills });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
};

exports.createBill = async (req, res) => {
    try {
        const { vendorId, amount, billNumber, date, dueDate, status } = req.body;

        if (!vendorId || !amount) {
            return res.status(400).json({ message: 'Vendor and amount are required' });
        }

        const bill = await prisma.vendor_bills.create({
            data: {
                vendor_id: vendorId,
                amount: parseFloat(amount),
                bill_number: billNumber || `BILL-${Date.now()}`,
                date: date ? new Date(date) : undefined,
                due_date: dueDate ? new Date(dueDate) : undefined,
                status: status || 'draft'
            }
        });
        res.status(201).json(bill);
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(400).json({ message: error.message || 'Failed to create bill' });
    }
};

exports.createInvoice = async (req, res) => {
    try {
        const { customerId, invoiceDate, state, lines } = req.body;
        const invoice = await prisma.customerInvoice.create({
            data: {
                customerId: customerId,
                invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
                state: state || 'DRAFT',
                lines: {
                    create: lines // Assuming lines is array of {productId, quantity, price, analyticAccountId}
                }
            },
            include: { lines: true }
        });
        res.status(201).json(invoice);
    } catch (error) {
        console.error('Prisma Error creating invoice:', error);
        res.status(400).json({ message: error.message || 'Failed to create invoice' });
    }
};

exports.updateBillStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const bill = await prisma.vendor_bills.update({
            where: { id },
            data: { status }
        });
        res.json(bill);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update bill', error: error.message });
    }
};
