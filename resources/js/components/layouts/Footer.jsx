import React from "react";

const Footer = ({ isCollapsed }) => {
    const footerLeft = isCollapsed ? "md:left-20" : "md:left-64";

    return (
        <footer
            className={`bg-white border-t border-gray-200 py-6 fixed bottom-0 right-0 left-0 ${footerLeft} z-10 transition-all duration-300`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} SIMKP - Sistem Informasi Kerja
                    Praktek
                </p>
            </div>
        </footer>
    );
};

export default Footer;
