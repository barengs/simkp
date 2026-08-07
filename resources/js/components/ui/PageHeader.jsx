import React from 'react';

const PageHeader = ({ title, description, actions, icon: Icon }) => {
    return (
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
                {Icon && (
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
};

export default PageHeader;
