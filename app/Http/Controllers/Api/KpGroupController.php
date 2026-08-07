<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKelompokKpRequest;
use App\Http\Requests\UpdateKelompokKpRequest;
use App\Http\Resources\KpGroupResource;
use App\Services\KpGroupService;
use Illuminate\Http\Request;

class KpGroupController extends Controller
{
    public function __construct(
        private readonly KelompokKpService $kpGroupService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $user = request()->user();

        if ($user->can('kp.kelompok.create')) {
            return response()->json($this->kelompokKpService->getAll());
        }

        return response()->json(
            $this->kelompokKpService->getByMahasiswa($user->mahasiswa->id ?? 0)
        );
    }

    public function store(StoreKelompokKpRequest $request)
    {
        $this->authorize('create', \App\Models\KpGroup::class);

        $kelompok = $this->kelompokKpService->create($request->validated());

        return response()->json(new KelompokKpResource($kelompok), 201);
    }

    public function show(int $id)
    {
        $kelompok = $this->kelompokKpService->getById($id);
        $this->authorize('view', $kelompok);

        return response()->json(new KelompokKpResource($kelompok));
    }

    public function update(UpdateKelompokKpRequest $request, int $id)
    {
        $kelompok = $this->kelompokKpService->getById($id);
        $this->authorize('update', $kelompok);

        $updated = $this->kelompokKpService->update($id, $request->validated());

        return response()->json(new KelompokKpResource($updated));
    }

    public function destroy(int $id)
    {
        $kelompok = $this->kelompokKpService->getById($id);
        $this->authorize('delete', $kelompok);

        $this->kelompokKpService->delete($id);

        return response()->json(['message' => 'Deleted']);
    }
}
