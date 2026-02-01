import { Input } from '../common/Input';
import './AddressGrid.css';

export const AddressGrid = ({ address, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...address, [field]: value });
    };

    return (
        <div className="address-grid-container">
            <h4 className="section-title">Address Details</h4>
            <div className="address-grid">
                <div className="grid-full">
                    <Input
                        label="Street Address"
                        value={address.street}
                        onChange={(e) => handleChange('street', e.target.value)}
                        placeholder="123 Main St"
                    />
                </div>
                <div className="grid-half">
                    <Input
                        label="City"
                        value={address.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="New York"
                    />
                    <Input
                        label="State"
                        value={address.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        placeholder="NY"
                    />
                </div>
                <div className="grid-half">
                    <Input
                        label="Country"
                        value={address.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        placeholder="USA"
                    />
                    <Input
                        label="Pincode"
                        value={address.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        placeholder="10001"
                    />
                </div>
            </div>
        </div>
    );
};
