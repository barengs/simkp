import React, { useMemo, useState, useEffect } from 'react';
import { useGetStudentsQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation, useGetStudyProgramsQuery } from '../api/masterDataApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import { GraduationCap, Plus, Search, Pencil, Trash2, Mail, Phone, X } from 'lucide-react';
const MasterMahasiswa = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const { data: studentList, isLoading } = useGetStudentsQuery({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search: debouncedSearch,
    });
    const { data: studyPrograms } = useGetStudyProgramsQuery({ type: 'options' });
    const [createStudent] = useCreateStudentMutation();
    const [updateStudent] = useUpdateStudentMutation();
    const [deleteStudent] = useDeleteStudentMutation();

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const [form, setForm] = useState({
        nim: '',
        name: '',
        email: '',
        phone_number: '',
        study_program_id: '',
        is_active: true,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const students = Array.isArray(studentList) ? studentList : Array.isArray(studentList?.data) ? studentList.data : [];

    const getInitials = (name = '') => {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase() || 'M';
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            nim: '',
            name: '',
            email: '',
            phone_number: '',
            study_program_id: '',
            is_active: true,
        });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (student) => {
        setEditing(student);
        setForm({
            nim: student.nim || '',
            name: student.user?.name || student.name || '',
            email: student.user?.email || student.email || '',
            phone_number: student.user?.phone_number || '',
            study_program_id: student.study_program_id || '',
            is_active: student.is_active ?? true,
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await updateStudent({
                    id: editing.id,
                    nim: form.nim,
                    study_program_id: parseInt(form.study_program_id) || null,
                    is_active: form.is_active,
                    name: form.name,
                    email: form.email,
                    phone_number: form.phone_number,
                }).unwrap();
                handleApiSuccess('Data mahasiswa berhasil diperbarui');
            } else {
                await createStudent({
                    nim: form.nim,
                    study_program_id: parseInt(form.study_program_id) || null,
                    is_active: form.is_active,
                    name: form.name,
                    email: form.email,
                    phone_number: form.phone_number,
                    password: 'mhs123',
                }).unwrap();
                handleApiSuccess('Data mahasiswa berhasil ditambahkan');
            }
            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan data mahasiswa');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteStudent(deleting.id).unwrap();
            handleApiSuccess('Data mahasiswa berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus data mahasiswa');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRows.length) return;
        try {
            await Promise.all(
                selectedRows.map(row => deleteStudent(row.id).unwrap())
            );
            handleApiSuccess(
                `${selectedRows.length} data mahasiswa berhasil dihapus`
            );
            setSelectedRows([]);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus data mahasiswa');
        }
    };

    const filteredData = useMemo(() => {
        return students;
    }, [students]);

    const columns = [
        {
            name: 'Mahasiswa',
            sortable: true,
            sortField: 'name',
            width: '350px',
            cell: row => {
                const name = row.user?.name || row.name || '-';
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
                                    {row.user?.email || row.email || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            name: 'NIM',
            selector: row => row.nim || '-',
            sortable: true,
            sortField: 'nim',
            width: '140px',
        },
        {
            name: 'Program Studi',
            selector: row => row.studyProgram?.name || row.study_program?.name || '-',
            sortable: true,
            sortField: 'study_program_id',
            wrap: true,
        },
        {
            name: 'Kontak',
            width: '240px',
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
                        <span className="text-xs text-gray-400">
                            Tidak tersedia
                        </span>
                    )}
                </div>
            ),
        },
        {
            name: 'Aksi',
            width: '190px',
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Manajemen Mahasiswa" description="Kelola data mahasiswa aktif" icon={GraduationCap} />
                <Skeleton className="h-[500px]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Manajemen Mahasiswa"
                description="Kelola data mahasiswa aktif"
                icon={GraduationCap}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        Tambah Mahasiswa
                    </Button>
                }
            />

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
                        <span className="text-sm font-medium text-emerald-900">
                            {selectedRows.length} mahasiswa dipilih
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
                            Hapus {selectedRows.length} Mahasiswa
                        </Button>
                    </div>
                </div>
            )}

            <Card>
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
                        <h3 className="text-base font-semibold text-gray-900">
                            Daftar Mahasiswa
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            {searchTerm
                                ? `${studentList?.meta?.total || 0} hasil ditemukan`
                                : `${studentList?.meta?.total || 0} mahasiswa terdaftar`
                            }
                        </p>
                    </div>

                    <div className="w-full sm:w-80">
                        <Input
                            type="text"
                            placeholder="Cari NIM, nama, atau email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={Search}
                        />
                    </div>
                </div>

                <div className="overflow-hidden">
                    <DataTableWrapper
                        columns={columns}
                        data={filteredData}
                        pagination
                        paginationServer
                        paginationTotalRows={studentList?.meta?.total || 0}
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'} bigger>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="NIM"
                            required
                            name="nim"
                            value={form.nim}
                            onChange={handleInputChange}
                            placeholder="NIM Mahasiswa"
                            error={errors.nim}
                        />
                        <Input
                            label="Nama Lengkap"
                            required
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            placeholder="Nama Lengkap Mahasiswa"
                            error={errors.name}
                        />
                        <Input
                            label="Email"
                            type="email"
                            required
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            placeholder="mahasiswa@univ.ac.id"
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
                        <div className='md:col-span-2'>
                            <Select
                                label="Program Studi"
                                name="study_program_id"
                                value={form.study_program_id}
                                onChange={(e) => handleInputChange(e)}
                                options={studyPrograms?.map(sp => ({ value: sp.id, label: sp.name })) || []}
                                placeholder="Pilih program studi"
                                error={errors.study_program_id}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleInputChange}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label className="text-sm text-gray-700">Mahasiswa aktif</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" loading={submitting} color="primary">{editing ? 'Perbarui' : 'Simpan'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Hapus Mahasiswa"
                message={`Yakin ingin menghapus data mahasiswa "${deleting?.user?.name}"?`}
            />

            <ConfirmDialog
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Mahasiswa"
                message={`Yakin ingin menghapus ${selectedRows.length} data mahasiswa yang dipilih?`}
            />
        </div>
    );
};

export default MasterMahasiswa;
