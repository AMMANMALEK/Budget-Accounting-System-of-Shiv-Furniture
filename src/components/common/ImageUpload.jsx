import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import './ImageUpload.css';

export const ImageUpload = ({ value, onChange, label = "Profile Image" }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(value);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a fake URL for the file to simulate upload
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onChange(objectUrl);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="image-upload-container">
            <label className="input-label">{label}</label>
            <div className="image-upload-area">
                {preview ? (
                    <div className="image-preview">
                        <img src={preview} alt="Profile Preview" />
                        <button type="button" className="remove-image-btn" onClick={handleRemove}>
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon size={32} />
                        <span>Click to upload image</span>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>
            {preview && (
                <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Change Image
                </Button>
            )}
        </div>
    );
};
