import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../../context/MockDataContext';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Badge } from '../../../components/common/Badge';
import { Plus, Search, User, Phone, Mail, Tag } from 'lucide-react';
import './ContactList.css';

export const ContactList = () => {
    const { contacts, tags } = useMockData();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const activeContacts = contacts.filter(c => c.active !== false);
    const filteredContacts = activeContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.toString().includes(searchTerm)
    );

    const getTags = (tagIds = []) => {
        if (!tags || !Array.isArray(tags)) return [];
        return tags.filter(tag => tagIds && tagIds.includes(tag.id));
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Contacts</h1>
                    <p>Manage your customers, vendors, and partners</p>
                </div>
                <Button variant="primary" onClick={() => navigate('/admin/contacts/new')}>
                    <Plus size={20} />
                    New Contact
                </Button>
            </div>

            <Card>
                <div className="actions-bar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="table contact-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Contact Info</th>
                                <th>Tags</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.map((contact) => (
                                <tr
                                    key={contact.id}
                                    onClick={() => navigate(`/admin/contacts/${contact.id}`)}
                                    className="clickable-row"
                                >
                                    <td>
                                        <div className="contact-name-cell">
                                            <div className="contact-avatar">
                                                {contact.image ? (
                                                    <img src={contact.image} alt={contact.name} />
                                                ) : (
                                                    <User size={20} />
                                                )}
                                            </div>
                                            <span className="font-medium">{contact.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge variant={contact.contactType === 'CUSTOMER' ? 'success' : contact.contactType === 'VENDOR' ? 'primary' : 'secondary'}>
                                            {contact.contactType}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="contact-info-cell">
                                            <div className="info-row">
                                                <Mail size={14} />
                                                <span>{contact.email}</span>
                                            </div>
                                            <div className="info-row">
                                                <Phone size={14} />
                                                <span>{contact.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="tags-cell">
                                            {getTags(contact.tagIds).map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className="tag-badge"
                                                    style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                                                >
                                                    {tag.label}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="text-secondary">
                                        {contact.address?.city ? `${contact.address.city}, ${contact.address.state || ''}` : 'No address provided'}
                                    </td>
                                </tr>
                            ))}
                            {filteredContacts.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-secondary">
                                        No contacts found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
