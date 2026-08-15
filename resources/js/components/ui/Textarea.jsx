import React from 'react';

const Textarea = React.forwardRef(
    ({ label, error, required, className = '', disabled, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                )}
                <div className="relative">
                    <textarea
                        ref={ref}
                        disabled={disabled}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors focus:outline-none focus:ring-2 ${
                            disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                        } ${
                            error
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                        } ${className}`}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;