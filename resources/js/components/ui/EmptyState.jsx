import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'Tidak ada data', description, action }) => {
    return (
        <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export default EmptyState;
