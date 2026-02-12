<?php

namespace App\Services;

use App\Models\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CompanyService
{
    public function getAll(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = Company::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function create(array $data): Company
    {
        return Company::create([
            ...$data,
            'is_verified' => false,
        ]);
    }

    public function update(Company $company, array $data): Company
    {
        $company->update($data);
        return $company;
    }

    public function delete(Company $company): void
    {
        $company->delete();
    }
}
