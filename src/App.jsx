import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MockDataProvider } from './context/MockDataContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { PortalLayout } from './components/layout/PortalLayout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { AdminDashboard } from './pages/admin/Dashboard';
import { CostCenters } from './pages/admin/CostCenters';
import { Budgets } from './pages/admin/Budgets';
import { VendorBills } from './pages/admin/VendorBills';
import { CustomerInvoices } from './pages/admin/CustomerInvoices';
import { Reports } from './pages/admin/Reports';
import { ContactList } from './pages/admin/contacts/ContactList';
import { ContactForm } from './pages/admin/contacts/ContactForm';
import { PortalDashboard } from './pages/portal/Dashboard';
import { MyInvoices } from './pages/portal/MyInvoices';
import { InvoiceDetail } from './pages/portal/InvoiceDetail';
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="spinner" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MockDataProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="cost-centers" element={<CostCenters />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="bills" element={<VendorBills />} />
              <Route path="invoices" element={<CustomerInvoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="contacts" element={<ContactList />} />
              <Route path="contacts/new" element={<ContactForm />} />
              <Route path="contacts/:id" element={<ContactForm />} />
            </Route>

            {/* Portal Routes */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/portal/dashboard" replace />} />
              <Route path="dashboard" element={<PortalDashboard />} />
              <Route path="invoices" element={<MyInvoices />} />
              <Route path="invoices/:id" element={<InvoiceDetail />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </MockDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
