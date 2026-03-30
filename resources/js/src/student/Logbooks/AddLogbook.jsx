import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLogbook } from '../../store/slice/logbookSlice';
import { toast } from 'react-toastify';

const AddLogbook = ({ onClose }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.logbooks || state.logbook || { loading: false }); // ensure safe fallback
    const { data: internships } = useSelector((state) => state.internships || { data: [] });

    // Try to derive internship_id from the student's active internship
    // We assume the student has an approved internship loaded in state.
    const activeInternship = (internships && Array.isArray(internships)) ? internships[0] : (internships?.id ? internships : null);

    const [formData, setFormData] = useState({
        internship_id: activeInternship ? activeInternship.id : '',
        date: '',
        activity: '',
        evidence_photo: null,
    });

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
        
        if (!formData.internship_id) {
            toast.error('Gagal menemukan data KP. Pastikan Anda sudah terdaftar KP.');
            return;
        }

        const data = new FormData();
        data.append('internship_id', formData.internship_id);
        data.append('date', formData.date);
        data.append('activity', formData.activity);
        if (formData.evidence_photo) {
            data.append('evidence_photo', formData.evidence_photo);
        }

        const action = await dispatch(addLogbook(data));
        if (addLogbook.fulfilled.match(action)) {
            toast.success('Logbook mingguan berhasil ditambahkan!');
            onClose();
        } else {
            toast.error(action.payload || 'Terjadi kesalahan saat menyimpan data');
        }
    };

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
                    placeholder="Deskripsikan pekerjaan yang dilakukan..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Foto Bukti (Opsional)</label>
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
                    {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
};

export default AddLogbook;
