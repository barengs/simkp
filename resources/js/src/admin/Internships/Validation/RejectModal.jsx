import React, { useState } from 'react';
import Modal from '../../../components/Modal';

const RejectModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const [note, setNote] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!note.trim()) return;
        onSubmit(note);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tolak Pendaftaran KP">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                    <p className="text-sm text-red-800">
                        Anda akan menolak pendaftaran ini. Berkan alasan yang jelas agar mahasiswa dapat memperbaikinya.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alasan Penolakan <span className="text-red-500">*</span></label>
                    <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm min-h-[120px]"
                        placeholder="Contoh: Proposal kurang lengkap, format krs salah..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !note.trim()}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Menyimpan...
                            </>
                        ) : 'Tolak Pendaftaran'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default RejectModal;
