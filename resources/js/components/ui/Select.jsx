import React from 'react';

const Select = React.forwardRef(
    ({ label, error, required, options = [], placeholder, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors focus:outline-none focus:ring-2 ${
                        error
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                    } ${className}`}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
