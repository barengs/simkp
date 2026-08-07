<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTemaKpRequest;
use App\Http\Requests\UpdateTemaKpRequest;
use App\Http\Resources\TemaKpResource;
use App\Services\TemaKpService;
use Illuminate\Http\Request;

class TemaKpController extends Controller
{
    public function __construct(
        private readonly TemaKpService $temaKpService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->temaKpService->getAll());
    }

    public function store(StoreTemaKpRequest $request)
    {
        $tema = $this->temaKpService->create($request->validated());
        return response()->json(new TemaKpResource($tema), 201);
    }

    public function show(int $id)
    {
        $tema = $this->temaKpService->getById($id);
        return response()->json(new TemaKpResource($tema));
    }

    public function update(UpdateTemaKpRequest $request, int $id)
    {
        $tema = $this->temaKpService->update($id, $request->validated());
        return response()->json(new TemaKpResource($tema));
    }

    public function destroy(int $id)
    {
        $this->temaKpService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
