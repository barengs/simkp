<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\CompanyService;
use App\Http\Requests\CompanyRequest;
use App\Http\Resources\CompanyResource;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    protected $companyService;

    public function __construct(CompanyService $companyService)
    {
        $this->companyService = $companyService;
    }

    public function index()
    {
        $companies = $this->companyService->getAllCompanies();
        return CompanyResource::collection($companies);
    }

    public function store(CompanyRequest $request)
    {
        $company = $this->companyService->createCompany($request->validated());
        return new CompanyResource($company);
    }

    public function show(Company $company)
    {
        return new CompanyResource($company);
    }

    public function update(CompanyRequest $request, Company $company)
    {
        $updatedCompany = $this->companyService->updateCompany($company, $request->validated());
        return new CompanyResource($updatedCompany);
    }

    public function destroy(Company $company)
    {
        $this->companyService->deleteCompany($company);
        return response()->json(null, 204);
    }

    public function toggleVerified(Company $company)
    {
        $updatedCompany = $this->companyService->toggleVerified($company);
        return new CompanyResource($updatedCompany);
    }
}
