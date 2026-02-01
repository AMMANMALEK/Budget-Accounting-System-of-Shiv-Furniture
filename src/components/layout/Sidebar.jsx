import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    IndianRupee,
    FileText,
    Receipt,
    BarChart3,
    Users,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import './Sidebar.css';

export const Sidebar = () => {
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/cost-centers', icon: FolderKanban, label: 'Cost Centers' },
        { path: '/admin/budgets', icon: IndianRupee, label: 'Budgets' },
        { path: '/admin/bills', icon: FileText, label: 'Vendor Bills' },
        { path: '/admin/invoices', icon: Receipt, label: 'Invoices' },
        { path: '/admin/contacts', icon: Users, label: 'Contacts' },
        { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <IndianRupee size={32} />
                    <span>Shiv Furniture</span>
                </div>
                <ThemeToggle />
            </div>

            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user?.name}</div>
                        <div className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Portal User'}</div>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={logout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};
