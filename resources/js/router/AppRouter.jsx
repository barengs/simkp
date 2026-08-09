import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from '../modules/auth/pages/Login';
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

import VerifikasiPendaftaran from '../modules/kp/pages/VerifikasiPendaftaran';
import PendaftaranKelompok from '../modules/kp/pages/PendaftaranKelompok';
import Logbook from '../modules/kp/pages/Logbook';
import LogbookValidation from '../modules/kp/pages/LogbookValidation';
import RoleManagement from '../modules/role-management/pages/RoleManagement';

function AppRouter() {
    return (
        <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

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
                <Route path="/pengaturan/dokumen-kp" element={
                    <ProtectedRoute permission="master-data.manage">
                        <ManajemenDokumenKP />
                    </ProtectedRoute>
                } />

                {/* KP Module */}
                <Route path="/kp/verifikasi" element={
                    <ProtectedRoute permission="kp.verifikasi-pendaftaran">
                        <VerifikasiPendaftaran />
                    </ProtectedRoute>
                } />
                <Route path="/kp/kelompok" element={
                    <ProtectedRoute permission="kp.kelompok.create">
                        <PendaftaranKelompok />
                    </ProtectedRoute>
                } />
                <Route path="/kp/logbook" element={
                    <ProtectedRoute permission="kp.kelompok.create">
                        <Logbook />
                    </ProtectedRoute>
                } />
                <Route path="/kp/logbook/validasi" element={
                    <ProtectedRoute permission="kp.logbook.approve">
                        <LogbookValidation />
                    </ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Dashboard />} />
            </Route>
        </Routes>
    );
}

export default AppRouter;
