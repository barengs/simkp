<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AcademicPeriodResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'start_date' => $this->start_date?->format('Y-m-d') ?? $this->start_date,
            'end_date' => $this->end_date?->format('Y-m-d') ?? $this->end_date,
            'registration_start_date' => $this->registration_start_date?->format('Y-m-d') ?? $this->registration_start_date,
            'registration_end_date' => $this->registration_end_date?->format('Y-m-d') ?? $this->registration_end_date,
            'grading_start_date' => $this->grading_start_date?->format('Y-m-d') ?? $this->grading_start_date,
            'grading_end_date' => $this->grading_end_date?->format('Y-m-d') ?? $this->grading_end_date,
            'is_registration_open' => method_exists($this->resource, 'isRegistrationOpen') ? $this->isRegistrationOpen() : false,
            'is_grading_open' => method_exists($this->resource, 'isGradingOpen') ? $this->isGradingOpen() : false,
            'total_members' => $this->total_members,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
