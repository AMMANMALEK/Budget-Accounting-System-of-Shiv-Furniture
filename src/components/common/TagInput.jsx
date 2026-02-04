import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { Badge } from '../common/Badge';
import './TagInput.css';

export const TagInput = ({ selectedTagIds, onChange, label = "Tags" }) => {
    const { tags, addTag } = useMockData();
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef(null);

    const safeTags = tags || [];
    const safeSelectedTagIds = selectedTagIds || [];

    const selectedTags = safeTags.filter(t => safeSelectedTagIds.includes(t.id));
    const availableTags = safeTags.filter(t =>
        !safeSelectedTagIds.includes(t.id) &&
        t.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddTag = (tag) => {
        onChange([...selectedTagIds, tag.id]);
        setInputValue('');
        setShowSuggestions(false);
    };

    const handleRemoveTag = (tagId) => {
        onChange(selectedTagIds.filter(id => id !== tagId));
    };

    const handleCreateTag = () => {
        if (!inputValue.trim()) return;
        const newTag = addTag(inputValue.trim());
        onChange([...selectedTagIds, newTag.id]);
        setInputValue('');
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (availableTags.length === 1 && availableTags[0].label.toLowerCase() === inputValue.toLowerCase()) {
                handleAddTag(availableTags[0]);
            } else {
                handleCreateTag();
            }
        }
    };

    return (
        <div className="tag-input-container" ref={containerRef}>
            <label className="input-label">{label}</label>
            <div className="tag-input-wrapper" onClick={() => setShowSuggestions(true)}>
                <div className="selected-tags">
                    {selectedTags.map(tag => (
                        <div key={tag.id} className="tag-chip" style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}>
                            <span>{tag.label}</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag.id); }}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    <input
                        type="text"
                        className="tag-input-field"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedTags.length === 0 ? "Select or create tags..." : ""}
                        onFocus={() => setShowSuggestions(true)}
                    />
                </div>
            </div>

            {showSuggestions && (inputValue || availableTags.length > 0) && (
                <div className="tag-suggestions">
                    {availableTags.map(tag => (
                        <div
                            key={tag.id}
                            className="tag-suggestion-item"
                            onClick={() => handleAddTag(tag)}
                        >
                            <span className="color-dot" style={{ backgroundColor: tag.color }}></span>
                            {tag.label}
                        </div>
                    ))}
                    {inputValue && !availableTags.find(t => t.label.toLowerCase() === inputValue.toLowerCase()) && (
                        <div className="tag-suggestion-item create-option" onClick={handleCreateTag}>
                            <Plus size={14} />
                            Create "{inputValue}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
