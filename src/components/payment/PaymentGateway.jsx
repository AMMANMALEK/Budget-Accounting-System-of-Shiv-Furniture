import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import {
    CreditCard,
    Smartphone,
    Building,
    CheckCircle2,
    Loader2,
    X,
    ChevronRight,
    Lock
} from 'lucide-react';
import './PaymentGateway.css';

export const PaymentGateway = ({ amount, vendorName, onConfirm, onCancel }) => {
    const [step, setStep] = useState('method'); // method, details, processing, success
    const [method, setMethod] = useState('card'); // card, upi, netbanking
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const handleMethodSelect = (m) => {
        setMethod(m);
        setStep('details');
    };

    const handleProcessPayment = (e) => {
        e.preventDefault();
        setStep('processing');

        // Simulate real transaction delay
        setTimeout(() => {
            setStep('success');
        }, 3000);
    };

    const handleComplete = () => {
        onConfirm({
            method: method.toUpperCase(),
            date: new Date().toISOString(),
            transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase()
        });
    };

    const renderMethodSelector = () => (
        <div className="pg-methods">
            <button className={`pg-method-card ${method === 'card' ? 'active' : ''}`} onClick={() => handleMethodSelect('card')}>
                <div className="pg-method-icon"><CreditCard size={24} /></div>
                <div className="pg-method-info">
                    <span className="pg-method-title">Card</span>
                    <span className="pg-method-desc">Credit / Debit Cards</span>
                </div>
                <ChevronRight size={18} className="pg-chevron" />
            </button>
            <button className={`pg-method-card ${method === 'upi' ? 'active' : ''}`} onClick={() => handleMethodSelect('upi')}>
                <div className="pg-method-icon"><Smartphone size={24} /></div>
                <div className="pg-method-info">
                    <span className="pg-method-title">UPI</span>
                    <span className="pg-method-desc">PhonePe, Google Pay, etc.</span>
                </div>
                <ChevronRight size={18} className="pg-chevron" />
            </button>
            <button className={`pg-method-card ${method === 'netbanking' ? 'active' : ''}`} onClick={() => handleMethodSelect('netbanking')}>
                <div className="pg-method-icon"><Building size={24} /></div>
                <div className="pg-method-info">
                    <span className="pg-method-title">Net Banking</span>
                    <span className="pg-method-desc">All Major Indian Banks</span>
                </div>
                <ChevronRight size={18} className="pg-chevron" />
            </button>
        </div>
    );

    const renderCardForm = () => (
        <form onSubmit={handleProcessPayment} className="pg-form animate-fade-in">
            <div className="pg-card-preview">
                <div className="pg-chip"></div>
                <div className="pg-card-number">{cardDetails.number || '•••• •••• •••• ••••'}</div>
                <div className="pg-card-bottom">
                    <div className="pg-card-holder">{cardDetails.name || 'FULL NAME'}</div>
                    <div className="pg-card-expiry">{cardDetails.expiry || 'MM/YY'}</div>
                </div>
                <div className="pg-card-type">VISA</div>
            </div>

            <Input
                label="Cardholder Name"
                placeholder="AMMAN MALEK"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                required
            />
            <Input
                label="Card Number"
                placeholder="4111 2222 3333 4444"
                maxLength="19"
                value={cardDetails.number}
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                    setCardDetails({ ...cardDetails, number: val });
                }}
                required
            />
            <div className="form-row">
                <Input
                    label="Expiry"
                    placeholder="MM/YY"
                    maxLength="5"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        setCardDetails({ ...cardDetails, expiry: val });
                    }}
                    required
                />
                <Input
                    label="CVV"
                    placeholder="•••"
                    type="password"
                    maxLength="3"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                    required
                />
            </div>

            <div className="pg-secure-info">
                <Lock size={14} />
                <span>Your payment is secured with 256-bit encryption</span>
            </div>

            <Button type="submit" variant="primary" className="pg-pay-btn" fullWidth>
                Pay INR {amount.toLocaleString()}
            </Button>
            <button type="button" className="pg-back-link" onClick={() => setStep('method')}>
                Change payment method
            </button>
        </form>
    );

    const renderUPIStatus = () => (
        <div className="pg-upi-container animate-fade-in">
            <div className="pg-qr-mock">
                <div className="pg-qr-box">
                    {/* Simulated QR Code */}
                    <div className="pg-qr-inner"></div>
                </div>
                <p>Scan to pay via any UPI App</p>
            </div>
            <div className="pg-divider"><span>OR</span></div>
            <Input
                label="Enter UPI ID"
                placeholder="mobilenumber@upi"
                required
            />
            <Button variant="primary" onClick={handleProcessPayment} fullWidth>
                Verify & Pay INR {amount.toLocaleString()}
            </Button>
            <button className="pg-back-link" onClick={() => setStep('method')}>
                Back to methods
            </button>
        </div>
    );

    const renderProcessing = () => (
        <div className="pg-status-view animate-fade-in">
            <div className="pg-spinner-container">
                <Loader2 size={64} className="pg-spinner" />
            </div>
            <h2>Processing Payment</h2>
            <p>Please do not refresh the page or click back...</p>
        </div>
    );

    const renderSuccess = () => (
        <div className="pg-status-view animate-bounce-in">
            <div className="pg-success-icon">
                <CheckCircle2 size={80} color="#10b981" />
            </div>
            <h2 className="text-success">Payment Successful!</h2>
            <p>Your payment to <strong>{vendorName}</strong> has been processed.</p>
            <div className="pg-receipt-mini">
                <div className="receipt-row">
                    <span>Amount</span>
                    <strong>INR {amount.toLocaleString()}</strong>
                </div>
                <div className="receipt-row">
                    <span>Ref ID</span>
                    <span>TXN_{Math.random().toString(36).substr(2, 7).toUpperCase()}</span>
                </div>
            </div>
            <Button variant="success" onClick={handleComplete} fullWidth>
                Return to Dashboard
            </Button>
        </div>
    );

    return (
        <div className="pg-overlay animate-fade-in">
            <div className="pg-container">
                <Card className="pg-card">
                    <div className="pg-header">
                        <div className="pg-header-left">
                            <span className="pg-amount">INR {amount.toLocaleString()}</span>
                            <span className="pg-vendor">Paying {vendorName}</span>
                        </div>
                        <button className="pg-close" onClick={onCancel} disabled={step === 'processing'}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="pg-content">
                        {step === 'method' && renderMethodSelector()}
                        {step === 'details' && (method === 'card' ? renderCardForm() : renderUPIStatus())}
                        {step === 'processing' && renderProcessing()}
                        {step === 'success' && renderSuccess()}
                    </div>

                    <div className="pg-footer">
                        <div className="pg-trust-logos">
                            <span className="pg-pci">PCI-DSS Compliant</span>
                            <div className="pg-v-m">
                                <span className="visa">VISA</span>
                                <span className="mc">mastercard</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
