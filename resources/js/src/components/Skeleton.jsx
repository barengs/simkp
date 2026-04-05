import React from 'react';

const Skeleton = ({ className = "" }) => {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
};

export const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-12" />
        </div>
    </div>
);

export const SkeletonList = ({ items = 5 }) => (
    <div className="space-y-4">
        {[...Array(items)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        ))}
    </div>
);

export default Skeleton;