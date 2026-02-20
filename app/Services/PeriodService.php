<?php

namespace App\Services;

use App\Models\Period;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PeriodService
{
    public function getAllPeriods()
    {
        return Period::latest()->get();
    }

    public function createPeriod(array $data)
    {
        DB::beginTransaction();
        try {
            // Jika belum ada periode, otomatis set aktif
            if (Period::count() === 0) {
                $data['is_active'] = true;
            }

            $period = Period::create($data);

            DB::commit();
            return $period;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menambahkan periode: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updatePeriod(Period $period, array $data)
    {
        DB::beginTransaction();
        try {
            $period->update($data);

            DB::commit();
            return $period;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal memperbarui periode: ' . $e->getMessage());
            throw $e;
        }
    }

    public function toggleActive(Period $period)
    {
        DB::beginTransaction();
        try {
            // Nonaktifkan semua periode lain
            Period::where('id', '!=', $period->id)->update(['is_active' => false]);

            // Aktifkan periode ini
            $period->update(['is_active' => true]);

            DB::commit();
            return $period;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal mengaktifkan periode: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deletePeriod(Period $period)
    {
        if ($period->is_active) {
            throw new \Exception('Tidak bisa menghapus periode yang sedang aktif.');
        }

        DB::beginTransaction();
        try {
            $period->delete();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus periode: ' . $e->getMessage());
            throw $e;
        }
    }
}
