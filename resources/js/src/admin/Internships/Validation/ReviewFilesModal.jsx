import React from 'react';
import Modal from '../../../components/Modal';
import { FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

const ReviewFilesModal = ({ isOpen, onClose, internship }) => {
    if (!internship) return null;

    const renderFileLink = (label, url, type = 'pdf') => {
        if (!url) return (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        {type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">{label}</p>
                        <p className="text-xs text-gray-400">Tidak ada file</p>
                    </div>
                </div>
            </div>
        );

        const storageUrl = `${(import.meta.env.VITE_API_URL || '').replace('/api', '')}/storage/${url}`;

        return (
            <a href={storageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white hover:bg-indigo-50 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all group">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        {type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">{label}</p>
                        <p className="text-xs text-gray-500">Klik untuk melihat file</p>
                    </div>
                </div>
                <ExternalLink size={18} className="text-gray-400 group-hover:text-indigo-600" />
            </a>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Review Berkas Pendaftaran">
            <div className="space-y-6">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="text-sm font-bold text-indigo-900 mb-1">Ketua Kelompok</h4>
                    <p className="text-sm text-indigo-700">{internship.leader?.name} ({internship.leader?.nim})</p>
                    <p className="text-xs text-indigo-500 mt-1">Mengajukan KP di: <span className="font-semibold">{internship.company?.name || internship.company_name_manual}</span></p>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Daftar Berkas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {renderFileLink('Proposal / Balasan', internship.proposal_url)}
                        {renderFileLink('Surat KRS', internship.krs_url)}
                        {renderFileLink('KTP', internship.ktp_url, 'image')}
                        {renderFileLink('Surat Rekomendasi', internship.surat_rekomendasi_url)}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReviewFilesModal;
