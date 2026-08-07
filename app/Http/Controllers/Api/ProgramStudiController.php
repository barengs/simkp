<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgramStudiRequest;
use App\Http\Requests\UpdateProgramStudiRequest;
use App\Http\Resources\ProgramStudiResource;
use App\Services\ProgramStudiService;
use Illuminate\Http\Request;

class ProgramStudiController extends Controller
{
    public function __construct(
        private readonly ProgramStudiService $programStudiService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->programStudiService->getAll());
    }

    public function store(StoreProgramStudiRequest $request)
    {
        $programStudi = $this->programStudiService->create($request->validated());
        return response()->json(new ProgramStudiResource($programStudi), 201);
    }

    public function show(int $id)
    {
        $programStudi = $this->programStudiService->getById($id);
        return response()->json(new ProgramStudiResource($programStudi));
    }

    public function update(UpdateProgramStudiRequest $request, int $id)
    {
        $programStudi = $this->programStudiService->update($id, $request->validated());
        return response()->json(new ProgramStudiResource($programStudi));
    }

    public function destroy(int $id)
    {
        $this->programStudiService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
