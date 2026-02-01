import { useState } from 'react';
import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Plus, AlertCircle } from 'lucide-react';
import './CostCenters.css';
import './Modal.css';

export const VendorBills = () => {
    const { costCenters, budgets, transactions, addTransaction, updateTransaction, getBudgetSummary } = useMockData();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        vendor: '',
        costCenterId: '',
        amount: '',
        description: '',
        status: 'draft',
        isBillable: false,
        billableCustomer: '',
        markup: 0,
    });

    // Payment Modal State
    const [paymentModal, setPaymentModal] = useState({
        show: false,
        billId: null,
        vendorName: '',
        amount: 0
    });
    const [paymentDetails, setPaymentDetails] = useState({
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer'
    });

    const bills = transactions.filter(t => t.type === 'bill');

    const handleSubmit = (e) => {
        e.preventDefault();
        const billAmount = parseFloat(formData.amount);
        addTransaction({
            type: 'bill',
            vendor: formData.vendor,
            customer: null,
            costCenterId: formData.costCenterId,
            amount: billAmount,
            description: formData.description,
            status: formData.status,
        });

        if (formData.isBillable && formData.billableCustomer) {
            const markupAmount = billAmount * (formData.markup / 100);
            const invoiceAmount = billAmount + markupAmount;

            addTransaction({
                type: 'invoice',
                vendor: null,
                customer: formData.billableCustomer,
                costCenterId: formData.costCenterId,
                amount: invoiceAmount,
                status: 'unpaid',
                description: `Reimbursement: ${formData.description}`,
                items: [
                    {
                        id: Date.now(),
                        description: `Reimbursement: ${formData.description || 'Vendor Bill Expense'}`,
                        quantity: 1,
                        rate: invoiceAmount,
                        tax: 0
                    }
                ]
            });
        }

        setFormData({
            vendor: '',
            costCenterId: '',
            amount: '',
            description: '',
            status: 'draft',
            isBillable: false,
            billableCustomer: '',
            markup: 0
        });
        setShowForm(false);
    };

    const handleApprove = (id) => {
        updateTransaction(id, { status: 'approved' });
    };

    const handleReject = (id) => {
        if (confirm('Are you sure you want to reject this bill?')) {
            updateTransaction(id, { status: 'rejected' });
        }
    };

    const handlePay = (bill) => {
        setPaymentModal({
            show: true,
            billId: bill.id,
            vendorName: bill.vendor,
            amount: bill.amount
        });
        setPaymentDetails({
            date: new Date().toISOString().split('T')[0],
            method: 'Bank Transfer'
        });
    };

    const confirmPayment = (e) => {
        e.preventDefault();
        if (paymentModal.billId) {
            updateTransaction(paymentModal.billId, {
                status: 'paid',
                paymentDate: paymentDetails.date,
                paymentMethod: paymentDetails.method
            });
            setPaymentModal({ show: false, billId: null, vendorName: '', amount: 0 });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'approved': return 'primary';
            case 'draft': return 'secondary';
            case 'rejected': return 'danger';
            default: return 'warning';
        }
    };

    const getBudgetImpact = () => {
        if (!formData.costCenterId || !formData.amount) return null;

        const summary = getBudgetSummary();
        const ccSummary = summary.find(s => s.costCenter.id === formData.costCenterId);

        if (!ccSummary) return null;

        // If draft, it doesn't impact yet, but we show potential impact
        const newSpent = ccSummary.spent + parseFloat(formData.amount);
        const newRemaining = ccSummary.budget - newSpent;

        return {
            budget: ccSummary.budget,
            currentSpent: ccSummary.spent,
            newSpent,
            newRemaining,
            isOverBudget: newRemaining < 0,
        };
    };

    const impact = getBudgetImpact();

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Vendor Bills</h1>
                    <p>Record and track vendor bills and expenses</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} variant="primary">
                    <Plus size={20} />
                    {showForm ? 'Cancel' : 'Add Bill'}
                </Button>
            </div>

            {showForm && (
                <Card className="form-card">
                    <h3>New Vendor Bill</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <Input
                                label="Vendor Name"
                                value={formData.vendor}
                                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                placeholder="e.g., Google Ads"
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
                        </div>
                        <div className="form-row">
                            <Input
                                label="Amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="5000"
                                required
                            />
                            <Select
                                label="Initial Status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                options={[
                                    { value: 'draft', label: 'Draft' },
                                    { value: 'approved', label: 'Approved' },
                                    { value: 'paid', label: 'Paid' },
                                ]}
                            />
                        </div>
                        <Textarea
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the expense"
                        />

                        <div className="form-row">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isBillable}
                                    onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-medium">Billable to Customer?</span>
                            </label>
                        </div>

                        {formData.isBillable && (
                            <div className="form-row bg-muted p-3 rounded-md mb-4 border border-border">
                                <Input
                                    label="Customer Name"
                                    value={formData.billableCustomer}
                                    onChange={(e) => setFormData({ ...formData, billableCustomer: e.target.value })}
                                    placeholder="e.g., Client Corp"
                                    required={formData.isBillable}
                                />
                                <Input
                                    label="Markup %"
                                    type="number"
                                    min="0"
                                    value={formData.markup}
                                    onChange={(e) => setFormData({ ...formData, markup: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>
                        )}

                        {impact && (
                            <div className={`budget-impact ${impact.isOverBudget ? 'over-budget' : ''}`}>
                                <div className="impact-header">
                                    <AlertCircle size={20} />
                                    <strong>Budget Impact Preview (If Approved)</strong>
                                </div>
                                <div className="impact-details">
                                    <div className="impact-row">
                                        <span>Budget:</span>
                                        <span>₹{impact.budget.toLocaleString()}</span>
                                    </div>
                                    <div className="impact-row">
                                        <span>Current Spent:</span>
                                        <span>₹{impact.currentSpent.toLocaleString()}</span>
                                    </div>
                                    <div className="impact-row">
                                        <span>New Spent:</span>
                                        <span className="highlight">₹{impact.newSpent.toLocaleString()}</span>
                                    </div>
                                    <div className="impact-row">
                                        <span>Remaining:</span>
                                        <span className={impact.isOverBudget ? 'negative' : 'positive'}>
                                            ₹{impact.newRemaining.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {impact.isOverBudget && (
                                    <div className="impact-warning">
                                        ⚠️ This transaction will exceed the budget!
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-actions">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={impact?.isOverBudget}
                                title={impact?.isOverBudget ? 'Cannot save: Transaction exceeds budget' : ''}
                            >
                                Save Bill {formData.isBillable && '& Generate Invoice'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Payment Modal */}
            {paymentModal.show && (
                <div className="modal-overlay">
                    <Card className="modal-card">
                        <h3>Record Payment</h3>
                        <p className="text-secondary mb-4">
                            Recording payment of <strong>₹{paymentModal.amount.toLocaleString()}</strong> to <strong>{paymentModal.vendorName}</strong>
                        </p>
                        <form onSubmit={confirmPayment}>
                            <div className="form-row">
                                <Input
                                    label="Payment Date"
                                    type="date"
                                    value={paymentDetails.date}
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, date: e.target.value })}
                                    required
                                />
                                <Select
                                    label="Payment Method"
                                    value={paymentDetails.method}
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, method: e.target.value })}
                                    options={[
                                        { value: 'Bank Transfer', label: 'Bank Transfer' },
                                        { value: 'Credit Card', label: 'Credit Card' },
                                        { value: 'Check', label: 'Check' },
                                        { value: 'Cash', label: 'Cash' },
                                    ]}
                                />
                            </div>
                            <div className="form-actions mt-6">
                                <Button type="button" variant="secondary" onClick={() => setPaymentModal({ ...paymentModal, show: false })}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="success">
                                    Confirm Payment
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <Card>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Vendor</th>
                                <th>Cost Center</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill) => {
                                const cc = costCenters.find(c => c.id === bill.costCenterId);
                                return (
                                    <tr key={bill.id}>
                                        <td>{new Date(bill.date).toLocaleDateString()}</td>
                                        <td className="font-medium">
                                            <div>{bill.vendor}</div>
                                            <div className="text-sm text-secondary">{bill.description}</div>
                                        </td>
                                        <td>
                                            <Badge variant="secondary">{cc?.code}</Badge>
                                        </td>
                                        <td className="font-medium">₹{bill.amount.toLocaleString()}</td>
                                        <td>
                                            <Badge variant={getStatusColor(bill.status)}>
                                                {bill.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {bill.status === 'draft' && (
                                                    <>
                                                        <button
                                                            className="icon-btn success text-btn"
                                                            onClick={() => handleApprove(bill.id)}
                                                            title="Approve"
                                                        >
                                                            APV
                                                        </button>
                                                        <button
                                                            className="icon-btn danger text-btn"
                                                            onClick={() => handleReject(bill.id)}
                                                            title="Reject"
                                                        >
                                                            REJ
                                                        </button>
                                                    </>
                                                )}
                                                {bill.status === 'approved' && (
                                                    <Button size="sm" variant="success" onClick={() => handlePay(bill)}>
                                                        Pay
                                                    </Button>
                                                )}
                                            </div>
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
