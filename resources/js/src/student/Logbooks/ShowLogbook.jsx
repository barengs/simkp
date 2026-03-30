import React from 'react';

const ShowLogbook = ({ logbook, onClose }) => {
    if (!logbook) return null;

    return (
        <div className="space-y-4">
            <div className="border-b pb-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase">Tanggal</h4>
                <p className="text-gray-900 mt-1">{logbook.date}</p>
            </div>
            <div className="border-b pb-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase">Aktivitas Mingguan</h4>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">{logbook.activity}</p>
            </div>
            <div className="border-b pb-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase">Status</h4>
                <p className="mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        logbook.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {logbook.status === 'approved' ? 'Disetujui' : 'Menunggu Validasi'}
                    </span>
                </p>
            </div>
            {logbook.evidence_photo && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bukti Kegiatan</h4>
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                        <img 
                            src={logbook.evidence_photo} 
                            alt="Bukti kegiatan" 
                            className="w-full h-auto object-cover max-h-64 cursor-pointer" 
                            onClick={() => window.open(logbook.evidence_photo, '_blank')}
                        />
                    </div>
                </div>
            )}
            
            <div className="pt-4 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
};

export default ShowLogbook;
