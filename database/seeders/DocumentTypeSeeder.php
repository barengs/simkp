<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $types = [
            [
                'name' => 'Proposal Kerja Praktik',
                'description' => 'Dokumen usulan dan rancangan rencana kerja praktik mahasiswa.',
                'is_required' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Surat Penerimaan Mitra (Acceptance Letter)',
                'description' => 'Surat resmi konfirmasi penerimaan dari instansi atau perusahaan mitra KP.',
                'is_required' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Formulir Kesediaan Pembimbing Lapangan',
                'description' => 'Surat pernyataan kesediaan pembimbing lapangan dari instansi mitra.',
                'is_required' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Laporan Akhir Kerja Praktik',
                'description' => 'Draft naskah laporan hasil kerja praktik yang telah disetujui mitra.',
                'is_required' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($types as $type) {
            DocumentType::updateOrCreate(['name' => $type['name']], $type);
        }

        $this->command->info(count($types) . ' document types created successfully!');
    }
}

