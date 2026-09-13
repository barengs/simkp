import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

const ModalImage = ({ isOpen, onClose, imageSrc, imageAlt = 'Image' }) => {
    const [zoom, setZoom] = useState(100);

    if (!isOpen) return null;

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 20, 300));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 20, 50));
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = imageAlt || 'image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/80
                backdrop-blur-sm
                p-4
            "
            onClick={onClose}
        >
            <div
                className="
                    relative
                    flex
                    flex-col
                    max-h-[90vh]
                    max-w-4xl
                    rounded-xl
                    bg-gray-950
                    shadow-2xl
                "
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-gray-800
                    px-4
                    py-3
                ">
                    <div className="min-w-0">
                        <p className="
                            truncate
                            text-sm
                            font-medium
                            text-gray-100
                        ">
                            {imageAlt}
                        </p>
                        <p className="
                            text-xs
                            text-gray-400
                        ">
                            Zoom: {zoom}%
                        </p>
                    </div>

                    <div className="
                        flex
                        items-center
                        gap-1
                        shrink-0
                    ">
                        <button
                            onClick={handleZoomOut}
                            className="
                                flex
                                items-center
                                justify-center
                                w-8
                                h-8
                                rounded-lg
                                hover:bg-gray-800
                                text-gray-300
                                transition
                            "
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleZoomIn}
                            className="
                                flex
                                items-center
                                justify-center
                                w-8
                                h-8
                                rounded-lg
                                hover:bg-gray-800
                                text-gray-300
                                transition
                            "
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleDownload}
                            className="
                                flex
                                items-center
                                justify-center
                                w-8
                                h-8
                                rounded-lg
                                hover:bg-gray-800
                                text-gray-300
                                transition
                            "
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        <button
                            onClick={onClose}
                            className="
                                flex
                                items-center
                                justify-center
                                w-8
                                h-8
                                rounded-lg
                                hover:bg-gray-800
                                text-gray-300
                                transition
                            "
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* IMAGE CONTAINER */}
                <div className="
                    flex-1
                    flex
                    items-center
                    justify-center
                    overflow-auto
                    bg-black
                    p-4
                ">
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        className="
                            max-w-full
                            max-h-[70vh]
                            object-contain
                            rounded-lg
                        "
                        style={{
                            transform: `scale(${zoom / 100})`,
                            transition: 'transform 0.2s ease-out',
                        }}
                    />
                </div>

                {/* FOOTER */}
                <div className="
                    border-t
                    border-gray-800
                    bg-gray-900/50
                    px-4
                    py-2
                ">
                    <p className="
                        text-xs
                        text-gray-400
                        text-center
                    ">
                        Klik di luar untuk menutup • Gunakan zoom untuk melihat detail
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModalImage;
