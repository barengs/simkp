<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLogbookRequest;
use App\Http\Requests\UpdateLogbookRequest;
use App\Http\Resources\LogbookResource;
use App\Services\LogbookService;
use Illuminate\Http\Request;

class LogbookController extends Controller
{
    public function __construct(
        private readonly LogbookService $logbookService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $user = request()->user();

        if ($user->can('kp.logbook.approve')) {
            return response()->json($this->logbookService->getAll());
        }

        return response()->json(
            $this->logbookService->getByKelompok(
                $user->mahasiswa->kelompokKp->id ?? 0
            )
        );
    }

    public function store(StoreLogbookRequest $request)
    {
        $this->authorize('create', \App\Models\Logbook::class);

        $logbook = $this->logbookService->create($request->validated());

        return response()->json(new LogbookResource($logbook), 201);
    }

    public function show(int $id)
    {
        $logbook = $this->logbookService->getById($id);
        $this->authorize('view', $logbook);

        return response()->json(new LogbookResource($logbook));
    }

    public function update(UpdateLogbookRequest $request, int $id)
    {
        $logbook = $this->logbookService->getById($id);
        $this->authorize('update', $logbook);

        $updated = $this->logbookService->update($id, $request->validated());

        return response()->json(new LogbookResource($updated));
    }

    public function destroy(int $id)
    {
        $logbook = $this->logbookService->getById($id);
        $this->authorize('delete', $logbook);

        $this->logbookService->delete($id);

        return response()->json(['message' => 'Deleted']);
    }
}
