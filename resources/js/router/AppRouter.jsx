import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from '../modules/auth/pages/Login';
import Register from '../modules/auth/pages/Register';
import AppShell from '../layouts/AppShell';
import Dashboard from '../modules/shared/pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import Forbidden from '../modules/shared/pages/Forbidden';

import MasterDosen from '../modules/master-data/pages/MasterDosen';
import MasterMahasiswa from '../modules/master-data/pages/MasterMahasiswa';
import MasterMitra from '../modules/master-data/pages/MasterMitra';
import PeriodeAkademik from '../modules/master-data/pages/PeriodeAkademik';
import TemaKp from '../modules/master-data/pages/TemaKp';

import ManajemenDokumenKP from '../modules/pengaturan/pages/ManajemenDokumenKP';
import Pengaturan from '../modules/pengaturan/pages/Pengaturan';
import Profile from '../modules/pengaturan/pages/Profile';

import VerifikasiPendaftaran from '../modules/kp/pages/VerifikasiPendaftaran';
import PendaftaranKelompok from '../modules/kp/pages/PendaftaranKelompok';
import Logbook from '../modules/kp/pages/Logbook';
import LogbookValidation from '../modules/kp/pages/LogbookValidation';
import Laporan from '../modules/kp/pages/Laporan';
import ValidasiLaporan from '../modules/kp/pages/ValidasiLaporan';
import Nilai from '../modules/kp/pages/Nilai';
import NilaiSaya from '../modules/kp/pages/NilaiSaya';
import DaftarKelompok from '../modules/kp/pages/DaftarKelompok';
import DetailKelompok from '../modules/kp/pages/DetailKelompok';
import RoleManagement from '../modules/role-management/pages/RoleManagement';

// TA Module
import PengajuanTA from '../modules/ta/pages/PengajuanTA';
import VerifikasiJudulTA from '../modules/ta/pages/VerifikasiJudulTA';
import PlottingDosenTA from '../modules/ta/pages/PlottingDosenTA';
import BimbinganTA from '../modules/ta/pages/BimbinganTA';
import DetailBimbinganTA from '../modules/ta/pages/DetailBimbinganTA';
import LaporanTA from '../modules/ta/pages/LaporanTA';

function AppRouter() {
    return (
        <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Forbidden */}
            <Route path="/403" element={<Forbidden />} />

            {/* Protected routes inside AppShell */}
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Master Data */}
                <Route path="/master-data/dosen" element={
                    <ProtectedRoute permission="master-data.manage">
                        <MasterDosen />
                    </ProtectedRoute>
                } />
                <Route path="/master-data/mahasiswa" element={
                    <ProtectedRoute permission="master-data.manage">
                        <MasterMahasiswa />
                    </ProtectedRoute>
                } />
                <Route path="/master-data/mitra" element={
                    <ProtectedRoute permission="master-data.manage">
                        <MasterMitra />
                    </ProtectedRoute>
                } />
                <Route path="/master-data/periode" element={
                    <ProtectedRoute permission="master-data.manage">
                        <PeriodeAkademik />
                    </ProtectedRoute>
                } />
                <Route path="/master-data/tema" element={
                    <ProtectedRoute permission="master-data.manage">
                        <TemaKp />
                    </ProtectedRoute>
                } />

                {/* Role Management */}
                <Route path="/roles" element={
                    <ProtectedRoute permission="pengaturan.manage">
                        <RoleManagement />
                    </ProtectedRoute>
                } />

                {/* Pengaturan */}
                <Route path="/pengaturan" element={
                    <ProtectedRoute permission="pengaturan.manage">
                        <Pengaturan />
                    </ProtectedRoute>
                } />
                <Route path="/pengaturan/dokumen-kp" element={
                    <ProtectedRoute permission="master-data.manage">
                        <ManajemenDokumenKP />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />

                {/* KP Module */}
                <Route path="/kp/verifikasi" element={
                    <ProtectedRoute permission="kp.verifikasi-pendaftaran">
                        <VerifikasiPendaftaran />
                    </ProtectedRoute>
                } />
                <Route path="/kp/kelompok" element={
                    <ProtectedRoute permission="kp.pendaftaran-kelompok">
                        <PendaftaranKelompok />
                    </ProtectedRoute>
                } />
                <Route path="/kp/logbook" element={
                    <ProtectedRoute permission="kp.pendaftaran-kelompok">
                        <Logbook />
                    </ProtectedRoute>
                } />
                <Route path="/kp/logbook/validasi" element={
                    <ProtectedRoute permission="kp.validasi-logbook">
                        <LogbookValidation />
                    </ProtectedRoute>
                } />
                <Route path="/kp/laporan" element={
                    <ProtectedRoute permission="kp.pendaftaran-kelompok">
                        <Laporan />
                    </ProtectedRoute>
                } />
                <Route path="/kp/laporan/validasi" element={
                    <ProtectedRoute permission="kp.validasi-laporan">
                        <ValidasiLaporan />
                    </ProtectedRoute>
                } />
                <Route path="/kp/nilai" element={
                    <ProtectedRoute permission="kp.nilai">
                        <Nilai />
                    </ProtectedRoute>
                } />
                <Route path="/kp/nilai-saya" element={
                    <ProtectedRoute permission="kp.nilai-saya">
                        <NilaiSaya />
                    </ProtectedRoute>
                } />

                {/* Kelompok Bimbingan untuk Dosen */}
                {/* <Route path="/kp/bimbingan" element={
                    <ProtectedRoute permission="kp.plotting-dosen">
                        <KelompokBimbinganDosen />
                    </ProtectedRoute>
                } /> */}

                {/* Daftar Kelompok (Admin: semua kelompok terplotting, Dosen: kelompok bimbingannya) */}
                <Route path="/kp/daftar-kelompok/:id" element={
                    <ProtectedRoute permission="kp.detail-kelompok">
                        <DetailKelompok />
                    </ProtectedRoute>
                } />
                <Route path="/kp/daftar-kelompok" element={
                    <ProtectedRoute permission="kp.detail-kelompok">
                        <DaftarKelompok />
                    </ProtectedRoute>
                } />

                {/* TA (Tugas Akhir) Module */}
                <Route path="/ta/pengajuan" element={
                    <ProtectedRoute permission="ta.pengajuan">
                        <PengajuanTA />
                    </ProtectedRoute>
                } />
                <Route path="/ta/verifikasi-judul" element={
                    <ProtectedRoute permission="ta.verifikasi-judul">
                        <VerifikasiJudulTA />
                    </ProtectedRoute>
                } />
                <Route path="/ta/plotting-dosen" element={
                    <ProtectedRoute permission="ta.plotting-dosen">
                        <PlottingDosenTA />
                    </ProtectedRoute>
                } />
                <Route path="/ta/bimbingan" element={
                    <ProtectedRoute permission="ta.bimbingan">
                        <BimbinganTA />
                    </ProtectedRoute>
                } />
                <Route path="/ta/bimbingan/:id" element={
                    <ProtectedRoute permission="ta.bimbingan">
                        <DetailBimbinganTA />
                    </ProtectedRoute>
                } />
                <Route path="/ta/laporan" element={
                    <ProtectedRoute permission="ta.laporan">
                        <LaporanTA />
                    </ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Dashboard />} />
            </Route>
        </Routes>
    );
}

export default AppRouter;
