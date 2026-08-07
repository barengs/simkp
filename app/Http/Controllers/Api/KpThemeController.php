<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKpThemeRequest;
use App\Http\Requests\UpdateKpThemeRequest;
use App\Http\Resources\KpThemeResource;
use App\Services\KpThemeService;
use Illuminate\Http\Request;

class KpThemeController extends Controller
{
    public function __construct(
        private readonly KpThemeService $kService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->kService->getAll());
    }

    public function store(StoreKpThemeRequest $request)
    {
        $k = $this->kService->create($request->validated());
        return response()->json(new KpThemeResource($k), 201);
    }

    public function show(int $id)
    {
        $k = $this->kService->getById($id);
        return response()->json(new KpThemeResource($k));
    }

    public function update(UpdateKpThemeRequest $request, int $id)
    {
        $k = $this->kService->update($id, $request->validated());
        return response()->json(new KpThemeResource($k));
    }

    public function destroy(int $id)
    {
        $this->kService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
