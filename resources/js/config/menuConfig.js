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
    UsersRound,
    Award,
    User,
    GraduationCap,
    BookMarked,
    FolderOpen,
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
        label: 'Kerja Praktek',
        type: 'section',
        children: [
            { label: 'Verifikasi Pendaftaran', path: '/kp/verifikasi', permission: 'kp.verifikasi-pendaftaran', icon: CheckCircle },
            { label: 'Pendaftaran Kelompok', path: '/kp/kelompok', permission: 'kp.pendaftaran-kelompok', icon: UserPlus },
            { label: 'Daftar Kelompok', path: '/kp/daftar-kelompok', permission: 'kp.plotting-dosen', icon: UsersRound },
            { label: 'Logbook', path: '/kp/logbook', permission: 'kp.logbook', icon: BookOpen },
            { label: 'Validasi Logbook', path: '/kp/logbook/validasi', permission: 'kp.validasi-logbook', icon: ClipboardList },
            { label: 'Laporan KP', path: '/kp/laporan', permission: 'kp.laporan', icon: FileText },
            { label: 'Validasi Laporan', path: '/kp/laporan/validasi', permission: 'kp.validasi-laporan', icon: ClipboardList },
            { label: 'Nilai KP', path: '/kp/nilai', permission: 'kp.nilai', icon: CheckCircle },
            { label: 'Nilai Saya', path: '/kp/nilai-saya', permission: 'kp.nilai-saya', icon: Award },
        ],
    },

    {
        label: 'Tugas Akhir',
        type: 'section',
        children: [
            { label: 'Pengajuan Judul', path: '/ta/pengajuan', permission: 'ta.pengajuan', icon: BookOpen },
            { label: 'Verifikasi Judul', path: '/ta/verifikasi-judul', permission: 'ta.verifikasi-judul', icon: CheckCircle },
            { label: 'Plotting Dosen', path: '/ta/plotting-dosen', permission: 'ta.plotting-dosen', icon: UsersRound },
            { label: 'Bimbingan', path: '/ta/bimbingan', permission: 'ta.bimbingan', icon: BookMarked },
            { label: 'Laporan', path: '/ta/laporan', permission: 'ta.laporan', icon: FileText },
        ],
    },

    {
        label: 'Pengaturan',
        type: 'section',
        children: [
            { label: 'Manajemen Pengguna', path: '/users', permission: 'pengaturan.manage', icon: UserCog },
            { label: 'Manajemen Peran', path: '/roles', permission: 'pengaturan.manage', icon: Shield },
            { label: 'Repository', path: '/repository', permission: 'repository.publish', icon: Briefcase },
            { label: 'Pengaturan Umum', path: '/pengaturan', permission: 'pengaturan.manage', icon: Settings },
        ],
    },
];
