import { createContext, useContext, useState, useEffect } from 'react';

const MockDataContext = createContext(null);

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) {
        throw new Error('useMockData must be used within MockDataProvider');
    }
    return context;
};

// Initial mock data
const initialData = {
    costCenters: [
        { id: 'cc-1', name: 'Marketing', code: 'MKT', description: 'Marketing and advertising expenses', status: 'active' },
        { id: 'cc-2', name: 'Operations', code: 'OPS', description: 'Operational costs' },
        { id: 'cc-3', name: 'IT & Technology', code: 'IT', description: 'Technology infrastructure' },
        { id: 'cc-4', name: 'Human Resources', code: 'HR', description: 'Recruitment and employee relations' },
        { id: 'cc-5', name: 'Sales & Business Dev', code: 'SALES', description: 'Sales commissions and tools' },
        { id: 'cc-6', name: 'Research & Development', code: 'R&D', description: 'Product development and innovation' },
        { id: 'cc-7', name: 'Finance & Legal', code: 'FIN', description: 'Accounting, audit, and legal fees' },
        { id: 'cc-8', name: 'Logistics', code: 'LOG', description: 'Shipping and supply chain' },
        { id: 'cc-9', name: 'Customer Support', code: 'CS', description: 'Support tools and personnel' },
        { id: 'cc-10', name: 'Facilities', code: 'FAC', description: 'Office rent and utilities', status: 'pending' },
    ],
    budgets: [
        { id: 'b-1', costCenterId: 'cc-1', amount: 50000, fiscalYear: '2026' },
        { id: 'b-2', costCenterId: 'cc-2', amount: 120000, fiscalYear: '2026' },
        { id: 'b-3', costCenterId: 'cc-3', amount: 80000, fiscalYear: '2026' },
    ],
    transactions: [
        {
            id: 't-1',
            type: 'bill',
            costCenterId: 'cc-1',
            vendor: 'Google Ads',
            customer: null,
            amount: 5000,
            date: '2026-01-15',
            status: 'paid',
            description: 'Q1 Advertising Campaign',
        },
        {
            id: 't-2',
            type: 'bill',
            costCenterId: 'cc-3',
            vendor: 'AWS',
            customer: null,
            amount: 3200,
            date: '2026-01-20',
            status: 'paid',
            description: 'Cloud hosting January',
        },
        {
            id: 't-3',
            type: 'invoice',
            costCenterId: 'cc-2',
            vendor: null,
            customer: 'Acme Corp',
            amount: 15000,
            date: '2026-01-25',
            status: 'unpaid',
            description: 'Consulting services',
        },
        {
            id: 't-4',
            type: 'invoice',
            costCenterId: 'cc-2',
            vendor: null,
            customer: 'Tech Solutions Inc',
            amount: 8500,
            date: '2026-01-28',
            status: 'paid',
            description: 'Software development',
        },
    ],
    contacts: [
        {
            id: 'contact-1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: 1234567890,
            image: null,
            address: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                pincode: '10001'
            },
            tagIds: ['tag-1'],
            isArchived: false,
        }
    ],
    tags: [
        { id: 'tag-1', label: 'Vendor', color: '#3b82f6' },
        { id: 'tag-2', label: 'Customer', color: '#10b981' },
    ],
};

export const MockDataProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        // Load from localStorage or use initial data
        const stored = localStorage.getItem('erp_data');
        if (stored) {
            const parsed = JSON.parse(stored);

            // Merge initial cost centers with stored ones (avoiding duplicates by ID)
            const storedCCIds = new Set(parsed.costCenters.map(cc => cc.id));
            const newCCs = initialData.costCenters.filter(cc => !storedCCIds.has(cc.id));
            const mergedCostCenters = [...parsed.costCenters, ...newCCs];

            // Ensure new schema fields exist by merging with initialData
            return {
                ...initialData,
                ...parsed,
                costCenters: mergedCostCenters.map(cc => ({
                    ...cc,
                    status: cc.status || 'active'
                })),
                contacts: parsed.contacts || initialData.contacts,
                tags: parsed.tags || initialData.tags
            };
        }
        return initialData;
    });

    // Persist to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('erp_data', JSON.stringify(data));
    }, [data]);

    // Cost Center operations
    const addCostCenter = (costCenter) => {
        const newCostCenter = {
            ...costCenter,
            id: `cc-${Date.now()}`,
            status: costCenter.status || 'pending',
        };
        setData(prev => ({
            ...prev,
            costCenters: [...prev.costCenters, newCostCenter],
        }));
        return newCostCenter;
    };

    const updateCostCenter = (id, updates) => {
        setData(prev => ({
            ...prev,
            costCenters: prev.costCenters.map(cc =>
                cc.id === id ? { ...cc, ...updates } : cc
            ),
        }));
    };

    const deleteCostCenter = (id) => {
        setData(prev => ({
            ...prev,
            costCenters: prev.costCenters.filter(cc => cc.id !== id),
            budgets: prev.budgets.filter(b => b.costCenterId !== id),
            transactions: prev.transactions.filter(t => t.costCenterId !== id),
        }));
    };

    // Budget operations
    const setBudget = (costCenterId, amount, fiscalYear = '2026') => {
        const existing = data.budgets.find(
            b => b.costCenterId === costCenterId && b.fiscalYear === fiscalYear
        );

        if (existing) {
            setData(prev => ({
                ...prev,
                budgets: prev.budgets.map(b =>
                    b.id === existing.id ? { ...b, amount } : b
                ),
            }));
        } else {
            const newBudget = {
                id: `b-${Date.now()}`,
                costCenterId,
                amount,
                fiscalYear,
            };
            setData(prev => ({
                ...prev,
                budgets: [...prev.budgets, newBudget],
            }));
        }
    };

    // Transaction operations
    const addTransaction = (transaction) => {
        const newTransaction = {
            ...transaction,
            id: `t-${Date.now()}`,
            date: transaction.date || new Date().toISOString().split('T')[0],
            status: transaction.status || 'draft',
        };
        setData(prev => ({
            ...prev,
            transactions: [...prev.transactions, newTransaction],
        }));
        return newTransaction;
    };

    const updateTransaction = (id, updates) => {
        setData(prev => ({
            ...prev,
            transactions: prev.transactions.map(t =>
                t.id === id ? { ...t, ...updates } : t
            ),
        }));
    };

    const deleteTransaction = (id) => {
        setData(prev => ({
            ...prev,
            transactions: prev.transactions.filter(t => t.id !== id),
        }));
    };

    // Contact operations
    const addContact = (contact) => {
        // Validation: Email uniqueness
        if (data.contacts.some(c => c.email === contact.email)) {
            throw new Error('Email must be unique');
        }

        const newContact = {
            ...contact,
            id: `contact-${Date.now()}`,
            isArchived: false,
        };
        setData(prev => ({
            ...prev,
            contacts: [...prev.contacts, newContact],
        }));
        return newContact;
    };

    const updateContact = (id, updates) => {
        // Validation: Email uniqueness (if email is changing)
        if (updates.email && data.contacts.some(c => c.email === updates.email && c.id !== id)) {
            throw new Error('Email must be unique');
        }

        setData(prev => ({
            ...prev,
            contacts: prev.contacts.map(c =>
                c.id === id ? { ...c, ...updates } : c
            ),
        }));
    };

    const deleteContact = (id) => {
        // Soft delete (Archive)
        updateContact(id, { isArchived: true });
    };

    const restoreContact = (id) => {
        updateContact(id, { isArchived: false });
    };

    // Tag operations
    const addTag = (label) => {
        const existing = data.tags.find(t => t.label.toLowerCase() === label.toLowerCase());
        if (existing) return existing;

        const newTag = {
            id: `tag-${Date.now()}`,
            label,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
        };
        setData(prev => ({
            ...prev,
            tags: [...prev.tags, newTag],
        }));
        return newTag;
    };

    // Computed values
    const getBudgetSummary = () => {
        const summary = data.costCenters.map(cc => {
            const budget = data.budgets.find(b => b.costCenterId === cc.id);
            const transactions = data.transactions.filter(t => t.costCenterId === cc.id);

            const spent = transactions
                .filter(t => t.type === 'bill' && t.status !== 'draft')
                .reduce((sum, t) => sum + t.amount, 0);

            const revenue = transactions
                .filter(t => t.type === 'invoice')
                .reduce((sum, t) => sum + t.amount, 0);

            const budgetAmount = budget?.amount || 0;
            const remaining = budgetAmount - spent;
            const variance = remaining;

            return {
                costCenter: cc,
                budget: budgetAmount,
                spent,
                revenue,
                remaining,
                variance,
                percentUsed: budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0,
            };
        });

        return summary;
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
        // Data
        costCenters: data.costCenters,
        budgets: data.budgets,
        transactions: data.transactions,
        contacts: data.contacts,
        tags: data.tags,

        // Contact operations
        addContact,
        updateContact,
        deleteContact,
        restoreContact,
        addTag,

        // Cost Center operations
        addCostCenter,
        updateCostCenter,
        deleteCostCenter,

        // Budget operations
        setBudget,

        // Transaction operations
        addTransaction,
        updateTransaction,
        deleteTransaction,

        // Computed
        getBudgetSummary,
        getTotalSummary,
    };

    return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>;
};
