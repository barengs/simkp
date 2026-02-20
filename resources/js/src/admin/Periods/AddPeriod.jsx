import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addPeriod } from "../../store/slice/periodSlice";
import { toast } from "react-toastify";
import Modal from "../../components/Modal";


const AddPeriod = ({ show, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        academic_year: "",
        semester: "ganjil",
        theme_name: "",
        start_date: "",
        end_date: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await dispatch(addPeriod(formData)).unwrap();
            toast.success("Periode berhasil ditambahkan");
            setFormData({
                academic_year: "",
                semester: "ganjil",
                theme_name: "",
                start_date: "",
                end_date: "",
            });
            onClose();
        } catch (error) {
            toast.error("Gagal menambahkan periode: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={show} onClose={onClose} title="Tambah Periode Baru">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Tahun Akademik
                        </label>
                        <input
                            type="text"
                            name="academic_year"
                            value={formData.academic_year}
                            onChange={handleChange}
                            placeholder="Contoh: 2024/2025"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            required
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Semester
                        </label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            required
                        >
                            <option value="ganjil">Ganjil</option>
                            <option value="genap">Genap</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Nama Tema (Opsional)
                        </label>
                        <input
                            type="text"
                            name="theme_name"
                            value={formData.theme_name}
                            onChange={handleChange}
                            placeholder="Nama Tema KP"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Tanggal Mulai
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            required
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Tanggal Selesai
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            required
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-md transition"
                    >
                        {isLoading ? "Menyimpan..." : "Simpan Periode"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddPeriod;
