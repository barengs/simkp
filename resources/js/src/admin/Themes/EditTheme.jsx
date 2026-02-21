import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTheme } from "../../store/slice/themeSlice";
import { toast } from "react-toastify";
import Modal from "../../components/Modal";

const EditTheme = ({ show, onClose, theme }) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: "",
        year: "",
        is_active: true,
    });

    useEffect(() => {
        if (theme) {
            setFormData({
                name: theme.name || "",
                year: theme.year || "",
                is_active: !!theme.is_active,
            });
        }
    }, [theme]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await dispatch(updateTheme({ id: theme.id, data: formData })).unwrap();
            toast.success("Tema berhasil diperbarui");
            onClose();
        } catch (error) {
            toast.error("Gagal memperbarui tema: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={show} onClose={onClose} title="Edit Tema">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Nama Tema
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Tahun
                    </label>
                    <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                        required
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="is_active"
                        id="is_active_edit"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition"
                    />
                    <label htmlFor="is_active_edit" className="ml-2 block text-sm text-gray-700">
                        Setel sebagai aktif
                    </label>
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
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
                    >
                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditTheme;
