import { motion, AnimatePresence } from 'framer-motion';

const DeleteConfirm = ({ isOpen, onClose, onConfirm, itemName, loading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay: Latar belakang blur-transparan */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container: Menengahkan Modal di Layar */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              className="w-full max-w-md overflow-hidden bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl"
            >
              <div className="p-8 flex flex-col items-center text-center">
                {/* Icon: Tengah */}
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>

                {/* Text: Tengah */}
                <h4 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h4>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus <br/>
                  <span className="font-bold text-gray-800">"{itemName}"</span>? <br />
                  Data yang dihapus tidak bisa dikembalikan.
                </p>

                {/* Tombol: Tengah & Sejajar */}
                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3 w-full">
                  <button 
                    onClick={onConfirm} 
                    disabled={loading} 
                    className="w-full px-5 py-3 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menghapus...
                      </>
                    ) : 'Ya, Hapus Sekarang'}
                  </button>
                  
                  <button 
                    onClick={onClose} 
                    disabled={loading}
                    className="w-full px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
                  >
                    Batalkan
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

export default DeleteConfirm;