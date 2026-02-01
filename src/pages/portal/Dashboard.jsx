import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FileText, IndianRupee, AlertCircle, Clock } from 'lucide-react';
import './PortalDashboard.css';

export const PortalDashboard = () => {
    const { transactions, updateTransaction } = useMockData();

    // For portal user, show invoices (they are customers)
    const myInvoices = transactions.filter(t => t.type === 'invoice');
    const unpaidInvoices = myInvoices.filter(i => i.status === 'unpaid');
    const paidInvoices = myInvoices.filter(i => i.status === 'paid');

    const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const handlePay = (id) => {
        // Simulate payment processing
        if (confirm('Simulate payment for this invoice?')) {
            updateTransaction(id, { status: 'paid' });
        }
    };

    const stats = [
        {
            label: 'Total Invoices',
            value: myInvoices.length,
            icon: IndianRupee,
            color: 'primary',
        },
        {
            label: 'Outstanding Amount',
            value: `₹${totalOutstanding.toLocaleString()}`,
            icon: AlertCircle,
            color: 'warning',
        },
        {
            label: 'Paid Amount',
            value: `₹${totalPaid.toLocaleString()}`,
            icon: CheckCircle,
            color: 'success',
        },
    ];

    return (
        <div className="portal-page">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Overview of your invoices and payments</p>
            </div>

            <div className="portal-stats">
                {stats.map((stat, index) => (
                    <Card key={index} className="stat-card">
                        <div className="stat-content">
                            <div className={`stat-icon stat-icon-${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="stat-details">
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value">{stat.value}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card title="Outstanding Invoices">
                {unpaidInvoices.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} />
                        <p>No outstanding invoices</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Invoice Date</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unpaidInvoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="font-medium">{invoice.description}</td>
                                        <td className="font-medium">₹{invoice.amount.toLocaleString()}</td>
                                        <td>
                                            <Badge variant="warning">Unpaid</Badge>
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => handlePay(invoice.id)}
                                            >
                                                Pay Now
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};
