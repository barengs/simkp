import React from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import { FileText } from 'lucide-react';

/**
 * LaporanTA — Sub-Modul 4: Pendaftaran Laporan & Sidang TA
 *
 * Halaman ini akan diimplementasikan pada modul berikutnya.
 */
const LaporanTA = () => {
    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <PageHeader
                title="Laporan Tugas Akhir"
                description="Pemberkasan laporan Tugas Akhir dan pendaftaran ujian sidang"
                icon={FileText}
            />
            <Card>
                <div className="py-12 text-center text-gray-500 space-y-3">
                    <FileText className="mx-auto text-gray-300" size={48} />
                    <p className="text-base font-medium text-gray-400">Fitur Laporan & Sidang TA</p>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto">
                        Sub-modul laporan dan sidang sedang dalam tahap pembangunan dan akan tersedia segera.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default LaporanTA;
