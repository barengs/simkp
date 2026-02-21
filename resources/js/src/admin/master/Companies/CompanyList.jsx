import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { Plus, Edit2, Trash2, Search, Building2, User, Phone, MapPin, CheckCircle, XCircle } from "lucide-react";
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

    if (loading && companies.length === 0) {
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
                        <Building2 className="mr-3 text-indigo-600" />
                        Master Mitra (Instansi)
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola data mitra kerja praktek untuk periode aktif.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition group"
                >
                    <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Tambah Mitra
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Cari nama mitra atau contact person..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredCompanies}
                    pagination
                    highlightOnHover
                    responsive
                    noDataComponent={
                        <div className="p-10 text-center text-gray-500">
                            Tidak ada data mitra ditemukan untuk periode ini.
                        </div>
                    }
                    customStyles={customStyles}
                />
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
        </div>
    );
};

export default CompanyList;
