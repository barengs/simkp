import React from 'react';

const Card = ({ title, subtitle, actions, children, className = '', bodyClassName = '' }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {(title || actions) && (
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
                        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className={`p-6 ${bodyClassName}`}>{children}</div>
        </div>
    );
};

export default Card;
