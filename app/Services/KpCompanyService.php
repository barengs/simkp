<?php

namespace App\Services;

use App\Models\KpCompany;
use Illuminate\Support\Facades\DB;

class KpCompanyService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return KpCompany::select([
            'id',
            'name',
            'address',
            'contact_person',
            'phone_number',
            'email',
            'description',
        ])->get();
    }

    public function getPaginated(array $params)
    {
        $query = KpCompany::query()
            ->select([
                'id',
                'name',
                'address',
                'contact_person',
                'phone_number',
                'email',
                'description',
            ]);

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $params['sort_by'] ?? 'name';
        $sortDirection = $params['sort_direction'] ?? 'asc';
        $allowedSorts = ['name', 'contact_person', 'phone_number', 'email'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        // Options check
        if (isset($params['type']) && $params['type'] === 'options') {
            return $query->get();
        }

        $perPage = isset($params['per_page']) ? (int)$params['per_page'] : 10;
        return $query->paginate($perPage);
    }

    public function getById(int $id): KpCompany
    {
        return KpCompany::select([
            'id',
            'name',
            'address',
            'contact_person',
            'phone_number',
            'email',
            'description',
        ])->findOrFail($id);
    }

    public function create(array $data): KpCompany
    {
        return DB::transaction(function () use ($data) {
            return KpCompany::create($data);
        });
    }

    public function update(int $id, array $data): KpCompany
    {
        return DB::transaction(function () use ($id, $data) {
            $k = KpCompany::findOrFail($id);
            $k->update($data);
            return $k->fresh();
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            KpCompany::destroy($id);
            return true;
        });
    }

    public function tes(){
        
    }
}
