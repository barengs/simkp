import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Forbidden = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-3xl text-center">
                {/* Illustration */}
                <div className="relative flex justify-center">
                    <img
                        src="images/403.png"
                        alt="403 Forbidden"
                        className="w-full max-w-2xl h-auto object-contain"
                    />
                </div>

                {/* Content */}
                <div className="mt-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
                        We are Sorry...
                    </h1>

                    <p className="mt-3 text-sm sm:text-base text-gray-500 leading-6 max-w-md mx-auto">
                        The page you're trying to access has restricted access.
                        <br />
                        Please refer to your system administrator.
                    </p>
                </div>

                {/* Action */}
                <div className="mt-7 flex justify-center">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            min-w-[130px]
                            px-6
                            py-2.5
                            rounded-full
                            bg-emerald-500
                            hover:bg-emerald-600
                            text-white
                            text-sm
                            font-semibold
                            shadow-sm
                            hover:shadow-md
                            focus:outline-none
                            focus:ring-2
                            focus:ring-emerald-500
                            focus:ring-offset-2
                            transition-all
                            duration-200
                        "
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;