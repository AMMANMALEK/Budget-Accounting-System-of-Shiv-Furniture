import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Plus, Trash2, Download } from 'lucide-react';
import './CostCenters.css';

export const CustomerInvoices = () => {
    const { contacts, costCenters, transactions, addTransaction } = useMockData();
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customerId: '',
        costCenterId: '',
        status: 'unpaid',
        invoiceDate: new Date().toISOString().split('T')[0],
        description: '', // General note
    });

    const [items, setItems] = useState([
        { id: Date.now(), description: '', quantity: 1, rate: 0, tax: 0 }
    ]);

    const invoices = transactions.filter(t => t.type === 'invoice');

    // Calculations
    const calculateLineTotal = (item) => {
        const base = item.quantity * item.rate;
        const taxAmount = (base * item.tax) / 100;
        return base + taxAmount;
    };

    const calculateGrandTotal = () => {
        return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    };

    // Item Handlers
    const addItem = () => {
        setItems([...items, { id: Date.now(), description: '', quantity: 1, rate: 0, tax: 0 }]);
    };

    const removeItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const totalAmount = calculateGrandTotal();
        const selectedCustomer = contacts.find(c => c.id === formData.customerId);

        addTransaction({
            type: 'invoice',
            customerId: formData.customerId,
            customer: selectedCustomer?.name,
            costCenterId: formData.costCenterId,
            amount: totalAmount,
            items: items,
            description: formData.description,
            status: formData.status,
            date: formData.invoiceDate,
        });

        // Reset Form
        setFormData({
            customerId: '',
            costCenterId: '',
            status: 'unpaid',
            invoiceDate: new Date().toISOString().split('T')[0],
            description: ''
        });
        setItems([{ id: Date.now(), description: '', quantity: 1, rate: 0, tax: 0 }]);
        setShowForm(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    };

    const handleDownload = (invoice) => {
        const doc = new jsPDF();
        const cc = costCenters.find(c => c.id === invoice.costCenterId);

        // Colors
        const primaryColor = [26, 115, 232];
        const textColor = [33, 37, 41];
        const secondaryTextColor = [108, 117, 125];

        // Header
        doc.setFontSize(22);
        doc.setTextColor(...primaryColor);
        doc.text('INVOICE', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(...secondaryTextColor);
        doc.text(`ID: ${invoice.id.toUpperCase()}`, 105, 28, { align: 'center' });

        // Left Info (Customer)
        doc.setTextColor(...textColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', 20, 45);
        doc.setFont('helvetica', 'normal');
        doc.text(invoice.customer || 'Unknown Customer', 20, 52);
        doc.setFontSize(10);
        doc.text(`Cost Center: ${cc?.name || 'N/A'} (${cc?.code || 'N/A'})`, 20, 58);

        // Right Info (Invoice Details)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DETAILS:', 130, 45);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Date: ${formatDate(invoice.date)}`, 130, 52);
        doc.text(`Status: ${invoice.status?.toUpperCase() || 'DRAFT'}`, 130, 58);

        // Table Header
        let y = 75;
        doc.setFillColor(248, 249, 250);
        doc.rect(20, y, 170, 10, 'F');
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Description', 25, y + 7);
        doc.text('Qty', 110, y + 7);
        doc.text('Rate', 130, y + 7);
        doc.text('Tax', 155, y + 7);
        doc.text('Total', 175, y + 7, { align: 'right' });

        // Table Lines
        doc.setFont('helvetica', 'normal');
        y += 15;
        (invoice.items || []).forEach((item) => {
            const lineTotal = (item.quantity * item.rate) * (1 + (item.tax || 0) / 100);
            doc.text(item.description || 'Service/Product', 25, y);
            doc.text(item.quantity.toString(), 110, y);
            doc.text(`INR ${item.rate.toLocaleString()}`, 130, y);
            doc.text(`${item.tax}%`, 155, y);
            doc.text(`INR ${lineTotal.toLocaleString()}`, 175, y, { align: 'right' });
            y += 10;
        });

        // Totals
        y += 10;
        doc.setDrawColor(222, 226, 230);
        doc.line(20, y, 190, y);
        y += 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('GRAND TOTAL:', 130, y);
        doc.setTextColor(...primaryColor);
        doc.text(`INR ${invoice.amount.toLocaleString()}`, 190, y, { align: 'right' });

        // Footer
        doc.setTextColor(...secondaryTextColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for your business!', 105, 270, { align: 'center' });

        doc.save(`Invoice_${invoice.id.substring(0, 8)}.pdf`);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Invoices</h1>
                    <p>Create and manage detailed customer invoices</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} variant="primary">
                    <Plus size={20} />
                    {showForm ? 'Cancel' : 'Create Invoice'}
                </Button>
            </div>

            {showForm && (
                <Card className="form-card">
                    <h3>New Invoice</h3>
                    <form onSubmit={handleSubmit}>
                        {/* Header Fields */}
                        <div className="form-row">
                            <Select
                                label="Customer"
                                value={formData.customerId}
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                options={[
                                    { value: '', label: 'Select a customer' },
                                    ...contacts.map(c => ({ value: c.id, label: c.name + (c.contactType === 'CUSTOMER' ? '' : ` (${c.contactType})`) }))
                                ]}
                                required
                            />
                            <Select
                                label="Cost Center"
                                value={formData.costCenterId}
                                onChange={(e) => setFormData({ ...formData, costCenterId: e.target.value })}
                                options={[
                                    { value: '', label: 'Select a cost center' },
                                    ...costCenters.map(cc => ({ value: cc.id, label: `${cc.name} (${cc.code})` }))
                                ]}
                                required
                            />
                            <Select
                                label="Status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                options={[
                                    { value: 'unpaid', label: 'Unpaid' },
                                    { value: 'paid', label: 'Paid' },
                                ]}
                                required
                            />
                            <Input
                                label="Invoice Date"
                                type="date"
                                value={formData.invoiceDate}
                                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                                required
                            />
                        </div>
                        {/* Line Items */}
                        <div className="invoice-items-section">
                            <h4>Items</h4>
                            <div className="table-container">
                                <table className="table items-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40%' }}>Description</th>
                                            <th style={{ width: '10%' }}>Qty</th>
                                            <th style={{ width: '15%' }}>Rate</th>
                                            <th style={{ width: '10%' }}>Tax %</th>
                                            <th style={{ width: '15%' }}>Total</th>
                                            <th style={{ width: '10%' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        placeholder="Item name"
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={item.rate}
                                                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={item.tax}
                                                        onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="text-right font-medium">
                                                    ₹{calculateLineTotal(item).toLocaleString()}
                                                </td>
                                                <td className="text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-danger"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Button type="button" variant="secondary" onClick={addItem} className="mt-2">
                                <Plus size={16} /> Add Item
                            </Button>
                        </div>

                        {/* Summary & Footer */}
                        <div className="invoice-footer mt-4">
                            <div className="invoice-total">
                                <span>Grand Total:</span>
                                <strong>₹{calculateGrandTotal().toLocaleString()}</strong>
                            </div>
                            <Textarea
                                label="Notes"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Payment terms or additional notes..."
                            />
                            <div className="form-actions mt-4">
                                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="success">
                                    Create Invoice
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Cost Center</th>
                                <th>Amount</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => {
                                const cc = costCenters.find(c => c.id === invoice.costCenterId);
                                return (
                                    <tr key={invoice.id}>
                                        <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="font-medium">{invoice.customer}</td>
                                        <td>
                                            <Badge variant="primary">{cc?.code}</Badge>
                                        </td>
                                        <td className="font-medium">₹{invoice.amount.toLocaleString()}</td>
                                        <td className="text-secondary text-sm">
                                            {invoice.items ? (
                                                <span>{invoice.items.length} items</span>
                                            ) : (
                                                <span>Legacy</span>
                                            )}
                                        </td>
                                        <td>
                                            <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                                                {(invoice.status || 'UNPAID').toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(invoice)}
                                                title="Download Invoice"
                                            >
                                                <Download size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
