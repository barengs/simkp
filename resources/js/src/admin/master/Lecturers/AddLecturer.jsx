import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createLecturer } from "../../../store/slice/lecturerSlice";
import { toast } from "react-toastify";
import Modal from "../../../components/Modal";

const AddLecturer = ({ show, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        nip: "",
        name: "",
        email: "",
        phone: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await dispatch(createLecturer(formData)).unwrap();
            toast.success("Dosen berhasil ditambahkan");
            setFormData({
                nip: "",
                name: "",
                email: "",
                phone: "",
            });
            onClose();
        } catch (error) {
            toast.error("Gagal menambahkan dosen: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={show} onClose={onClose} title="Tambah Dosen Baru">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            NIP
                        </label>
                        <input
                            type="text"
                            name="nip"
                            value={formData.nip}
                            onChange={handleChange}
                            placeholder="Nomor Induk Pegawai"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nama Beserta Gelar"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="alamat@email.com"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            No. Telepon
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="081xxx"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            required
                        />
                    </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 italic">
                    Catatan: Password dosen secara default adalah <strong>dosen123</strong>
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
                        {isLoading ? "Menyimpan..." : "Simpan Dosen"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddLecturer;
