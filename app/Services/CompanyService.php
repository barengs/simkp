<?php

namespace App\Services;

use App\Models\Company;
use Illuminate\Support\Facades\Log;

class CompanyService
{
    public function getAllCompanies()
    {
        $activePeriod = \App\Models\Period::where('is_active', true)->first();

        if (!$activePeriod) {
            return collect();
        }

        return Company::where('period_id', $activePeriod->id)->latest()->get();
    }

    public function createCompany(array $data)
    {
        try {
            return Company::create($data);
        } catch (\Exception $e) {
            Log::error('Failed to create company: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateCompany(Company $company, array $data)
    {
        try {
            $company->update($data);
            return $company;
        } catch (\Exception $e) {
            Log::error('Failed to update company: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteCompany(Company $company)
    {
        try {
            $company->delete();
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to delete company: ' . $e->getMessage());
            throw $e;
        }
    }

    public function toggleVerified(Company $company)
    {
        try {
            $company->update(['is_verified' => !$company->is_verified]);
            return $company;
        } catch (\Exception $e) {
            Log::error('Failed to toggle company verification: ' . $e->getMessage());
            throw $e;
        }
    }
}
