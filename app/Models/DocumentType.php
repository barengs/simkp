<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    use HasFactory;

    protected $table = 'document_type';

    protected $fillable = [
        'name',
        'description',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    // ── Relasi ────────────────────────────────────────────────────────────────

    /** Dokumen yang menggunakan tipe ini */
    public function documents()
    {
        return $this->hasMany(KpDocument::class);
    }
}
