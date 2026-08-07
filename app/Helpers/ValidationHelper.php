<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;

class ValidationHelper
{
    public static function validateArray(array $data, array $rules): array
    {
        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        return $validator->validated();
    }

    public static function validateRequest($request, array $rules): array
    {
        return $request->validate($rules);
    }
}
