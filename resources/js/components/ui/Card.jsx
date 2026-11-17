import React from 'react';

const Card = ({ title, subtitle, actions, children, className = '', bodyClassName = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200/80 transition-all ${className}`}>
            {(title || actions) && (
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-sm font-bold text-slate-800">{title}</h3>}
                        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className={bodyClassName || (title || actions ? 'p-6' : '')}>{children}</div>
        </div>
    );
};

export default Card;
