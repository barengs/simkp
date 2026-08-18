import React, { useState, useMemo } from 'react';
import {
    useGetRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useGetPermissionsQuery,
} from '../api/roleManagementApi';
import { handleApiError, handleApiSuccess } from '../../shared/api/errorHandler';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import Statistik from '../../../components/ui/Statistik';
import {
    Shield,
    Plus,
    Pencil,
    Trash2,
    Users,
    Lock,
    ChevronRight,
    Code2,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helper Permission
// ---------------------------------------------------------------------------
const permissionLabel = (name) => {
    if (!name) return '-';
    const parts = name.split('.');
    const last = parts[parts.length - 1].replace(/-/g, ' ');
    return last.charAt(0).toUpperCase() + last.slice(1);
};

const groupPermissions = (permissions = []) => {
    return permissions.reduce((acc, p) => {
        const domain = p.name?.split('.')[0] || 'lainnya';
        if (!acc[domain]) acc[domain] = [];
        acc[domain].push(p);
        return acc;
    }, {});
};

const domainLabel = (domain) => {
    const map = {
        kp: 'Kerja Praktek (KP)',
        ta: 'Tugas Akhir (TA)',
        pengaturan: 'Pengaturan',
        'master-data': 'Master Data',
        repository: 'Repository',
        lainnya: 'Lainnya',
    };
    return map[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
};

const domainBadgeClass = (domain) => {
    const map = {
        kp: 'bg-blue-50 text-blue-700 border border-blue-200',
        ta: 'bg-purple-50 text-purple-700 border border-purple-200',
        pengaturan: 'bg-orange-50 text-orange-700 border border-orange-200',
        'master-data': 'bg-teal-50 text-teal-700 border border-teal-200',
        repository: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        lainnya: 'bg-gray-100 text-gray-600 border border-gray-200',
    };
    return map[domain] || 'bg-gray-100 text-gray-600 border border-gray-200';
};

// ---------------------------------------------------------------------------
// Role Card
// ---------------------------------------------------------------------------
const RoleCard = ({ role, onEdit, onDelete }) => {
    const permissions = role.permissions || [];
    const MAX_BADGES = 6;
    const visible = permissions.slice(0, MAX_BADGES);
    const overflow = permissions.length - MAX_BADGES;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide truncate">
                            {role.name}
                        </h3>
                        {role.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{role.description}</p>
                        )}
                    </div>
                </div>
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                    <Code2 className="w-3 h-3" />
                    API
                </span>
            </div>

            <div className="mx-5 border-t border-gray-100" />

            <div className="px-5 py-4 flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Hak Akses Terkait:
                </p>

                {permissions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Belum ada permission</p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {visible.map((p) => {
                            const domain = p.name?.split('.')[0] || 'lainnya';

                            return (
                                <span
                                    key={p.id}
                                    title={p.name}
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${domainBadgeClass(domain)}`}
                                >
                                    {permissionLabel(p.name)}
                                </span>
                            );
                        })}

                        {overflow > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                +{overflow} lagi
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="px-5 pb-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                    onClick={() => onEdit(role)}
                    className="inline-flex items-center p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Edit role"
                >
                    <Pencil className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onDelete(role)}
                    className="inline-flex items-center p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus role"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
const TAB_ROLES = 'roles';
const TAB_USERS = 'users';

const TabButton = ({ active, onClick, icon: Icon, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            active
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        <Icon className="w-4 h-4" />
        {children}
    </button>
);

// ---------------------------------------------------------------------------
// User Access Panel
// ---------------------------------------------------------------------------
const UserAccessPanel = () => (
    <div className="py-16 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="w-7 h-7 text-gray-400" />
        </div>

        <h3 className="text-base font-semibold text-gray-700">
            Akses Pengguna
        </h3>

        <p className="text-sm text-gray-500 max-w-sm">
            Kelola penugasan role ke pengguna dari menu{' '}
            <strong>Manajemen Pengguna</strong>. Penugasan role dilakukan per
            pengguna melalui halaman detail akun masing-masing.
        </p>

        <Button
            variant="secondary"
            size="sm"
            icon={ChevronRight}
            onClick={() => window.location.assign('/admin/users')}
        >
            Buka Manajemen Pengguna
        </Button>
    </div>
);

// ---------------------------------------------------------------------------
// Role Form Modal
// ---------------------------------------------------------------------------
const RoleFormModal = ({
    isOpen,
    onClose,
    editing,
    permissionsList,
    onSubmit,
    submitting,
}) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        permissions: [],
    });

    const [errors, setErrors] = useState({});

    React.useEffect(() => {
        if (isOpen) {
            setForm({
                name: editing?.name || '',
                description: editing?.description || '',
                permissions: editing?.permissions?.map((p) => p.id) || [],
            });
            setErrors({});
        }
    }, [isOpen, editing]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const togglePermission = (id) => {
        setForm((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(id)
                ? prev.permissions.filter((x) => x !== id)
                : [...prev.permissions, id],
        }));
    };

    const toggleDomain = (domainPerms) => {
        const domainIds = domainPerms.map((p) => p.id);
        const allChecked = domainIds.every((id) =>
            form.permissions.includes(id)
        );

        setForm((prev) => ({
            ...prev,
            permissions: allChecked
                ? prev.permissions.filter((id) => !domainIds.includes(id))
                : [...new Set([...prev.permissions, ...domainIds])],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = 'Nama role wajib diisi';
        }

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        onSubmit(form);
    };

    const grouped = useMemo(
        () => groupPermissions(permissionsList || []),
        [permissionsList]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editing ? 'Edit Role' : 'Tambah Role Baru'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nama Role"
                        required
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Contoh: Admin, Koordinator, Dosen"
                        error={errors.name}
                    />

                    <Input
                        label="Deskripsi"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Deskripsi singkat tentang role ini"
                        error={errors.description}
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Permission
                        </label>

                        <span className="text-xs text-gray-400">
                            {form.permissions.length} dipilih
                            {permissionsList?.length
                                ? ` dari ${permissionsList.length}`
                                : ''}
                        </span>
                    </div>

                    <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                        {Object.entries(grouped).map(([domain, perms]) => {
                            const domainIds = perms.map((p) => p.id);
                            const checkedCount = domainIds.filter((id) =>
                                form.permissions.includes(id)
                            ).length;

                            const allChecked =
                                checkedCount === domainIds.length;
                            const someChecked =
                                checkedCount > 0 && !allChecked;

                            return (
                                <div
                                    key={domain}
                                    className="rounded-lg border border-gray-200 overflow-hidden"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleDomain(perms)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                readOnly
                                                checked={allChecked}
                                                ref={(el) => {
                                                    if (el) {
                                                        el.indeterminate =
                                                            someChecked;
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                                            />

                                            <span className="text-sm font-semibold text-gray-700">
                                                {domainLabel(domain)}
                                            </span>
                                        </div>

                                        <span className="text-xs text-gray-400">
                                            {checkedCount}/{domainIds.length}
                                        </span>
                                    </button>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y divide-gray-100">
                                        {perms.map((p) => (
                                            <label
                                                key={p.id}
                                                className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.permissions.includes(
                                                        p.id
                                                    )}
                                                    onChange={() =>
                                                        togglePermission(p.id)
                                                    }
                                                    className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                />

                                                <div className="min-w-0">
                                                    <p className="text-sm text-gray-800 font-medium leading-tight">
                                                        {permissionLabel(
                                                            p.name
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                                                        {p.name}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Batal
                    </Button>

                    <Button
                        type="submit"
                        loading={submitting}
                        variant="primary"
                    >
                        {editing ? 'Perbarui Role' : 'Simpan Role'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const RoleManagement = () => {
    const { data: rolesList, isLoading: isLoadingRoles } =
        useGetRolesQuery();

    const { data: permissionsList } = useGetPermissionsQuery();

    const [createRole] = useCreateRoleMutation();
    const [updateRole] = useUpdateRoleMutation();
    const [deleteRole] = useDeleteRoleMutation();

    const [activeTab, setActiveTab] = useState(TAB_ROLES);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const roles = useMemo(
        () =>
            Array.isArray(rolesList)
                ? rolesList
                : Array.isArray(rolesList?.data)
                ? rolesList.data
                : [],
        [rolesList]
    );

    const permissions = useMemo(
        () =>
            Array.isArray(permissionsList)
                ? permissionsList
                : Array.isArray(permissionsList?.data)
                ? permissionsList.data
                : [],
        [permissionsList]
    );

    const filteredRoles = useMemo(
        () =>
            roles.filter(
                (r) =>
                    !searchTerm ||
                    r.name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    r.description
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
            ),
        [roles, searchTerm]
    );

    // -----------------------------------------------------------------------
    // Statistik RBAC
    // -----------------------------------------------------------------------
    const statistics = useMemo(() => {
        const totalRoles = roles.length;
        const totalPermissions = permissions.length;

        const rolesWithPermissions = roles.filter(
            (role) => role.permissions?.length > 0
        ).length;

        const rolesWithoutPermissions = roles.filter(
            (role) => !role.permissions || role.permissions.length === 0
        ).length;

        return {
            totalRoles,
            totalPermissions,
            rolesWithPermissions,
            rolesWithoutPermissions,
        };
    }, [roles, permissions]);

    const openCreate = () => {
        setEditing(null);
        setShowModal(true);
    };

    const openEdit = (role) => {
        setEditing(role);
        setShowModal(true);
    };

    const handleSubmit = async (form) => {
        setSubmitting(true);

        try {
            if (editing) {
                await updateRole({
                    id: editing.id,
                    name: form.name,
                    description: form.description || null,
                    permissions: form.permissions,
                }).unwrap();

                handleApiSuccess('Role berhasil diperbarui');
            } else {
                await createRole({
                    name: form.name,
                    description: form.description || null,
                    permissions: form.permissions,
                }).unwrap();

                handleApiSuccess('Role berhasil ditambahkan');
            }

            setShowModal(false);
        } catch (err) {
            handleApiError(err, 'Gagal menyimpan role');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteRole(deleting.id).unwrap();

            handleApiSuccess('Role berhasil dihapus');
            setDeleting(null);
        } catch (err) {
            handleApiError(err, 'Gagal menghapus role');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Manajemen Peran & Akses (RBAC)"
                description="Atur hak akses dinamis (Spatie Permission) dan tentukan wilayah operasional masing-masing peran pengguna."
                icon={Shield}
                actions={
                    activeTab === TAB_ROLES && (
                        <Button onClick={openCreate} icon={Plus}>
                            Tambah Peran Baru
                        </Button>
                    )
                }
            />

            {/* Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Statistik
                    title="Total Peran"
                    value={statistics.totalRoles}
                    icon={Shield}
                    iconClassName="text-emerald-600"
                    borderClassName="bg-emerald-500"
                    description="Seluruh role yang tersedia"
                />

                <Statistik
                    title="Total Permission"
                    value={statistics.totalPermissions}
                    icon={Lock}
                    iconClassName="text-blue-600"
                    borderClassName="bg-blue-500"
                    description="Hak akses yang tersedia"
                />

                <Statistik
                    title="Role Aktif"
                    value={statistics.rolesWithPermissions}
                    icon={CheckCircle2}
                    iconClassName="text-indigo-600"
                    borderClassName="bg-indigo-500"
                    description="Role memiliki permission"
                />

                <Statistik
                    title="Belum Memiliki Akses"
                    value={statistics.rolesWithoutPermissions}
                    icon={AlertCircle}
                    iconClassName="text-amber-600"
                    borderClassName="bg-amber-500"
                    description="Role tanpa permission"
                />
            </div>

            {/* Tab */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-4 pt-4 flex gap-1">
                    <TabButton
                        active={activeTab === TAB_ROLES}
                        onClick={() => setActiveTab(TAB_ROLES)}
                        icon={Shield}
                    >
                        Daftar Peran &amp; Hak Akses
                    </TabButton>

                    <TabButton
                        active={activeTab === TAB_USERS}
                        onClick={() => setActiveTab(TAB_USERS)}
                        icon={Users}
                    >
                        Akses Pengguna
                    </TabButton>
                </div>

                <div className="p-6">
                    {activeTab === TAB_ROLES && (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-800">
                                        Daftar Peran yang Tersedia
                                    </h2>

                                    <p className="text-xs text-gray-400 mt-1">
                                        Kelola role dan permission sistem
                                    </p>
                                </div>

                                <div className="w-full sm:max-w-xs">
                                    <Input
                                        type="text"
                                        placeholder="Cari nama peran..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {isLoadingRoles ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-48 rounded-xl"
                                        />
                                    ))}
                                </div>
                            ) : filteredRoles.length === 0 ? (
                                <EmptyState
                                    icon={Lock}
                                    title="Belum ada peran"
                                    description="Tambahkan peran pertama untuk mengatur hak akses pengguna."
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredRoles.map((role) => (
                                        <RoleCard
                                            key={role.id}
                                            role={role}
                                            onEdit={openEdit}
                                            onDelete={setDeleting}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === TAB_USERS && <UserAccessPanel />}
                </div>
            </div>

            {/* Modal Form */}
            <RoleFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                editing={editing}
                permissionsList={permissions}
                onSubmit={handleSubmit}
                submitting={submitting}
            />

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Hapus Peran"
                message={`Yakin ingin menghapus peran "${deleting?.name}"? Pengguna yang memiliki peran ini akan kehilangan hak aksesnya.`}
            />
        </div>
    );
};

export default RoleManagement;