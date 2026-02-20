import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateStudent, resetStudentPassword } from "../../../store/slice/studentSlice";
import { toast } from "react-toastify";
import Modal from "../../../components/Modal";
import { KeyRound } from "lucide-react";

const EditStudent = ({ show, onClose, student }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        nim: "", name: "", email: "", phone: "", major: "", batch_year: "",
    });

    useEffect(() => {
        if (student) {
            setFormData({
                nim: student.nim || "",
                name: student.name || "",
                email: student.email || "",
                phone: student.phone || "",
                major: student.major || "",
                batch_year: student.batch_year || "",
            });
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await dispatch(updateStudent({ id: student.id, data: formData })).unwrap();
            toast.success("Data mahasiswa berhasil diperbarui");
            onClose();
        } catch (error) {
            toast.error("Gagal memperbarui data: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!window.confirm("Apakah Anda yakin ingin mereset password mahasiswa ini menjadi 'mhs123'?")) {
            return;
        }
        try {
            setIsResetting(true);
            await dispatch(resetStudentPassword(student.id)).unwrap();
            toast.success("Password berhasil direset menjadi 'mhs123'");
        } catch (error) {
            toast.error("Gagal mereset password: " + error);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <Modal isOpen={show} onClose={onClose} title="Edit Data Mahasiswa">
            <form id="edit-student-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: "NIM", name: "nim", type: "text", placeholder: "NIM Mahasiswa" },
                        { label: "Nama", name: "name", type: "text", placeholder: "Nama Lengkap" },
                        { label: "Email", name: "email", type: "email", placeholder: "email@univ.ac.id" },
                        { label: "Jurusan", name: "major", type: "text", placeholder: "Jurusan" },
                        { label: "Angkatan", name: "batch_year", type: "text", placeholder: "2023" },
                        { label: "Telepon", name: "phone", type: "text", placeholder: "0812..." },
                    ].map((input) => (
                        <div key={input.name}>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                {input.label}
                            </label>
                            <input
                                {...input}
                                value={formData[input.name]}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                required={input.name !== 'phone'}
                            />
                        </div>
                    ))}
                </div>

                {/* Reset Password Section */}
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">Reset Password</p>
                        <p className="text-xs text-amber-600">Password akan direset menjadi 'mhs123'</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={isResetting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
                    >
                        <KeyRound className="w-3.5 h-3.5" />
                        {isResetting ? "Mereset..." : "Reset Password"}
                    </button>
                </div>

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
                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>

        </Modal>
    );
};

export default EditStudent;
