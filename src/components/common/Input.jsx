import './Input.css';

export const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`form-input ${className}`}
                {...props}
            />
        </div>
    );
};

export const Select = ({
    label,
    value,
    onChange,
    options = [],
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
                required={required}
                className={`form-select ${className}`}
                {...props}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export const Textarea = ({
    label,
    value,
    onChange,
    placeholder,
    required = false,
    className = '',
    rows = 4,
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={rows}
                className={`form-textarea ${className}`}
                {...props}
            />
        </div>
    );
};
