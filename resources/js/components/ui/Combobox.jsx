import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Combobox = ({ label, value, onChange, options, placeholder, required, disabled, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    const filteredOptions = options.filter(opt =>
        opt.label?.toLowerCase().includes(search.toLowerCase()) ||
        opt.value?.toString().includes(search)
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (opt) => {
        onChange({ target: { name: label?.toLowerCase(), value: opt.value } });
        setSearch('');
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div
                className={`
                    w-full px-3 py-2 bg-white border rounded-lg cursor-pointer
                    flex items-center justify-between
                    transition-colors duration-200
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
                    ${isOpen ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-300'}
                `}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(!isOpen);
                        if (!isOpen && inputRef.current) {
                            setTimeout(() => inputRef.current?.focus(), 0);
                        }
                    }
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
                    placeholder={selectedOption?.label || placeholder}
                    value={isOpen ? search : selectedOption?.label || ''}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                />
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.map((opt) => (
                        <div
                            key={opt.value}
                            className={`
                                px-3 py-2 cursor-pointer flex items-center justify-between
                                hover:bg-gray-50
                                ${value === opt.value ? 'bg-emerald-50' : ''}
                            `}
                            onClick={() => handleSelect(opt)}
                        >
                            <span className="text-sm text-gray-900">{opt.label}</span>
                            {value === opt.value && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                    ))}
                </div>
            )}

            {isOpen && filteredOptions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
                    <span className="text-sm text-gray-500">Tidak ada hasil</span>
                </div>
            )}
        </div>
    );
};

export default Combobox;