import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { IndianRupee } from 'lucide-react';
import './Login.css';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(email, password, role);

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/portal/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <IndianRupee size={48} />
                    </div>
                    <h1>Shiv Furniture ERP</h1>
                    <p>Sign in to manage your budgets and expenses</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />

                    <Select
                        label="Login As"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        options={[
                            { value: 'admin', label: 'Administrator' },
                            { value: 'portal', label: 'Portal User' },
                        ]}
                    />

                    <Button type="submit" variant="primary" className="auth-submit">
                        Sign In
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
