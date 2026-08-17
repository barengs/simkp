import React, { useMemo, useState, useEffect } from 'react';
import { useGetKpCompaniesQuery, useCreateKpCompanyMutation, useUpdateKpCompanyMutation, useDeleteKpCompanyMutation } from '../api/masterDataApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Skeleton from '../../../components/ui/Skeleton';
import { Briefcase, Plus, Search, Pencil, Trash2, X } from 'lucide-react';

const MasterMitra = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const { data: companyList, isLoading } = useGetKpCompaniesQuery({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search: debouncedSearch,
    });
    const [createCompany] = useCreateKpCompanyMutation();
    const [updateCompany] = useUpdateKpCompanyMutation();
    const [deleteCompany] = useDeleteKpCompanyMutation();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const [form, setForm] = useState({
        name: '',
        address: '',
        contact_person: '',
        phone_number: '',
        email: '',
        description: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', address: '', contact_person: '', phone_number: '', email: '', description: '' });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (company) => {
        setEditing(company);
        setForm({
            name: company.name || '',
            address: company.address || '',
            contact_person: company.contact_person || '',
            phone_number: company.phone_number || '',
            email: company.email || '',
            description: company.description || '',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await updateCompany({ id: editing.id, ...form }).unwrap();
                handleApiSuccess('Data mitra berhasil diperbarui');
            } else {
                await createCompany(form).unwrap();
                handleApiSuccess('Data mitra berhasil ditambahkan');
            }
            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan data mitra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCompany(deleting.id).unwrap();
            handleApiSuccess('Data mitra berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus data mitra');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRows.length) return;
        try {
            await Promise.all(
                selectedRows.map(row => deleteCompany(row.id).unwrap())
            );
            handleApiSuccess(
                `${selectedRows.length} data mitra berhasil dihapus`
            );
            setSelectedRows([]);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus data mitra');
        }
    };

    const filteredData = useMemo(() => {
        return companyList?.data || [];
    }, [companyList]);

    const columns = [
        {
            name: 'Nama',
            selector: row => row.name || '-',
            sortable: true,
            sortField: 'name',
            width: '300px',
        },
        {
            name: 'Contact Person',
            selector: row => row.contact_person || '-',
            sortable: true,
            sortField: 'contact_person',
            width: '200px',
        },
        {
            name: 'No. HP',
            selector: row => row.phone_number || '-',
            sortable: true,
            sortField: 'phone_number',
            width: '200px',
        },
        {
            name: 'Email',
            selector: row => row.email || '-',
            sortable: true,
            sortField: 'email',
            wrap: true,
            width: '290px',
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
                <PageHeader title="Manajemen Mitra" description="Kelola perusahaan mitra untuk program kerja praktikum" icon={Briefcase} />
                <Skeleton className="h-[500px]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Manajemen Mitra"
                description="Kelola perusahaan mitra untuk program kerja praktikum"
                icon={Briefcase}
                actions={
                    <Button onClick={openCreate} icon={Plus}>
                        Tambah Mitra
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
                            {selectedRows.length} mitra dipilih
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
                            Hapus {selectedRows.length} Mitra
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
                            Daftar Mitra KP
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            {searchTerm
                                ? `${companyList?.meta?.total || 0} hasil ditemukan`
                                : `${companyList?.meta?.total || 0} mitra terdaftar`
                            }
                        </p>
                    </div>

                    <div className="w-full sm:w-80">
                        <Input
                            type="text"
                            placeholder="Cari nama, email, atau telepon..."
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
                        paginationTotalRows={companyList?.meta?.total || 0}
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Mitra' : 'Tambah Mitra Baru'} bigger>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nama Perusahaan"
                            required
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            placeholder="PT Mitra KP..."
                            error={errors.name}
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            placeholder="contact@mitra.com"
                        />
                        
                        <Input
                            label="Contact Person"
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleInputChange}
                            placeholder="Contoh : Budi Santoso"
                        />
                        <Input
                            label="No. HP"
                            name="phone_number"
                            value={form.phone_number}
                            onChange={handleInputChange}
                            placeholder="021-xxxxxxxx"
                        />
                        <div className='md:col-span-2'>
                            <Textarea
                                label="Alamat"
                                name="address"
                                value={form.address}
                                onChange={handleInputChange}
                                placeholder="Alamat lengkap perusahaan..."
                                rows={2}
                            />
                        </div>
                        <div className='md:col-span-2'>
                            <Textarea
                                label="Deskripsi"
                                name="description"
                                value={form.description}
                                onChange={handleInputChange}
                                placeholder="Deskripsi singkat perusahaan..."
                                rows={2}
                            />
                        </div>
                        
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" loading={submitting} color="primary" icon={Plus}>{editing ? 'Perbarui' : 'Simpan'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Hapus Mitra"
                message={`Yakin ingin menghapus mitra "${deleting?.name}"?`}
            />

            <ConfirmDialog
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Mitra"
                message={`Yakin ingin menghapus ${selectedRows.length} data mitra yang dipilih?`}
            />
        </div>
    );
};

export default MasterMitra;
