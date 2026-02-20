import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, onClose, isLoading, onConfirm, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Mandiri */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          />

          {/* Card Modal Mandiri */}
          <div className="fixed inset-0 z-101 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden pointer-events-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tombol Close Pojok */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Ikon Lingkaran Merah */}
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">Hapus Data?</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {message || "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."}
                  </p>
                </div>

                {/* Tombol Aksi - Full Width Stacked atau Side by Side */}
                <div className="mt-8 flex flex-row gap-2">
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-gray-50 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={onConfirm}
                    className="w-full py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 shadow-md shadow-red-100 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? "Menghapus..." : "Ya, Hapus Sekarang"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;