import React, { useMemo, useState, useEffect } from 'react';
import {
    useGetLecturersQuery,
    useCreateLecturerMutation,
    useUpdateLecturerMutation,
    useDeleteLecturerMutation,
} from '../api/masterDataApi';

import {
    handleApiError,
    handleApiSuccess,
} from '../../shared/api/errorHandler';

import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';

import {
    Users,
    Plus,
    Search,
    Pencil,
    Trash2,
    Mail,
    Phone,
    UserRound,
    GraduationCap,
    IdCard,
    Hash,
    X,
} from 'lucide-react';

const MasterDosen = () => {
    // ============================================================
    // STATE
    // ============================================================

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const [form, setForm] = useState({
        nip: '',
        name: '',
        email: '',
        phone_number: '',
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // ============================================================
    // API
    // ============================================================

    const {
        data: lecturerList,
        isLoading,
    } = useGetLecturersQuery({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search: debouncedSearch,
    });

    const [createLecturer] = useCreateLecturerMutation();
    const [updateLecturer] = useUpdateLecturerMutation();
    const [deleteLecturer] = useDeleteLecturerMutation();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);


    // ============================================================
    // HELPERS
    // ============================================================

    const getInitials = (name = '') => {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase() || 'D';
    };


    // ============================================================
    // FORM
    // ============================================================

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };


    const resetForm = () => {
        setForm({
            nip: '',
            name: '',
            email: '',
            phone_number: '',
        });

        setErrors({});
    };


    const openCreate = () => {
        setEditing(null);
        resetForm();
        setShowModal(true);
    };


    const openEdit = (lecturer) => {
        setEditing(lecturer);

        setForm({
            nip: lecturer.nip || '',
            name: lecturer.user?.name || '',
            email: lecturer.user?.email || '',
            phone_number: lecturer.user?.phone_number || '',
        });

        setErrors({});
        setShowModal(true);
    };


    const closeModal = () => {
        if (submitting) return;

        setShowModal(false);
        setEditing(null);
        resetForm();
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);

        try {
            if (editing) {
                await updateLecturer({
                    id: editing.id,
                    nip: form.nip,
                    name: form.name,
                    email: form.email,
                    phone_number: form.phone_number,
                }).unwrap();

                handleApiSuccess(
                    'Data dosen berhasil diperbarui'
                );
            } else {
                await createLecturer({
                    nip: form.nip,
                    name: form.name,
                    email: form.email,
                    phone_number: form.phone_number,
                }).unwrap();

                handleApiSuccess(
                    'Data dosen berhasil ditambahkan'
                );
            }

            closeModal();

        } catch (err) {
            handleApiError(
                err,
                'Gagal menyimpan data dosen'
            );
        } finally {
            setSubmitting(false);
        }
    };


    // ============================================================
    // DELETE
    // ============================================================

    const handleDelete = async () => {
        if (!deleting) return;

        try {
            await deleteLecturer(deleting.id).unwrap();

            handleApiSuccess(
                'Data dosen berhasil dihapus'
            );

            setDeleting(null);

        } catch (err) {
            handleApiError(
                err,
                'Gagal menghapus data dosen'
            );
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRows.length) return;

        try {
            await Promise.all(
                selectedRows.map(row => deleteLecturer(row.id).unwrap())
            );

            handleApiSuccess(
                `${selectedRows.length} data dosen berhasil dihapus`
            );

            setSelectedRows([]);

        } catch (err) {
            handleApiError(
                err,
                'Gagal menghapus data dosen'
            );
        }
    };


    // ============================================================
    // FILTER
    // ============================================================

    const filteredData = useMemo(() => {
        return lecturerList?.data || [];
    }, [lecturerList]);


    // ============================================================
    // TABLE
    // ============================================================

    const columns = [
        {
            name: 'Dosen',
            sortable: true,
            sortField: 'name',
            width: '450px',
            cell: row => {
                const name = row.user?.name || '-';
                const initials = getInitials(name);
                const profilePictureUrl = row.user?.profile_picture_url
                    ? (row.user.profile_picture_url.startsWith('http')
                        ? row.user.profile_picture_url
                        : `${window.location.origin}${row.user.profile_picture_url}`)
                    : null;

                return (
                    <div className="flex items-center gap-3 py-2">
                        <div className="
                            flex h-10 w-10
                            shrink-0 items-center justify-center
                            rounded-full
                            bg-emerald-100
                            text-sm font-bold
                            text-emerald-700
                            overflow-hidden
                        ">
                            {profilePictureUrl ? (
                                <img
                                    src={profilePictureUrl}
                                    alt={name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                initials
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="
                                truncate
                                text-sm font-semibold
                                text-gray-900
                            ">
                                {name}
                            </p>

                            <div className="
                                mt-0.5
                                flex items-center gap-1.5
                                text-xs text-gray-500
                            ">
                                <Mail className="h-3.5 w-3.5" />

                                <span className="truncate">
                                    {row.user?.email || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            },
        },

        {
            name: 'NIP',
            selector: row => row.nip || '-',
            sortable: true,
            sortField: 'nip',
            width: '270px',
            cell: row => (
                <div>
                    <p className="
                        text-sm font-medium
                        text-gray-800
                    ">
                        {row.nip || '-'}
                    </p>

                    <p className="
                        mt-0.5
                        text-[11px]
                        uppercase tracking-wide
                        text-gray-400
                    ">
                        NIP
                    </p>
                </div>
            ),
        },

        {
            name: 'Kontak',
            width: '230px',
            cell: row => (
                <div className="space-y-1">
                    {row.user?.phone_number ? (
                        <div className="
                            flex items-center gap-1.5
                            text-xs text-gray-600
                        ">
                            <Phone className="h-3.5 w-3.5" />
                            {row.user.phone_number}
                        </div>
                    ) : (
                        <span className="
                            text-xs text-gray-400
                        ">
                            Tidak tersedia
                        </span>
                    )}
                </div>
            ),
        },

        {
            name: 'Aksi',
            width: '200px',
            cell: row => (
                <div className="
                    flex items-center
                    justify-center gap-2
                ">
                    <Button
                        size="sm"
                        variant="warning"
                        icon={Pencil}
                        onClick={() => openEdit(row)}
                    >
                        Edit
                    </Button>

                    <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setDeleting(row)}
                    >
                        Hapus
                    </Button>
                </div>
            ),

            ignoreRowClick: true,
        },
    ];


    // ============================================================
    // LOADING
    // ============================================================

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-20" />
                <Skeleton className="h-[500px]" />
            </div>
        );
    }


    // ============================================================
    // TOTAL
    // ============================================================

    const totalLecturers = lecturerList?.meta?.total || 0;


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="space-y-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <PageHeader
                title="Master Dosen"
                description="Kelola data dosen pembimbing dan penguji"
                icon={Users}
                actions={
                    <Button
                        onClick={openCreate}
                        icon={Plus}
                    >
                        Tambah Dosen
                    </Button>
                }
            />


            {/* ==================================================
                BULK ACTION BAR
            ================================================== */}

            {selectedRows.length > 0 && (
                <div className="
                    flex flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                    px-5
                    py-3
                    bg-emerald-50
                    border
                    border-emerald-200
                    rounded-xl
                ">
                    <div className="flex items-center gap-3">
                        <span className="
                            text-sm
                            font-medium
                            text-emerald-900
                        ">
                            {selectedRows.length} dosen dipilih
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            icon={X}
                            size="sm"
                            onClick={() => setSelectedRows([])}
                        >
                            Batal Pilih
                        </Button>

                        <Button
                            variant="danger"
                            icon={Trash2}
                            size="sm"
                            onClick={() => setShowBulkDeleteConfirm(true)}
                        >
                            Hapus {selectedRows.length} Dosen
                        </Button>
                    </div>
                </div>
            )}


            {/* ==================================================
                DATA TABLE
            ================================================== */}

            <Card>

                {/* Toolbar */}

                <div className="
                    flex flex-col
                    gap-4
                    border-b border-gray-100
                    p-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">

                    <div>
                        <h3 className="
                            text-base font-semibold
                            text-gray-900
                        ">
                            Daftar Dosen
                        </h3>

                        <p className="
                            mt-1
                            text-xs text-gray-500
                        ">
                            {searchTerm
                                ? `${totalLecturers} hasil ditemukan`
                                : `${totalLecturers} dosen terdaftar`
                            }
                        </p>
                    </div>


                    <div className="
                        w-full
                        sm:w-80
                    ">
                        <Input
                            type="text"
                            placeholder="Cari NIP, nama, atau email..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            icon={Search}
                        />
                    </div>

                </div>


                {/* Table */}

                <div className="overflow-hidden">
                    <DataTableWrapper
                        columns={columns}
                        data={filteredData}
                        pagination
                        paginationServer
                        paginationTotalRows={totalLecturers}
                        paginationDefaultPage={page}
                        onChangeRowsPerPage={(currentRowsPerPage) => {
                            setPerPage(currentRowsPerPage);
                            setPage(1);
                        }}
                        onChangePage={(page) => setPage(page)}
                        sortServer
                        onSort={(column, sortDirection) => {
                            if (column.sortField) {
                                setSortBy(column.sortField);
                                setSortDirection(sortDirection);
                            }
                        }}
                        highlightOnHover
                        selectableRows
                        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                    />
                </div>

            </Card>


            {/* ==================================================
                CREATE / EDIT MODAL
            ================================================== */}

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editing
                    ? 'Edit Data Dosen'
                    : 'Tambah Dosen Baru'
                }
                bigger
            >

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* Modal Intro */}

                    <div className="
                        flex items-start gap-3
                        rounded-xl
                        border border-emerald-100
                        bg-emerald-50/60
                        p-4
                    ">

                        <div className="
                            flex h-9 w-9
                            shrink-0 items-center justify-center
                            rounded-lg
                            bg-emerald-100
                            text-emerald-600
                        ">
                            <UserRound className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="
                                text-sm font-semibold
                                text-emerald-900
                            ">
                                Informasi Akun Dosen
                            </p>

                            <p className="
                                mt-1
                                text-xs leading-relaxed
                                text-emerald-700
                            ">
                                Lengkapi identitas dan informasi
                                kontak dosen dengan benar.
                            </p>
                        </div>

                    </div>


                    {/* Identity */}

                    <div>
                        <div className="
                            mb-3 flex items-center gap-2
                        ">
                            <IdCard className="
                                h-4 w-4
                                text-emerald-600
                            " />

                            <h4 className="
                                text-sm font-semibold
                                text-gray-900
                            ">
                                Identitas Dosen
                            </h4>
                        </div>

                        <div className="
                            grid grid-cols-1
                            gap-4
                            md:grid-cols-2
                        ">

                            <Input
                                label="NIP"
                                required
                                name="nip"
                                value={form.nip}
                                onChange={handleInputChange}
                                placeholder="Masukkan NIP dosen"
                                error={errors.nip}
                            />

                            <Input
                                label="Nama Lengkap"
                                required
                                name="name"
                                value={form.name}
                                onChange={handleInputChange}
                                placeholder="Contoh: Dr. Ahmad Fauzi, M.Kom."
                                error={errors.name}
                            />

                        </div>
                    </div>


                    {/* Contact */}

                    <div>
                        <div className="
                            mb-3 flex items-center gap-2
                        ">
                            <Mail className="
                                h-4 w-4
                                text-emerald-600
                            " />

                            <h4 className="
                                text-sm font-semibold
                                text-gray-900
                            ">
                                Informasi Kontak
                            </h4>
                        </div>

                        <div className="
                            grid grid-cols-1
                            gap-4
                            md:grid-cols-2
                        ">

                            <Input
                                label="Email"
                                type="email"
                                required
                                name="email"
                                value={form.email}
                                onChange={handleInputChange}
                                placeholder="dosen@univ.ac.id"
                                error={errors.email}
                            />

                            <Input
                                label="No. HP"
                                name="phone_number"
                                value={form.phone_number}
                                onChange={handleInputChange}
                                placeholder="081234567890"
                                error={errors.phone_number}
                            />

                        </div>
                    </div>


                    {/* Footer */}

                    <div className="
                        flex flex-col-reverse
                        gap-2
                        border-t border-gray-100
                        pt-5
                        sm:flex-row
                        sm:justify-end
                    ">

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={closeModal}
                            disabled={submitting}
                        >
                            Batal
                        </Button>

                        <Button
                            type="submit"
                            loading={submitting}
                            color="primary"
                        >
                            {editing
                                ? 'Simpan Perubahan'
                                : 'Tambah Dosen'
                            }
                        </Button>

                    </div>

                </form>

            </Modal>


            {/* ==================================================
                DELETE CONFIRMATION
            ================================================== */}

            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Hapus Data Dosen"
                message={`Yakin ingin menghapus data dosen "${deleting?.user?.name || '-'}"?`}
            />

            <ConfirmDialog
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Data Dosen"
                message={`Yakin ingin menghapus ${selectedRows.length} data dosen yang dipilih?`}
            />

        </div>
    );
};

export default MasterDosen;