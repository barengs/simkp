import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLecturers } from '../../../store/slice/lecturerSlice';

const PlottingModal = ({ isOpen, onClose, onSubmit, isSubmitting, internship }) => {
    const dispatch = useDispatch();
    const { data: lecturers = [], loading } = useSelector(state => state.lecturers);
    const [supervisorId, setSupervisorId] = useState('');

    useEffect(() => {
        if (isOpen && (!lecturers || lecturers.length === 0)) {
            dispatch(fetchLecturers());
        }
    }, [isOpen, dispatch, lecturers?.length]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!supervisorId) return;
        onSubmit(supervisorId);
    };

    if (!internship) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Plotting Dosen Pembimbing">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                    <p className="text-sm font-semibold text-indigo-900">Kelompok: {internship.leader?.name}</p>
                    <p className="text-xs text-indigo-700 mt-1">Tema: {internship.theme?.name}</p>
                    <p className="text-xs text-indigo-700">Mitra: {internship.company?.name || internship.company_name_manual}</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Dosen Pembimbing <span className="text-red-500">*</span></label>
                    <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                        value={supervisorId}
                        onChange={(e) => setSupervisorId(e.target.value)}
                        required
                        disabled={loading}
                    >
                        <option value="">-- Pilih Dosen --</option>
                        {lecturers.map(lecturer => (
                            <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
                        ))}
                    </select>
                    {loading && <p className="text-xs text-gray-500 mt-2 animate-pulse">Memuat data dosen...</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                        disabled={isSubmitting || !supervisorId}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Menyimpan...
                            </>
                        ) : 'Plot Dosen'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PlottingModal;
