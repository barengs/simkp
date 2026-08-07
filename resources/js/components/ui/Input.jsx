import React from 'react';

const Input = React.forwardRef(
    ({ label, error, required, className = '', icon: Icon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                )}
                <div className="relative">
                    {Icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon className="h-4 w-4 text-gray-400" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors focus:outline-none focus:ring-2 ${
                            Icon ? 'pl-10' : ''
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

Input.displayName = 'Input';

export default Input;
