const Skeleton = () => {
    return (
        <div className="w-full animate-pulse p-4">
            {[...Array(1)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div> {/* Icon */}
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div> {/* Name */}
                        <div className="h-3 bg-gray-100 rounded w-1/6"></div> {/* Code */}
                    </div>
                    <div className="w-20 h-6 bg-gray-100 rounded-lg"></div> {/* Status */}
                    <div className="w-8 h-8 bg-gray-100 rounded-lg"></div> {/* Action */}
                </div>
            ))}
        </div>
    )
}

export default Skeleton;