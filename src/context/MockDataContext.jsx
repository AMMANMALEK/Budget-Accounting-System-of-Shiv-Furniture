import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../utils/api';

const MockDataContext = createContext(null);

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) {
        throw new Error('useMockData must be used within MockDataProvider');
    }
    return context;
};

const DEFAULT_TAGS = [
    { id: '1', label: 'VIP', color: '#7c3aed' },
    { id: '2', label: 'Vendor', color: '#2563eb' },
    { id: '3', label: 'Urgent', color: '#dc2626' },
    { id: '4', label: 'New', color: '#059669' },
];

export const MockDataProvider = ({ children }) => {
    const [costCenters, setCostCenters] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshData = useCallback(async () => {
        try {
            const [ccs, budgs, trans, conts] = await Promise.all([
                fetchApi('/cost-centers'),
                fetchApi('/budgets'),
                fetchApi('/transactions'),
                fetchApi('/contacts')
            ]);

            // Normalize contacts (ensure address object exists even if DB is flat)
            const normalizedContacts = (conts || []).map(c => ({
                ...c,
                name: c.name || c.email || 'Unnamed Contact',
                contactType: c.contactType?.toUpperCase() || 'VENDOR',
                address: {
                    street: c.address || '', // The 'address' string field in DB is used as street
                    city: c.city || '',
                    state: c.state || '',
                    country: c.country || '',
                    pincode: c.pincode || ''
                }
            }));

            setCostCenters(ccs);

            // Normalize budgets
            const normalizedBudgets = (budgs || []).map(b => ({
                ...b,
                costCenterId: b.analyticAccountId,
                amount: Number(b.lines?.[0]?.plannedAmount || 0),
                fiscalYear: b.dateFrom ? new Date(b.dateFrom).getFullYear().toString() : '2026'
            }));
            setBudgets(normalizedBudgets);

            const combinedTrans = [
                ...(trans.invoices || []).map(i => {
                    const customer = normalizedContacts.find(c => c.id === i.customerId);
                    const items = (i.lines || []).map(l => ({
                        ...l,
                        rate: Number(l.price || 0),
                        tax: Number(l.tax || 0),
                        description: l.description || l.product?.name || 'Service Item'
                    }));
                    const totalAmount = i.amount || items.reduce((sum, item) => sum + (Number(item.rate) * Number(item.quantity)), 0);
                    return {
                        ...i,
                        type: 'invoice',
                        date: i.invoiceDate || i.date,
                        items: items,
                        amount: Number(totalAmount || 0),
                        status: i.state?.toLowerCase() || 'unpaid',
                        customer: customer?.name || 'Unknown Customer',
                        costCenterId: i.lines?.[0]?.analyticAccountId
                    };
                }),
                ...(trans.bills || []).map(b => {
                    const vendor = normalizedContacts.find(c => c.id === b.vendor_id);
                    return {
                        ...b,
                        type: 'bill',
                        amount: Number(b.amount || 0),
                        vendor: vendor?.name || 'Unknown Vendor',
                        analyticAccountId: b.purchase_orders?.analytic_account_id
                    };
                })
            ];

            setTransactions(combinedTrans);
            setContacts(normalizedContacts);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Cost Center operations
    const addCostCenter = async (costCenter) => {
        const data = await fetchApi('/cost-centers', {
            method: 'POST',
            body: JSON.stringify(costCenter)
        });
        await refreshData();
        return data;
    };

    const updateCostCenter = async (id, updates) => {
        await fetchApi(`/cost-centers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        await refreshData();
    };

    const deleteCostCenter = async (id) => {
        await fetchApi(`/cost-centers/${id}`, {
            method: 'DELETE'
        });
        await refreshData();
    };

    // Budget operations
    const setBudget = async (costCenterId, amount, fiscalYear = '2026') => {
        await fetchApi('/budgets', {
            method: 'POST',
            body: JSON.stringify({ analyticAccountId: costCenterId, amount, fiscalYear })
        });
        await refreshData();
    };

    // Transaction operations
    const addTransaction = async (transaction) => {
        // Validation: Ensure we have required IDs
        if (transaction.type === 'invoice' && (!transaction.customerId || !transaction.costCenterId)) {
            throw new Error('Please select both a customer and a cost center.');
        }
        if (transaction.type === 'bill' && !transaction.vendorId) {
            throw new Error('Please select a vendor.');
        }

        const endpoint = transaction.type === 'bill' ? '/transactions/bill' : '/transactions/invoice';
        const body = transaction.type === 'bill'
            ? {
                vendorId: transaction.vendorId,
                amount: Number(transaction.amount || 0),
                billNumber: transaction.billNumber || `BILL-${Date.now()}`,
                date: transaction.date || new Date().toISOString(),
                status: transaction.status,
                description: transaction.description
            }
            : {
                customerId: transaction.customerId,
                invoiceDate: transaction.date || new Date().toISOString(),
                state: transaction.status === 'paid' ? 'PAID' : 'DRAFT',
                description: transaction.description,
                lines: (transaction.items || []).map(item => ({
                    productId: 'f8d38e78-fcd1-432d-83b6-200388d77685', // Default standard product
                    description: item.description,
                    quantity: Number(item.quantity || 1),
                    price: Number(item.rate || 0),
                    tax: Number(item.tax || 0),
                    analyticAccountId: transaction.costCenterId
                }))
            };

        const data = await fetchApi(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        await refreshData();
        return data;
    };

    const updateTransaction = async (id, updates) => {
        // Specifically for bill status updates
        if (updates.status) {
            await fetchApi(`/transactions/bill/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: updates.status })
            });
            await refreshData();
        }
    };

    // Contact operations
    const addContact = async (contact) => {
        const data = await fetchApi('/contacts', {
            method: 'POST',
            body: JSON.stringify(contact)
        });
        await refreshData();
        return data;
    };

    const updateContact = async (id, updates) => {
        await fetchApi(`/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        await refreshData();
    };

    const deleteContact = async (id) => {
        // Soft delete (active: false)
        await updateContact(id, { active: false });
    };

    const restoreContact = async (id) => {
        await updateContact(id, { active: true });
    };

    const addTag = (label) => {
        const newTag = {
            id: Date.now().toString(),
            label,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
        };
        // In a real app we'd save this to backend. For now we just return it
        // since tags are currently just DEFAULT_TAGS constant.
        return newTag;
    };

    // Computed values (simulated locally for now)
    const getBudgetSummary = () => {
        return costCenters.map(cc => {
            const budgetData = budgets.find(b => b.analyticAccountId === cc.id);

            // Filter transactions that belong to this cost center
            const ccTrans = transactions.filter(t => t.analyticAccountId === cc.id);

            const spent = ccTrans
                .filter(t => t.type === 'bill' && t.status !== 'draft' && t.status !== 'rejected')
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            const revenue = ccTrans
                .filter(t => t.type === 'invoice')
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            const budgetAmount = Number(budgetData?.lines?.[0]?.plannedAmount || 0);

            // Core math logic
            const remaining = budgetAmount - spent;

            return {
                costCenter: cc,
                budget: budgetAmount,
                spent,
                revenue,
                remaining,
                variance: remaining,
                percentUsed: budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0,
            };
        });
    };

    const getTotalSummary = () => {
        const summary = getBudgetSummary();
        return {
            totalBudget: summary.reduce((sum, s) => sum + s.budget, 0),
            totalSpent: summary.reduce((sum, s) => sum + s.spent, 0),
            totalRevenue: summary.reduce((sum, s) => sum + s.revenue, 0),
            totalRemaining: summary.reduce((sum, s) => sum + s.remaining, 0),
        };
    };

    const value = {
        costCenters,
        budgets,
        transactions,
        contacts,
        tags: DEFAULT_TAGS,
        loading,
        addContact,
        updateContact,
        deleteContact,
        restoreContact,
        addTag,
        addCostCenter,
        updateCostCenter,
        deleteCostCenter,
        setBudget,
        addTransaction,
        updateTransaction,
        getBudgetSummary,
        getTotalSummary,
    };

    return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>;
};
