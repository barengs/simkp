<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'code'        => $this->code,
            'description' => $this->description,
            'is_required' => $this->is_required,
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
