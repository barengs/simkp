import React from 'react';
import { CheckCircle } from 'lucide-react';

const ShowLogbook = ({ logbook, onClose, onApprove }) => {
    if (!logbook) return null;

    return (
        <div className="space-y-4">
            <div className="border-b pb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Informasi Kelompok</h4>
                <p className="text-gray-900 mt-1 font-medium text-sm">Ketua: {logbook.internship?.leader?.name || '-'}</p>
                <p className="text-gray-900 text-sm">Mitra: {logbook.internship?.company?.name || logbook.internship?.company_name_manual || '-'}</p>
            </div>
            <div className="border-b pb-3 flex justify-between">
                <div>
                   <h4 className="text-xs font-semibold text-gray-500 uppercase">Tanggal</h4>
                   <p className="text-gray-900 mt-1">{logbook.date}</p>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase text-right">Status</h4>
                    <p className="mt-1 text-right">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${
                            logbook.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {logbook.status === 'approved' ? 'Disetujui' : 'Menunggu Validasi'}
                        </span>
                    </p>
                </div>
            </div>
            <div className="border-b pb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Aktivitas Mingguan</h4>
                <div className="p-3 bg-gray-50 rounded-md mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {logbook.activity}
                </div>
            </div>
            {logbook.evidence_photo && (
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Bukti Kegiatan</h4>
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex justify-center">
                        <img 
                            src={logbook.evidence_photo} 
                            alt="Bukti kegiatan" 
                            className="max-h-64 object-contain cursor-pointer" 
                            onClick={() => window.open(logbook.evidence_photo, '_blank')}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 italic">* Klik gambar untuk memperbesar</p>
                </div>
            )}
            
            <div className="pt-4 flex justify-between items-center gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                    Tutup
                </button>
                {logbook.status !== 'approved' && (
                    <button
                        onClick={onApprove}
                        className="flex-1 py-2 bg-green-600 text-white font-medium rounded-md flex justify-center items-center space-x-2 hover:bg-green-700 transition"
                    >
                        <CheckCircle size={18} />
                        <span>Setujui Logbook</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ShowLogbook;
