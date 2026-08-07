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
        $r = $this->rService->create($request->validated());
        return response()->json(new RoomResource($r), 201);
    }

    public function show(int $id)
    {
        $r = $this->rService->getById($id);
        return response()->json(new RoomResource($r));
    }

    public function update(UpdateRoomRequest $request, int $id)
    {
        $r = $this->rService->update($id, $request->validated());
        return response()->json(new RoomResource($r));
    }

    public function destroy(int $id)
    {
        $this->rService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
