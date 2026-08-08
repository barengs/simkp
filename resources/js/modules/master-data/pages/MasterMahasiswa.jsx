import React, { useState } from 'react';
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
import { GraduationCap, Plus, Search, Pencil, Trash2 } from 'lucide-react';

const MasterMahasiswa = () => {
    const { data: studentList, isLoading } = useGetStudentsQuery();
    const { data: studyPrograms } = useGetStudyProgramsQuery();
    const [createStudent] = useCreateStudentMutation();
    const [updateStudent] = useUpdateStudentMutation();
    const [deleteStudent] = useDeleteStudentMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
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

    const students = Array.isArray(studentList) ? studentList : Array.isArray(studentList?.data) ? studentList.data : [];

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

    const columns = [
        { name: 'NIM', selector: (row) => row.nim || '-', sortable: true, wrap: true },
        { name: 'Nama', selector: (row) => row.user?.name || row.name || '-', sortable: true, wrap: true },
        { name: 'Email', selector: (row) => row.user?.email || row.email || '-', sortable: true, wrap: true },
        {
            name: 'Program Studi',
            selector: (row) => row.studyProgram?.name || row.study_program?.name || '-',
            sortable: true,
            wrap: true,
        },
        {
            name: 'Status',
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
            ),
            ignoreRowClick: true,
        },
        {
            name: 'Aksi',
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <Button className='bg-yellow-500 hover:bg-yellow-600' size="sm" onClick={() => openEdit(row)} icon={Pencil}>Edit</Button>
                    <Button className='bg-red-500 hover:bg-red-600' size="sm" onClick={() => setDeleting(row)} icon={Trash2}>Hapus</Button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    if (isLoading) return <Skeleton className="h-96" />;

    const filteredData = students.filter(
        (item) => !searchTerm || [
            'nim', 'user.name', 'user.email', 'studyProgram.name'
        ].some(field => {
            const value = field.split('.').reduce((obj, path) => obj?.[path], item);
            return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
        })
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Manajemen Mahasiswa"
                description="Kelola data mahasiswa aktif"
                icon={GraduationCap}
                actions={<Button onClick={openCreate} icon={Plus}>Tambah Mahasiswa</Button>}
            />

            <Card title="Daftar Mahasiswa" subtitle={`${filteredData.length} mahasiswa terdaftar`}>
                <div className="mb-4 max-w-sm">
                    <Input
                        type="text"
                        placeholder="Cari NIM, nama, email, atau program studi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <DataTableWrapper columns={columns} data={filteredData} pagination />
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
                        <Select
                            label="Program Studi"
                            name="study_program_id"
                            value={form.study_program_id}
                            onChange={(e) => handleInputChange(e)}
                            options={studyPrograms?.map(sp => ({ value: sp.id, label: sp.name })) || []}
                            placeholder="Pilih program studi"
                            error={errors.study_program_id}
                        />
                        <Input
                            label="No. HP"
                            name="phone_number"
                            value={form.phone_number}
                            onChange={handleInputChange}
                            placeholder="081234567890"
                            error={errors.phone_number}
                        />
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
        </div>
    );
};

export default MasterMahasiswa;
