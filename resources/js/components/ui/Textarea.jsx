import React from 'react';

const Textarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  rows = 4, 
  placeholder = '', 
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`${className} mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${error ? 'border-red-500 focus:ring-red-500' : ''} ${disabled ? 'bg-gray-50' : ''}`}
        disabled={disabled}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Textarea;
