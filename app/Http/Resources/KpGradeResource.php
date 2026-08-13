<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class KpGradeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'kp_group_member_id' => $this->kp_group_member_id,
            'evaluation_criteria_id' => $this->evaluation_criteria_id,
            'score_field' => $this->score_field,
            'score_report' => $this->score_report,
            'score_seminar' => $this->score_seminar,
            'final_grade' => $this->final_grade,
            'notes' => $this->notes,
            'evaluation_criteria' => $this->whenLoaded('evaluationCriteria'),
            'kp_group_member' => $this->whenLoaded('kpGroupMember'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
