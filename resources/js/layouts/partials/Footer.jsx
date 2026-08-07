import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-3">
      <p className="text-xs text-gray-500 text-center">
        &copy; {new Date().getFullYear()} SIM-KPTA. Sistem Informasi Manajemen Kerja Praktek & Tugas Akhir.
      </p>
    </footer>
  );
};

export default Footer;
