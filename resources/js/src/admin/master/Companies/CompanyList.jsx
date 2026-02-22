import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { CirclePlus, Edit2, Trash2, Search, Building2, User, Phone, MapPin, CheckCircle, XCircle } from "lucide-react";
import { fetchCompanies, deleteCompany, toggleCompanyVerified } from "../../../store/slice/companySlice";
import Skeleton from "../../../components/Skeleton";
import AddCompany from "./AddCompany";
import EditCompany from "./EditCompany";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import { toast } from "react-toastify";

const CompanyList = () => {
    const dispatch = useDispatch();
    const { data: companies, loading } = useSelector((state) => state.companies);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (companies.length === 0) {
            dispatch(fetchCompanies());
        }
    }, [dispatch, companies.length]);

    const handleDelete = (company) => {
        setCompanyToDelete(company);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (companyToDelete) {
            try {
                setIsDeleting(true);
                await dispatch(deleteCompany(companyToDelete.id)).unwrap();
                toast.success("Mitra berhasil dihapus");
                setShowDeleteModal(false);
            } catch (error) {
                toast.error("Gagal menghapus mitra: " + error);
            } finally {
                setIsDeleting(false);
                setCompanyToDelete(null);
            }
        }
    };

    const handleToggleVerified = (id) => {
        dispatch(toggleCompanyVerified(id)).then(() => {
            toast.success("Status verifikasi mitra diperbarui");
        });
    };

    const handleEdit = (company) => {
        setSelectedCompany(company);
        setShowEditModal(true);
    };

    const filteredCompanies = companies.filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            name: "Nama Mitra",
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => (
                <div className="flex flex-col py-3">
                    <span className="font-bold text-gray-900 leading-tight">{row.name}</span>
                    <span className="text-xs text-gray-500 mt-1 flex items-center">
                        <MapPin size={10} className="mr-1" /> {row.address.substring(0, 40)}{row.address.length > 40 ? "..." : ""}
                    </span>
                </div>
            ),
            grow: 2,
        },
        {
            name: "Kontak",
            cell: (row) => (
                <div className="flex flex-col gap-1 py-1">
                    <span className="text-xs text-gray-600 flex items-center">
                        <User size={12} className="mr-1.5 text-gray-400" /> {row.contact_person}
                    </span>
                    <span className="text-xs text-gray-600 flex items-center">
                        <Phone size={12} className="mr-1.5 text-gray-400" /> {row.phone}
                    </span>
                </div>
            ),
        },
        {
            name: "Status",
            selector: (row) => row.is_verified,
            sortable: true,
            cell: (row) => (
                <button
                    onClick={() => handleToggleVerified(row.id)}
                    className="transition transform active:scale-95"
                    title="Klik untuk mengubah status verifikasi"
                >
                    {row.is_verified ? (
                        <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle size={12} className="mr-1" /> Terverifikasi
                        </span>
                    ) : (
                        <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <XCircle size={12} className="mr-1" /> Belum Verif
                        </span>
                    )}
                </button>
            ),
        },
        {
            name: "Aksi",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Mitra"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Mitra"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
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
                        Master Mitra (Instansi)
                    </h2>
                </div>

                <div className="flex justify-between items-center">
                    <div className="w-1/3">
                        <input
                            type="text"
                            placeholder="Cari nama mitra atau contact person..."
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
                            Tambah Mitra
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <DataTable
                            columns={columns}
                            data={filteredCompanies}
                            pagination
                            highlightOnHover
                            responsive
                            progressPending={loading}
                            progressComponent={<Skeleton />}
                            noDataComponent={
                                <div className="p-10 text-center text-gray-500">
                                    Tidak ada data mitra ditemukan untuk periode ini.
                                </div>
                            }
                            customStyles={customStyles}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddCompany show={showAddModal} onClose={() => setShowAddModal(false)} />
            <EditCompany
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                company={selectedCompany}
            />

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                message={`Apakah Anda yakin ingin menghapus mitra "${companyToDelete?.name}"?`}
            />
        </>
    );
};

export default CompanyList;
