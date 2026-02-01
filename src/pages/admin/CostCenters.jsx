import { useState } from 'react';
import { useMockData } from '../../context/MockDataContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import './CostCenters.css';

export const CostCenters = () => {
    const { costCenters, addCostCenter, updateCostCenter, deleteCostCenter } = useMockData();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            updateCostCenter(editingId, formData);
        } else {
            addCostCenter(formData);
        }

        resetForm();
    };

    const handleEdit = (cc) => {
        setFormData({
            name: cc.name,
            code: cc.code,
            description: cc.description,
        });
        setEditingId(cc.id);
        setShowForm(true);
    };

    const handleApprove = (id) => {
        updateCostCenter(id, { status: 'active' });
    };

    const handleReject = (id) => {
        if (confirm('Are you sure you want to reject this cost center?')) {
            updateCostCenter(id, { status: 'rejected' });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this cost center? This will also delete associated budgets and transactions.')) {
            deleteCostCenter(id);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', code: '', description: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Cost Centers</h1>
                    <p>Manage your organizational cost centers</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} variant="primary">
                    <Plus size={20} />
                    {showForm ? 'Cancel' : 'Add Cost Center'}
                </Button>
            </div>

            {showForm && (
                <Card className="form-card">
                    <h3>{editingId ? 'Edit Cost Center' : 'New Cost Center'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <Input
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Marketing"
                                required
                            />
                            <Input
                                label="Code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g., MKT"
                                required
                            />
                        </div>
                        <Textarea
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of this cost center"
                        />
                        <div className="form-actions">
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                {editingId ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {costCenters.map((cc) => (
                                <tr key={cc.id}>
                                    <td>
                                        <span className="badge badge-primary">{cc.code}</span>
                                    </td>
                                    <td className="font-medium">{cc.name}</td>
                                    <td className="text-secondary">{cc.description}</td>
                                    <td>
                                        <Badge variant={cc.status === 'active' ? 'success' : cc.status === 'rejected' ? 'danger' : 'warning'}>
                                            {(cc.status || 'active').toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {(!cc.status || cc.status === 'pending') && (
                                                <>
                                                    <button
                                                        className="icon-btn success text-btn"
                                                        onClick={() => handleApprove(cc.id)}
                                                        title="Approve"
                                                    >
                                                        APV
                                                    </button>
                                                    <button
                                                        className="icon-btn danger text-btn"
                                                        onClick={() => handleReject(cc.id)}
                                                        title="Reject"
                                                    >
                                                        REJ
                                                    </button>
                                                </>
                                            )}
                                            <button className="icon-btn" onClick={() => handleEdit(cc)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="icon-btn danger" onClick={() => handleDelete(cc.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
