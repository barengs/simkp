import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, ...props }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop dengan Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat konten diklik
              className="bg-white/80 backdrop-blur-xl border border-white/20 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div class="px-6 py-4 border-b border-gray-200/50 flex justify-between items-center bg-white">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-200/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 text-gray-600 bg-gray-50">
                {children}
              </div>

              {/* Footer */}
              {/* <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200/50 flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Batal
                </button>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-md transition-all">
                  Simpan Perubahan
                </button>
              </div> */}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;