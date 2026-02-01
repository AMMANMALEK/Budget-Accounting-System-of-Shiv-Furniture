import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Download, PieChart as PieIcon } from 'lucide-react';
import './Reports.css';

export const Reports = () => {
    const { getBudgetSummary } = useMockData();
    const summary = getBudgetSummary();

    const totals = summary.reduce(
        (acc, item) => ({
            budget: acc.budget + item.budget,
            spent: acc.spent + item.spent,
            revenue: acc.revenue + item.revenue,
            remaining: acc.remaining + item.remaining,
        }),
        { budget: 0, spent: 0, revenue: 0, remaining: 0 }
    );

    const pieData = summary
        .filter(item => item.spent > 0)
        .map(item => ({
            name: item.costCenter.name,
            value: item.spent,
        }));

    const COLORS = ['var(--palette-primary-main)', 'var(--palette-success-main)', 'var(--palette-warning-main)', 'var(--palette-info-main)'];

    const exportToCSV = () => {
        const headers = ['Cost Center,Code,Budget,Spent,Revenue,Remaining,Variance,% Used'];
        const rows = summary.map(item => [
            `"${item.costCenter.name}"`,
            item.costCenter.code,
            item.budget,
            item.spent,
            item.revenue,
            item.remaining,
            item.variance,
            item.percentUsed.toFixed(2) + '%'
        ].join(','));

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'budget_report.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Budget vs Actual Report</h1>
                    <p>Comprehensive view of budget performance</p>
                </div>
                <Button onClick={exportToCSV} variant="secondary">
                    <Download size={20} />
                    Export CSV
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
                <Card title="Expense Distribution by Cost Center">
                    <div style={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
                                No expense data available
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Card>
                <div className="table-container">
                    <table className="table report-table">
                        <thead>
                            <tr>
                                <th>Cost Center</th>
                                <th>Code</th>
                                <th className="text-right">Budget</th>
                                <th className="text-right">Spent</th>
                                <th className="text-right">Revenue</th>
                                <th className="text-right">Remaining</th>
                                <th className="text-right">Variance</th>
                                <th className="text-right">% Used</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((item) => {
                                const isOverBudget = item.remaining < 0;
                                return (
                                    <tr key={item.costCenter.id}>
                                        <td className="font-medium">{item.costCenter.name}</td>
                                        <td>
                                            <span className="badge badge-primary">{item.costCenter.code}</span>
                                        </td>
                                        <td className="text-right">₹{item.budget.toLocaleString()}</td>
                                        <td className="text-right">₹{item.spent.toLocaleString()}</td>
                                        <td className="text-right text-success">₹{item.revenue.toLocaleString()}</td>
                                        <td className={`text-right ${isOverBudget ? 'text-danger' : 'text-success'}`}>
                                            ₹{item.remaining.toLocaleString()}
                                        </td>
                                        <td className={`text-right ${isOverBudget ? 'text-danger' : 'text-success'}`}>
                                            ₹{item.variance.toLocaleString()}
                                        </td>
                                        <td className="text-right">
                                            <span className={`percent-badge ${isOverBudget ? 'over' : ''}`}>
                                                {item.percentUsed.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="totals-row">
                                <td colSpan="2" className="font-bold">TOTALS</td>
                                <td className="text-right font-bold">₹{totals.budget.toLocaleString()}</td>
                                <td className="text-right font-bold">₹{totals.spent.toLocaleString()}</td>
                                <td className="text-right font-bold text-success">₹{totals.revenue.toLocaleString()}</td>
                                <td className={`text-right font-bold ${totals.remaining < 0 ? 'text-danger' : 'text-success'}`}>
                                    ₹{totals.remaining.toLocaleString()}
                                </td>
                                <td className={`text-right font-bold ${totals.remaining < 0 ? 'text-danger' : 'text-success'}`}>
                                    ₹{totals.remaining.toLocaleString()}
                                </td>
                                <td className="text-right font-bold">
                                    {(totals.budget > 0 ? (totals.spent / totals.budget) * 100 : 0).toFixed(1)}%
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
        </div>
    );
};
