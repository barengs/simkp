import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { Plus, Edit2, Trash2, Search, Users, Key, Mail, Phone, Award } from "lucide-react";
import { fetchLecturers, deleteLecturer, resetLecturerPassword } from "../../../store/slice/lecturerSlice";
import Skeleton from "../../../components/Skeleton";
import AddLecturer from "./AddLecturer";
import EditLecturer from "./EditLecturer";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import { toast } from "react-toastify";

const LecturerList = () => {
    const dispatch = useDispatch();
    const { data: lecturers, loading } = useSelector((state) => state.lecturers);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLecturer, setSelectedLecturer] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lecturerToDelete, setLecturerToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (lecturers.length === 0) {
            dispatch(fetchLecturers());
        }
    }, [dispatch, lecturers.length]);

    const handleDelete = (lecturer) => {
        setLecturerToDelete(lecturer);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (lecturerToDelete) {
            try {
                setIsDeleting(true);
                await dispatch(deleteLecturer(lecturerToDelete.id)).unwrap();
                toast.success("Dosen berhasil dihapus");
                setShowDeleteModal(false);
            } catch (error) {
                toast.error("Gagal menghapus dosen: " + error);
            } finally {
                setIsDeleting(false);
                setLecturerToDelete(null);
            }
        }
    };

    const handleResetPassword = (id) => {
        if (window.confirm("Apakah Anda yakin ingin mereset password dosen ini menjadi 'dosen123'?")) {
            dispatch(resetLecturerPassword(id)).then(() => {
                toast.success("Password dosen berhasil direset");
            }).catch((err) => {
                toast.error("Gagal mereset password: " + err);
            });
        }
    };

    const handleEdit = (lecturer) => {
        setSelectedLecturer(lecturer);
        setShowEditModal(true);
    };

    const filteredLecturers = lecturers.filter((lecturer) =>
        lecturer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.nip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            name: "Dosen",
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => (
                <div className="flex flex-col py-3">
                    <span className="font-bold text-gray-900 leading-tight">{row.name}</span>
                    <span className="text-xs text-gray-500 mt-1 flex items-center">
                        <Award size={10} className="mr-1" /> {row.nip}
                    </span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: "Kontak",
            cell: (row) => (
                <div className="flex flex-col gap-1 py-1">
                    <span className="text-xs text-gray-600 flex items-center">
                        <Mail size={12} className="mr-1.5 text-gray-400" /> {row.email}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center">
                        <Phone size={12} className="mr-1.5 text-gray-400" /> {row.phone}
                    </span>
                </div>
            ),
            grow: 1.5,
        },
        {
            name: "Aksi",
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleResetPassword(row.id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                        title="Reset Password"
                    >
                        <Key size={16} />
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Dosen"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Dosen"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "150px",
        },
    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f9fafb',
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderTopColor: '#e5e7eb',
            },
        },
        headCells: {
            style: {
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6b7280',
                letterSpacing: '0.05em',
            },
        },
        cells: {
            style: {
                fontSize: '0.875rem',
            },
        },
    };

    if (loading && lecturers.length === 0) {
        return (
            <div className="p-6">
                <Skeleton count={5} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Users className="mr-3 text-indigo-600" />
                        Master Dosen
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola data dosen pengampu dan pembimbing periode aktif.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition group"
                >
                    <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Tambah Dosen
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Cari nama, NIP, atau email..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredLecturers}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent={
                        <div className="p-10 text-center text-gray-500 font-medium">
                            Tidak ada data dosen yang ditemukan untuk periode ini.
                        </div>
                    }
                    customStyles={customStyles}
                />
            </div>

            {/* Modals */}
            <AddLecturer show={showAddModal} onClose={() => setShowAddModal(false)} />
            <EditLecturer 
                show={showEditModal} 
                onClose={() => setShowEditModal(false)} 
                lecturer={selectedLecturer} 
            />

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                message={`Apakah Anda yakin ingin menghapus dosen "${lecturerToDelete?.name}"?`}
            />
        </div>
    );
};

export default LecturerList;
