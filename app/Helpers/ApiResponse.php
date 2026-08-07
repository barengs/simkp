<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success($data = null, string $message = '', int $status = 200): JsonResponse
    {
        $response = ['success' => true];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    public static function error(string $message, int $status = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }

    public static function paginate($collection, int $perPage = 15): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $collection->items(),
            'meta' => [
                'current_page' => $collection->currentPage(),
                'last_page' => $collection->lastPage(),
                'per_page' => $collection->perPage(),
                'total' => $collection->total(),
                'from' => $collection->firstItem(),
                'to' => $collection->lastItem(),
            ],
        ]);
    }
}
