import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateLogbook } from '../../store/slice/logbookSlice';
import { toast } from 'react-toastify';

const EditLogbook = ({ logbook, onClose }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.logbooks || state.logbook || { loading: false });

    const [formData, setFormData] = useState({
        date: '',
        activity: '',
        evidence_photo: null,
    });

    useEffect(() => {
        if (logbook) {
            setFormData({
                date: logbook.date || '',
                activity: logbook.activity || '',
                evidence_photo: null,
            });
        }
    }, [logbook]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'evidence_photo') {
            setFormData({ ...formData, evidence_photo: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('date', formData.date);
        data.append('activity', formData.activity);
        data.append('internship_id', logbook.internship_id);
        if (formData.evidence_photo) {
            data.append('evidence_photo', formData.evidence_photo);
        }

        const action = await dispatch(updateLogbook({ id: logbook.id, formData: data }));
        if (updateLogbook.fulfilled.match(action)) {
            toast.success('Logbook mingguan berhasil diperbarui!');
            onClose();
        } else {
            toast.error(action.payload || 'Terjadi kesalahan saat menyimpan data');
        }
    };

    if (logbook?.status === 'approved') {
        return (
            <div className="text-center p-4">
                <p className="text-red-500 text-sm">Logbook yang sudah disetujui tidak dapat diedit.</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded text-sm">Tutup</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Kegiatan</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Aktivitas Mingguan</label>
                <textarea
                    name="activity"
                    value={formData.activity}
                    onChange={handleChange}
                    rows="4"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Perbarui Foto (Opsional)</label>
                {logbook?.evidence_photo && !formData.evidence_photo && (
                    <div className="mb-2 text-sm text-gray-500">
                        <a href={logbook.evidence_photo} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Lihat Foto Saat Ini</a>
                    </div>
                )}
                <input
                    type="file"
                    name="evidence_photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
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
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
    );
};

export default EditLogbook;
