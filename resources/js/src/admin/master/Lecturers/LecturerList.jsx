import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { CirclePlus, Edit2, Trash2, Search, Users, Key, Mail, Phone, Award } from "lucide-react";
import { fetchLecturers, deleteLecturer, resetLecturerPassword } from "../../../store/slice/lecturerSlice";
import Skeleton from "../../../components/Skeleton";
import AddLecturer from "./AddLecturer";
import EditLecturer from "./EditLecturer";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import ConfirmActionModal from "../../../components/ConfirmActionModal";
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

    const [showResetModal, setShowResetModal] = useState(false);
    const [lecturerToReset, setLecturerToReset] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

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

    const handleResetPasswordClick = (lecturer) => {
        setLecturerToReset(lecturer);
        setShowResetModal(true);
    };

    const confirmResetPassword = async () => {
        if (lecturerToReset) {
            setIsResetting(true);
            try {
                await dispatch(resetLecturerPassword(lecturerToReset.id)).unwrap();
                toast.success("Password dosen berhasil direset");
                setShowResetModal(false);
            } catch (err) {
                toast.error("Gagal mereset password: " + err);
            } finally {
                setIsResetting(false);
                setLecturerToReset(null);
            }
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
                        onClick={() => handleResetPasswordClick(row)}
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

    return (
        <>
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Master Dosen
                    </h2>
                </div>

                <div className="flex justify-between items-center">
                    <div className="w-1/3">
                        <input
                            type="text"
                            placeholder="Cari nama, NIP, atau email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                        >
                            <CirclePlus />
                            Tambah Dosen
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={filteredLecturers}
                            pagination
                            highlightOnHover
                            responsive
                            progressPending={loading}
                            progressComponent={<Skeleton />}
                            noDataComponent={
                                <div className="p-10 text-center text-gray-500 font-medium">
                                    Tidak ada data dosen yang ditemukan untuk periode ini.
                                </div>
                            }
                            customStyles={customStyles}
                        />
                    </div>
                </div>
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

            <ConfirmActionModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                onConfirm={confirmResetPassword}
                isLoading={isResetting}
                title="Reset Password Dosen"
                message={`Apakah Anda yakin ingin mereset password dosen ${lecturerToReset?.name} menjadi 'dosen123'?`}
                confirmText="Ya, Reset Password"
                confirmColorClass="bg-orange-600 hover:bg-orange-700 text-white"
            />
        </>
    );
};

export default LecturerList;
