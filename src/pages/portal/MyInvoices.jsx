import { Link } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Eye } from 'lucide-react';
import './PortalDashboard.css';

export const MyInvoices = () => {
    const { transactions } = useMockData();

    const myInvoices = transactions.filter(t => t.type === 'invoice');

    return (
        <div className="portal-page">
            <div className="page-header">
                <h1>My Invoices</h1>
                <p>View all your invoices and payment status</p>
            </div>

            <Card>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="font-medium">{invoice.id.toUpperCase()}</td>
                                    <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                    <td>{invoice.description}</td>
                                    <td className="font-medium">₹{invoice.amount.toLocaleString()}</td>
                                    <td>
                                        <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                                            {invoice.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Link to={`/portal/invoices/${invoice.id}`}>
                                            <Button variant="secondary" size="sm">
                                                <Eye size={16} />
                                                View
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
