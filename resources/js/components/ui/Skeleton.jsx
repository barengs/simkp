import React from 'react';

const Skeleton = ({ className = '', rows = 5 }) => {
    return (
        <div className={`animate-pulse ${className}`}>
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className="h-10 bg-gray-200 rounded-md"
                        style={{ width: `${100 - (i % 3) * 15}%` }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Skeleton;
