import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addStudent } from "../../../store/slice/studentSlice";
import { toast } from "react-toastify";
import Modal from "../../../components/Modal";

const AddStudent = ({ show, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    nim: "", name: "", email: "", phone: "", major: "", batch_year: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await dispatch(addStudent(formData)).unwrap();
      toast.success("Mahasiswa berhasil ditambahkan");
      setFormData({ nim: "", name: "", email: "", phone: "", major: "", batch_year: "" });
      onClose();
    } catch (error) {
      toast.error("Gagal menambahkan mahasiswa: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={show} onClose={onClose} title="Tambah Mahasiswa Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                required={input.name !== 'phone'}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons langsung di dalam Form */}
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
            {isLoading ? "Menyimpan..." : "Simpan Mahasiswa"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStudent;