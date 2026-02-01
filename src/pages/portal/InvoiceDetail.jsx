import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import './InvoiceDetail.css';

export const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { transactions, costCenters, updateTransaction } = useMockData();

    const invoice = transactions.find(t => t.id === id);

    if (!invoice) {
        return (
            <div className="portal-page">
                <Card>
                    <p>Invoice not found</p>
                    <Button onClick={() => navigate('/portal/invoices')}>
                        Back to Invoices
                    </Button>
                </Card>
            </div>
        );
    }

    const costCenter = costCenters.find(cc => cc.id === invoice.costCenterId);

    const handlePayment = () => {
        if (invoice.status === 'unpaid') {
            updateTransaction(invoice.id, { status: 'paid' });
            alert('Payment processed successfully! (Mock)');
        }
    };

    return (
        <div className="portal-page">
            <div className="invoice-header">
                <Button variant="secondary" onClick={() => navigate('/portal/invoices')}>
                    <ArrowLeft size={18} />
                    Back to Invoices
                </Button>
            </div>

            <div className="invoice-detail-grid">
                <Card className="invoice-main">
                    <div className="invoice-title">
                        <h2>Invoice Details</h2>
                        <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                            {invoice.status}
                        </Badge>
                    </div>

                    <div className="invoice-info">
                        <div className="info-row">
                            <span className="info-label">Invoice ID:</span>
                            <span className="info-value">{invoice.id.toUpperCase()}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Date:</span>
                            <span className="info-value">{new Date(invoice.date).toLocaleDateString()}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Customer:</span>
                            <span className="info-value">{invoice.customer}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Cost Center:</span>
                            <span className="info-value">
                                {costCenter?.name} ({costCenter?.code})
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Description:</span>
                            <span className="info-value">{invoice.description}</span>
                        </div>
                    </div>

                    <div className="invoice-amount-section">
                        <div className="amount-label">Total Amount</div>
                        <div className="amount-value">₹{invoice.amount.toLocaleString()}</div>
                    </div>
                </Card>

                <Card className="invoice-actions">
                    <h3>Payment</h3>
                    {invoice.status === 'paid' ? (
                        <div className="payment-success">
                            <CheckCircle size={48} />
                            <p>This invoice has been paid</p>
                            <div className="payment-date">
                                Paid on {new Date(invoice.date).toLocaleDateString()}
                            </div>
                        </div>
                    ) : (
                        <div className="payment-section">
                            <p>Outstanding amount to be paid:</p>
                            <div className="outstanding-amount">₹{invoice.amount.toLocaleString()}</div>
                            <Button variant="success" onClick={handlePayment} className="pay-button">
                                <CreditCard size={20} />
                                Pay Now (Mock)
                            </Button>
                            <p className="payment-note">
                                This is a demo. Clicking "Pay Now" will mark the invoice as paid.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
