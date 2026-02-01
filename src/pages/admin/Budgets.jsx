import { useState } from 'react';
import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Plus, IndianRupee, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import './CostCenters.css';

export const Budgets = () => {
    const { costCenters, budgets, setBudget } = useMockData();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        costCenterId: '',
        amount: '',
        fiscalYear: '2026',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setBudget(formData.costCenterId, parseFloat(formData.amount), formData.fiscalYear);
        setFormData({ costCenterId: '', amount: '', fiscalYear: '2026' });
        setShowForm(false);
    };

    const getBudgetForCostCenter = (costCenterId) => {
        return budgets.find(b => b.costCenterId === costCenterId && b.fiscalYear === '2026');
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Budgets</h1>
                    <p>Set and manage budgets for cost centers</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} variant="primary">
                    <Plus size={20} />
                    {showForm ? 'Cancel' : 'Set Budget'}
                </Button>
            </div>

            {showForm && (
                <Card className="form-card">
                    <h3>Set Budget</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
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
                            <Input
                                label="Budget Amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="50000"
                                required
                            />
                            <Input
                                label="Fiscal Year"
                                type="text"
                                value={formData.fiscalYear}
                                onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                                placeholder="2026"
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Set Budget
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="budgets-grid">
                {costCenters.map((cc) => {
                    const budget = getBudgetForCostCenter(cc.id);
                    return (
                        <Card key={cc.id} className="budget-card">
                            <div className="budget-card-header">
                                <div>
                                    <h3>{cc.name}</h3>
                                    <div className="budget-icon"><IndianRupee size={20} /></div>
                                </div>
                                <span className="badge badge-primary">FY 2026</span>
                            </div>
                            <div className="budget-card-amount">
                                <IndianRupee size={32} className="budget-icon" />
                                <div className="budget-value">
                                    {budget ? `₹${budget.amount.toLocaleString()}` : 'Not Set'}
                                </div>
                            </div>
                            {!budget && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setFormData({ ...formData, costCenterId: cc.id });
                                        setShowForm(true);
                                    }}
                                >
                                    Set Budget
                                </Button>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
