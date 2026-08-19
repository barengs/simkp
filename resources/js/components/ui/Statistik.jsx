import React from 'react';

const Statistik = ({
    title,
    value,
    icon: Icon,
    iconClassName = 'text-emerald-600',
    borderClassName = 'bg-emerald-500',
    description,
}) => {
    return (
        <div
            className="
                relative
                flex
                items-center
                gap-4
                min-h-[110px]
                px-5
                py-4
                bg-white
                rounded-lg
                shadow-sm
                overflow-hidden
                transition-all
                duration-200
                hover:shadow-md
            "
        >
            {/* Border kiri */}
            <div
                className={`
                    absolute
                    left-0
                    top-0
                    bottom-0
                    w-1
                    ${borderClassName}
                `}
            />

            {/* Icon */}
            <div
                className={`
                    flex
                    items-center
                    justify-center
                    shrink-0
                    w-11
                    h-11
                    rounded-lg
                    bg-gray-50
                    ${iconClassName}
                `}
            >
                {Icon && (
                    <Icon
                        className="w-5 h-5"
                        strokeWidth={2}
                    />
                )}
            </div>

            {/* Content */}
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">
                    {title}
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900 leading-none">
                    {value}
                </p>

                {description && (
                    <p className="mt-1 text-xs text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Statistik;