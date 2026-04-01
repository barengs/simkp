import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addReport } from '../../store/slice/reportSlice';
import { toast } from 'react-toastify';

const AddReport = ({ onClose, type = 'draft' }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.reports || { loading: false });
    const { data: internships } = useSelector((state) => state.internships || { data: [] });

    // Try to derive internship_id from the student's active internship
    const activeInternship = (internships && Array.isArray(internships)) ? internships[0] : (internships?.id ? internships : null);

    const [formData, setFormData] = useState({
        internship_id: activeInternship ? activeInternship.id : '',
        type: type,
        file_url: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file_url') {
            setFormData({ ...formData, file_url: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.internship_id) {
            toast.error('Gagal menemukan data KP. Pastikan Anda sudah terdaftar KP.');
            return;
        }

        if (!formData.file_url) {
            toast.error('File laporan harus diunggah.');
            return;
        }

        const data = new FormData();
        data.append('internship_id', formData.internship_id);
        data.append('type', formData.type);
        data.append('file_url', formData.file_url);

        const action = await dispatch(addReport(data));
        if (addReport.fulfilled.match(action)) {
            toast.success('Laporan berhasil diunggah!');
            onClose();
        } else {
            toast.error(action.payload || 'Terjadi kesalahan saat mengunggah laporan');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4 text-center">
                <span className="text-sm font-semibold text-indigo-700 uppercase tracking-widest">
                    Uploading {type === 'final' ? 'Laporan Final' : 'Draft Laporan'}
                </span>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Dokumen Laporan</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md hover:border-indigo-400 transition-colors bg-gray-50">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>Tarik atau Pilih File</span>
                                <input id="file-upload" name="file_url" type="file" className="sr-only" onChange={handleChange} accept=".pdf,.doc,.docx" required />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX hingga 5MB</p>
                    </div>
                </div>
                {formData.file_url && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                        File Terpilih: {formData.file_url.name}
                    </div>
                )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading || !formData.file_url}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                    {loading ? 'Mengunggah...' : 'Unggah Laporan'}
                </button>
            </div>
        </form>
    );
};

export default AddReport;
