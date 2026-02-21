import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateCompany } from "../../../store/slice/companySlice";
import { toast } from "react-toastify";
import Modal from "../../../components/Modal";

const EditCompany = ({ show, onClose, company }) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        contact_person: "",
        phone: "",
        is_verified: false,
    });

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || "",
                address: company.address || "",
                contact_person: company.contact_person || "",
                phone: company.phone || "",
                is_verified: !!company.is_verified,
            });
        }
    }, [company]);

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
            await dispatch(updateCompany({ id: company.id, data: formData })).unwrap();
            toast.success("Data mitra berhasil diperbarui");
            onClose();
        } catch (error) {
            toast.error("Gagal memperbarui mitra: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={show} onClose={onClose} title="Edit Data Mitra">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Nama Perusahaan/Instansi
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
                        Alamat
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm resize-none"
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Contact Person
                        </label>
                        <input
                            type="text"
                            name="contact_person"
                            value={formData.contact_person}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            No. Telepon/WA
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
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

export default EditCompany;
