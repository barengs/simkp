import React, { useState, useEffect, lazy, Suspense } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents, deleteStudent } from "../../../store/slice/studentSlice";
import Skeleton from "../../../components/Skeleton";
import { toast } from "react-toastify";
import { Pencil, Trash2, CirclePlus } from "lucide-react";

// Lazy load modals
const AddStudent = lazy(() => import("./AddStudent"));
const EditStudent = lazy(() => import("./EditStudent"));
const ConfirmDeleteModal = lazy(() => import("../../../components/ConfirmDeleteModal"));

const StudentList = () => {
    const dispatch = useDispatch();
    const { data: students, loading, error } = useSelector((state) => state.students);

    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (students.length === 0) {
            dispatch(fetchStudents());
        }
    }, [dispatch, students.length]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            setIsLoading(true);
            dispatch(deleteStudent(deleteId))
                .unwrap()
                .then(() => {
                    toast.success("Data mahasiswa berhasil dihapus");
                    setShowDeleteModal(false);
                    setDeleteId(null);
                })
                .catch((err) => {
                    toast.error("Gagal menghapus data: " + err);
                    setShowDeleteModal(false); // Optional: close modal on error too?
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setShowEditModal(true);
    };

    const columns = [
        { name: "NIM", selector: (row) => row.nim, sortable: true },
        { name: "Nama", selector: (row) => row.name, sortable: true },
        { name: "Email", selector: (row) => row.email, sortable: true },
        { name: "Jurusan", selector: (row) => row.major, sortable: true },
        { name: "Angkatan", selector: (row) => row.batch_year, sortable: true },
        { name: "Telepon", selector: (row) => row.phone, sortable: true },
        {
            name: "Aksi",
            cell: (row) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const filteredData = students.filter((item) =>
        ["nim", "name", "email", "major"].some(
            (field) =>
                item[field] &&
                item[field].toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <>
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Data Mahasiswa
                    </h2>
                </div>

                <div className="flex justify-between items-center">
                    <div className="w-1/3">
                        <input
                            type="text"
                            placeholder="Cari mahasiswa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex space-x-3">
                        {/* Placeholder for Import Excel if needed in future */}
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
                            Import Excel
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                        >
                            <CirclePlus />
                            Tambah Mahasiswa
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            pointerOnHover
                            responsive
                            progressPending={loading}
                            progressComponent={<Skeleton />}
                        />
                    </div>
                </div>
            </div>

            <Suspense fallback={null}>
                <AddStudent
                    show={showAddModal}
                    onClose={() => setShowAddModal(false)}
                />

                <EditStudent
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    student={selectedStudent}
                />

                <ConfirmDeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    isLoading={isLoading}
                    message={`Anda akan menghapus data mahasiswa ini. Tindakan ini tidak dapat dibatalkan.`}
                />
            </Suspense>
        </>
    );
};

export default StudentList;
