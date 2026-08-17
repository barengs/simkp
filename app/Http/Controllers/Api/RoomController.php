<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Services\RoomService;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function __construct(
        private readonly RoomService $rService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->rService->getAll());
    }

    public function store(StoreRoomRequest $request)
    {
        try {
            $r = $this->rService->create($request->validated());
            return response()->json(new RoomResource($r), 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menyimpan data ruangan.'], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $r = $this->rService->getById($id);
            return response()->json(new RoomResource($r));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Data ruangan tidak ditemukan.'], 404);
        }
    }

    public function update(UpdateRoomRequest $request, int $id)
    {
        try {
            $r = $this->rService->update($id, $request->validated());
            return response()->json(new RoomResource($r));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui data ruangan.'], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->rService->delete($id);
            return response()->json(['message' => 'Data ruangan berhasil dihapus']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menghapus data ruangan. Pastikan data tidak sedang digunakan.'], 500);
        }
    }
}
