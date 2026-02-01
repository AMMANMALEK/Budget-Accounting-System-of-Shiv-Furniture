import { useState } from 'react';
import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Plus, Trash2, Download } from 'lucide-react';
import './CostCenters.css';

export const CustomerInvoices = () => {
    const { costCenters, transactions, addTransaction } = useMockData();
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customer: '',
        costCenterId: '',
        status: 'unpaid',
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

        addTransaction({
            type: 'invoice',
            vendor: null,
            customer: formData.customer,
            costCenterId: formData.costCenterId,
            amount: totalAmount, // Saved for aggregation
            items: items,        // Saved for detail
            description: formData.description,
            status: formData.status,
        });

        // Reset Form
        setFormData({ customer: '', costCenterId: '', status: 'unpaid', description: '' });
        setItems([{ id: Date.now(), description: '', quantity: 1, rate: 0, tax: 0 }]);
        setShowForm(false);
    };

    const handleDownload = (invoice) => {
        const cc = costCenters.find(c => c.id === invoice.costCenterId);

        // Generate Invoice Content
        const lines = [
            `INVOICE #${invoice.id.toUpperCase()}`,
            `----------------------------------------`,
            `Date: ${new Date(invoice.date).toLocaleDateString()}`,
            `Customer: ${invoice.customer}`,
            `Department: ${cc?.name || 'N/A'}`,
            `Status: ${invoice.status.toUpperCase()}`,
            `----------------------------------------`,
            `ITEMS:`,
            ...(invoice.items || []).map(item =>
                `- ${item.description} (x${item.quantity}) @ ${item.rate} + ${item.tax}% Tax = ₹${((item.quantity * item.rate) * (1 + item.tax / 100)).toFixed(2)}`
            ),
            // Handle legacy invoices without items
            ...(invoice.items ? [] : [`- Description: ${invoice.description}`]),
            `----------------------------------------`,
            `TOTAL AMOUNT: ₹${invoice.amount.toLocaleString()}`,
            `----------------------------------------`,
            `Thank you for your business!`
        ];

        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                            <Input
                                label="Customer Name"
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                placeholder="e.g., Acme Corp"
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
                                                    ₹${calculateLineTotal(item).toLocaleString()}
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
                                <strong>₹${calculateGrandTotal().toLocaleString()}</strong>
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
                                                {invoice.status.toUpperCase()}
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
