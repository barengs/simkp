import {
    LayoutDashboard,
    Users,
    UserCog,
    UserPlus,
    ClipboardList,
    Briefcase,
    CalendarDays,
    Lightbulb,
    CheckCircle,
    BookOpen,
    FileText,
    Settings,
    Shield,
} from 'lucide-react';

export const menuConfig = [
    { label: 'Dashboard', path: '/dashboard', permission: null, icon: LayoutDashboard },
    {
        label: 'Master Data',
        permission: 'master-data.manage',
        icon: Users,
        children: [
            { label: 'Dosen', path: '/master-data/dosen', permission: 'master-data.manage' },
            { label: 'Mahasiswa', path: '/master-data/mahasiswa', permission: 'master-data.manage' },
            { label: 'Mitra', path: '/master-data/mitra', permission: 'master-data.manage' },
            { label: 'Periode Akademik', path: '/master-data/periode', permission: 'master-data.manage' },
            { label: 'Tema KP', path: '/master-data/tema', permission: 'master-data.manage' },
        ],
    },
    {
        label: 'Verifikasi Pendaftaran',
        path: '/kp/verifikasi',
        permission: 'kp.verifikasi-pendaftaran',
        icon: CheckCircle,
    },
    {
        label: 'Pendaftaran Kelompok',
        path: '/kp/kelompok',
        permission: 'kp.kelompok.create',
        icon: UserPlus,
    },
    {
        label: 'Logbook',
        path: '/kp/logbook',
        permission: 'kp.kelompok.create',
        icon: BookOpen,
    },
    {
        label: 'Validasi Logbook',
        path: '/kp/logbook/validasi',
        permission: 'kp.logbook.approve',
        icon: ClipboardList,
    },
    {
        label: 'Manajemen Pengguna',
        path: '/users',
        permission: 'pengaturan.manage',
        icon: UserCog,
    },
    {
        label: 'Manajemen Peran',
        path: '/roles',
        permission: 'pengaturan.manage',
        icon: Shield,
    },
    {
        label: 'Repository',
        path: '/repository',
        permission: 'repository.publish',
        icon: Briefcase,
    },
    {
        label: 'Pengaturan',
        path: '/pengaturan',
        permission: 'pengaturan.manage',
        icon: Settings,
    },
];
