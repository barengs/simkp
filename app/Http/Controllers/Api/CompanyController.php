<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use App\Services\CompanyService;

class CompanyController extends Controller
{
    protected $companyService;

    public function __construct(CompanyService $companyService)
    {
        $this->companyService = $companyService;
    }

    public function index(Request $request)
    {
        $companies = $this->companyService->getAll(
            $request->only('search'),
            $request->get('per_page', 10)
        );

        return response()->json([
            'status' => 'success',
            'data' => $companies
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'contact_person' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        try {
            $company = $this->companyService->create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Perusahaan berhasil ditambahkan',
                'data' => $company
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan perusahaan',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function show(Company $company)
    {
        return response()->json([
            'status' => 'success',
            'data' => $company
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'contact_person' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        try {
            $this->companyService->update($company, $validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Perusahaan berhasil diperbarui',
                'data' => $company
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui perusahaan',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function destroy(Company $company)
    {
        try {
            $this->companyService->delete($company);

            return response()->json([
                'status' => 'success',
                'message' => 'Perusahaan berhasil dihapus'
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus perusahaan',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}
