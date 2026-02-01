import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import './PortalLayout.css';

export const PortalLayout = () => {
    const { logout, user } = useAuth();

    return (
        <div className="portal-layout">
            <header className="portal-header">
                <div className="portal-header-content">
                    <div className="portal-logo">
                        <IndianRupee size={28} />
                        <span>Shiv Furniture Portal</span>
                    </div>

                    <nav className="portal-nav">
                        <NavLink
                            to="/portal/dashboard"
                            className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`}
                        >
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink
                            to="/portal/invoices"
                            className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`}
                        >
                            <FileText size={18} />
                            <span>My Invoices</span>
                        </NavLink>
                    </nav>

                    <div className="portal-user">
                        <ThemeToggle />
                        <div className="portal-user-info">
                            <span className="portal-user-name">{user?.name}</span>
                            <span className="portal-user-role">Portal User</span>
                        </div>
                        <button className="portal-logout" onClick={logout}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="portal-main">
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
