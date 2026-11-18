import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X } from 'lucide-react';

const Combobox = ({
    id,
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Pilih salah satu...',
    required = false,
    disabled = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [menuStyle, setMenuStyle] = useState({});

    const wrapperRef = useRef(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const safeOptions = Array.isArray(options) ? options : [];

    const filteredOptions = safeOptions.filter((opt) => {
        const query = search.toLowerCase();
        const optLabel = (opt.label || '').toLowerCase();
        const optVal = (opt.value !== null && opt.value !== undefined ? String(opt.value) : '').toLowerCase();
        return optLabel.includes(query) || optVal.includes(query);
    });

    const selectedOption = safeOptions.find((opt) => opt.value === value);

    const updatePosition = useCallback(() => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        const dropdownMaxHeight = 240;
        const margin = 4;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const openUpward = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;
        const maxHeight = openUpward
            ? Math.min(dropdownMaxHeight, Math.max(120, spaceAbove - 16))
            : Math.min(dropdownMaxHeight, Math.max(120, spaceBelow - 16));

        const top = openUpward
            ? rect.top - maxHeight - margin
            : rect.bottom + margin;

        setMenuStyle({
            position: 'fixed',
            top: `${top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            maxHeight: `${maxHeight}px`,
            zIndex: 99999,
        });
    }, []);

    // Update position when opened
    useEffect(() => {
        if (!isOpen) return;

        updatePosition();

        const handleScrollOrResize = () => {
            updatePosition();
        };

        window.addEventListener('resize', handleScrollOrResize);
        window.addEventListener('scroll', handleScrollOrResize, true);

        return () => {
            window.removeEventListener('resize', handleScrollOrResize);
            window.removeEventListener('scroll', handleScrollOrResize, true);
        };
    }, [isOpen, updatePosition]);

    // Handle outside clicks
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleSelect = (opt) => {
        if (onChange) {
            onChange({
                target: {
                    name: (label || '').toLowerCase().replace(/\s+/g, '_'),
                    value: opt.value,
                },
            });
        }
        setSearch('');
        setIsOpen(false);
    };

    const handleToggle = () => {
        if (disabled) return;
        if (!isOpen) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
        } else {
            setIsOpen(false);
            setSearch('');
        }
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                id={id}
                className={`
                    w-full px-3 py-2 bg-white border rounded-lg cursor-pointer
                    flex items-center justify-between gap-2
                    transition-all duration-150
                    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'hover:border-gray-400'}
                    ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-300'}
                `}
                onClick={handleToggle}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 cursor-pointer min-w-0"
                    placeholder={selectedOption ? selectedOption.label : placeholder}
                    value={isOpen ? search : (selectedOption ? selectedOption.label : '')}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (!disabled && !isOpen) {
                            setIsOpen(true);
                        }
                    }}
                    disabled={disabled}
                />

                <div className="flex items-center gap-1 shrink-0 text-gray-400">
                    {isOpen && search && (
                        <button
                            type="button"
                            className="p-0.5 hover:text-gray-600 rounded"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSearch('');
                            }}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}
                    />
                </div>
            </div>

            {/* Portal Dropdown Menu */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    style={menuStyle}
                    className="bg-white border border-gray-200 rounded-lg shadow-2xl overflow-y-auto divide-y divide-gray-50"
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => {
                            const isSelected = value === opt.value;
                            return (
                                <div
                                    key={opt.value}
                                    className={`
                                        px-3.5 py-2.5 cursor-pointer flex items-center justify-between text-sm
                                        hover:bg-emerald-50/80 transition-colors
                                        ${isSelected ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-gray-800'}
                                    `}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelect(opt);
                                    }}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {isSelected && (
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-4 py-3 text-center text-xs text-gray-400">
                            Tidak ada pilihan yang cocok
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default Combobox;
