import React, { useState } from 'react';
import { useGetKelompokKpQuery, useCreateKelompokKpMutation, useUpdateKelompokKpMutation, useDeleteKelompokKpMutation } from '../api/kpApi';
import { useGetPeriodeAkademikQuery, useGetPerusahaanKpQuery, useGetTemaKpQuery } from '../../master-data/api/masterDataApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import DataTableWrapper from '../../../components/ui/DataTableWrapper';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import { UserPlus, Plus, Pencil, Trash2 } from 'lucide-react';

const PendaftaranKelompok = () => {
    const { data: kelompokList, isLoading } = useGetKelompokKpQuery();
    const { data: periodeList } = useGetPeriodeAkademikQuery();
    const { data: perusahaanList } = useGetPerusahaanKpQuery();
    const { data: temaList } = useGetTemaKpQuery();
    
    const [createKelompok] = useCreateKelompokKpMutation();
    const [updateKelompok] = useUpdateKelompokKpMutation();
    const [deleteKelompok] = useDeleteKelompokKpMutation();

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({ periode_id: '', perusahaan_id: '', tema_id: '' });
    const [submitting, setSubmitting] = useState(false);

    const openCreate = () => {
        setEditing(null);
        setForm({ periode_id: '', perusahaan_id: '', tema_id: '' });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({ 
            periode_id: item.periode_id || '', 
            perusahaan_id: item.perusahaan_id || '', 
            tema_id: item.tema_id || '' 
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await updateKelompok({ id: editing.id, ...form }).unwrap();
                handleApiSuccess('Pendaftaran kelompok diperbarui');
            } else {
                await createKelompok(form).unwrap();
                handleApiSuccess('Pendaftaran kelompok berhasil');
            }
            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal mendaftar kelompok');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { name: 'Periode', selector: row => row.periode?.nama_periode || '-', sortable: true },
        { name: 'Perusahaan', selector: row => row.perusahaan?.nama_perusahaan || '-', sortable: true },
        { name: 'Tema', selector: row => row.tema?.nama_tema || '-', sortable: true },
        { name: 'Status', cell: row => <Badge status={row.status}>{row.status}</Badge> },
        {
            name: 'Aksi',
            cell: row => (
                <div className="flex gap-1">
                    {row.status === 'draft' && (
                        <>
                            <button onClick={() => openEdit(row)} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"><Pencil className="w-4 h-4" /></button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <>
            <PageHeader title="Pendaftaran Kelompok" description="Daftarkan kelompok Kerja Praktek Anda" icon={UserPlus} actions={<Button onClick={openCreate} icon={Plus}>Daftar Kelompok</Button>} />
            <Card title="Riwayat Pendaftaran" subtitle="Daftar pengajuan kelompok yang Anda buat/ikuti">
                {isLoading ? <Skeleton rows={4} /> : <DataTableWrapper columns={columns} data={kelompokList || []} pagination />}
            </Card>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Pendaftaran' : 'Daftar Kelompok Baru'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select label="Periode Akademik" required name="periode_id" value={form.periode_id} onChange={e => setForm({...form, periode_id: e.target.value})} options={(periodeList || []).filter(p => p.is_active).map(p => ({value: p.id, label: p.nama_periode}))} placeholder="Pilih Periode Aktif" />
                    <Select label="Perusahaan Tujuan" required name="perusahaan_id" value={form.perusahaan_id} onChange={e => setForm({...form, perusahaan_id: e.target.value})} options={(perusahaanList || []).map(p => ({value: p.id, label: p.nama_perusahaan}))} placeholder="Pilih Perusahaan" />
                    <Select label="Tema KP" required name="tema_id" value={form.tema_id} onChange={e => setForm({...form, tema_id: e.target.value})} options={(temaList || []).filter(t => t.is_active).map(t => ({value: t.id, label: t.nama_tema}))} placeholder="Pilih Tema" />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
                        <Button type="submit" loading={submitting}>{editing ? 'Perbarui' : 'Daftar Sekarang'}</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default PendaftaranKelompok;
