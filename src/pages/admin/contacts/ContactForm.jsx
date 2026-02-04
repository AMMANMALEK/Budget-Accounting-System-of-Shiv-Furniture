import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockData } from '../../../context/MockDataContext';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input, Select } from '../../../components/common/Input';
import { ImageUpload } from '../../../components/common/ImageUpload';
import { TagInput } from '../../../components/common/TagInput';
import { AddressGrid } from '../../../components/contacts/AddressGrid';
import { ArrowLeft, Save, Archive, Home } from 'lucide-react';
import './ContactForm.css';

export const ContactForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { contacts, addContact, updateContact, deleteContact } = useMockData();
    const isNew = !id || id === 'new';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        image: null,
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            pincode: ''
        },
        tagIds: [],
        contactType: 'VENDOR'
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (!isNew) {
            const contact = contacts.find(c => c.id === id);
            if (contact) {
                setFormData({
                    ...contact,
                    address: contact.address || {
                        street: '',
                        city: '',
                        state: '',
                        country: '',
                        pincode: ''
                    }
                });
            } else {
                navigate('/admin/contacts');
            }
        }
    }, [id, contacts, isNew, navigate]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (newAddress) => {
        setFormData(prev => ({ ...prev, address: newAddress }));
    };

    const validate = () => {
        if (!formData.name.trim()) return "Name is required";
        if (!formData.email.trim()) return "Email is required";
        if (!/^\d+$/.test(formData.phone)) return "Phone must contain only numbers";
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            if (isNew) {
                addContact(formData);
            } else {
                updateContact(id, formData);
            }
            navigate('/admin/contacts');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleArchive = () => {
        if (window.confirm('Are you sure you want to archive this contact?')) {
            deleteContact(id);
            navigate('/admin/contacts');
        }
    };

    return (
        <div className="page contact-form-page">
            <div className="form-header">
                <div className="header-left">
                    <Button variant="ghost" onClick={() => navigate('/admin/contacts')}>
                        <ArrowLeft size={20} />
                        Back
                    </Button>
                    <h1>{isNew ? 'New Contact' : 'Edit Contact'}</h1>
                </div>
                <div className="header-actions">
                    <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
                        <Home size={18} />
                        Home
                    </Button>
                    {!isNew && (
                        <Button variant="danger" onClick={handleArchive}>
                            <Archive size={18} />
                            Archived
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => navigate('/admin/contacts/new')}>
                        New
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        <Save size={18} />
                        Confirm
                    </Button>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <div className="form-layout">
                <div className="form-sidebar">
                    <Card>
                        <ImageUpload
                            value={formData.image}
                            onChange={(val) => handleChange('image', val)}
                        />
                    </Card>
                </div>

                <div className="form-main">
                    <Card title="Basic Information">
                        <div className="form-row">
                            <Input
                                label="Contact Name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                            <Input
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="1234567890"
                                required
                                type="tel"
                            />
                        </div>
                        <div className="form-row">
                            <Input
                                label="Email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="john@example.com"
                                required
                                type="email"
                            />
                            <Select
                                label="Contact Type"
                                value={formData.contactType}
                                onChange={(e) => handleChange('contactType', e.target.value)}
                                options={[
                                    { value: 'VENDOR', label: 'Vendor' },
                                    { value: 'CUSTOMER', label: 'Customer' },
                                    { value: 'ALL', label: 'Internal/Both' },
                                ]}
                                required
                            />
                        </div>
                    </Card>

                    <Card title="Categorization">
                        <TagInput
                            selectedTagIds={formData.tagIds}
                            onChange={(val) => handleChange('tagIds', val)}
                        />
                    </Card>

                    <AddressGrid
                        address={formData.address}
                        onChange={handleAddressChange}
                    />
                </div>
            </div>
        </div>
    );
};
