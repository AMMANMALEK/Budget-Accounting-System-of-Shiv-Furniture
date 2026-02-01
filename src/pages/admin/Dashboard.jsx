import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { TrendingUp, TrendingDown, IndianRupee, Wallet } from 'lucide-react';
import './Dashboard.css';

export const AdminDashboard = () => {
    const { getTotalSummary, getBudgetSummary } = useMockData();
    const totals = getTotalSummary();
    const summary = getBudgetSummary();

    const chartData = summary.map(item => ({
        name: item.costCenter.code,
        Budget: item.budget,
        Spent: item.spent,
        Revenue: item.revenue
    }));

    const stats = [
        {
            label: 'Total Budget',
            value: `₹${totals.totalBudget.toLocaleString()}`,
            icon: IndianRupee,
            color: 'primary',
        },
        {
            label: 'Total Spent',
            value: `₹${totals.totalSpent.toLocaleString()}`,
            icon: TrendingDown,
            color: 'danger',
        },
        {
            label: 'Total Revenue',
            value: `₹${totals.totalRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'success',
        },
        {
            label: 'Remaining Budget',
            value: `₹${Math.abs(totals.totalRemaining).toLocaleString()}`,
            icon: Wallet,
            color: totals.totalRemaining >= 0 ? 'success' : 'danger',
        },
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Overview of your budget and expenses</p>
            </div>

            <div className="stats-grid">
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

            <div className="dashboard-content">
                <Card title="Financial Overview">
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="Budget" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Spent" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Revenue" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Budget Details by Cost Center">
                    <div className="budget-summary">
                        {summary.map((item) => {
                            const percentUsed = item.percentUsed;
                            const isOverBudget = percentUsed > 100;

                            return (
                                <div key={item.costCenter.id} className="budget-item">
                                    <div className="budget-item-header">
                                        <div>
                                            <div className="budget-item-name">{item.costCenter.name}</div>
                                            <div className="budget-item-code">{item.costCenter.code}</div>
                                        </div>
                                        <div className="budget-item-amounts">
                                            <div className="budget-amount">
                                                <span className="amount-label">Budget:</span>
                                                <span className="amount-value">₹{item.budget.toLocaleString()}</span>
                                            </div>
                                            <div className="budget-amount">
                                                <span className="amount-label">Spent:</span>
                                                <span className="amount-value">₹{item.spent.toLocaleString()}</span>
                                            </div>
                                            <div className="budget-amount">
                                                <span className="amount-label">Remaining:</span>
                                                <span className={`amount-value ${isOverBudget ? 'negative' : 'positive'}`}>
                                                    ₹{Math.abs(item.remaining).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="budget-progress">
                                        <div className="progress-bar">
                                            <div
                                                className={`progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                                                style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                            />
                                        </div>
                                        <div className={`progress-label ${isOverBudget ? 'over-budget' : ''}`}>
                                            {isOverBudget ? 'Over Budget' : `${percentUsed.toFixed(1)}% used`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
};
