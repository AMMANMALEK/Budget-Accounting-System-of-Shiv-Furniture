import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { IndianRupee } from 'lucide-react';
import './Login.css';

export const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        signup(name, email, password, role);

        // Redirect based on role
        if (role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/portal/dashboard');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <IndianRupee size={48} />
                    </div>
                    <h1>Create Account</h1>
                    <p>Join Shiv Furniture to manage your finances</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        label="Full Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        required
                    />

                    <Select
                        label="Account Type"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        options={[
                            { value: 'admin', label: 'Administrator' },
                            { value: 'portal', label: 'Portal User' },
                        ]}
                    />

                    <Button type="submit" variant="primary" className="auth-submit">
                        Create Account
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
