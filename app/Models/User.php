<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function lecturer()
    {
        return $this->hasOne(Lecturer::class);
    }

    public function company()
    {
        return $this->hasOne(Company::class);
    }

    public function profileUser()
    {
        return $this->hasOne(ProfileUser::class);
    }

    public function tugasAkhir()
    {
        return $this->hasMany(TugasAkhir::class);
    }

    /** Legacy + Spatie role names treated as lecturer-side accounts. */
    public const LECTURER_ROLES = [
        'dosen',
        'dosen_pembimbing',
        'dosen_penguji',
        'koordinator_ta',
    ];

    public const PRIMARY_ROLE_PRIORITY = [
        'admin',
        'koordinator_ta',
        'dosen_pembimbing',
        'dosen_penguji',
        'mahasiswa',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin'
            || $this->hasRole('admin');
    }

    public function isStudent(): bool
    {
        return $this->role === 'mahasiswa'
            || $this->hasRole('mahasiswa');
    }

    public function isLecturerRole(): bool
    {
        if (in_array($this->role, self::LECTURER_ROLES, true)) {
            return true;
        }

        return $this->hasAnyRole(self::LECTURER_ROLES);
    }

    /**
     * Pick a single legacy users.role value from a list of Spatie role names.
     */
    public static function resolvePrimaryRole(array $roleNames): ?string
    {
        $normalized = array_map(static fn ($r) => strtolower((string) $r), $roleNames);

        // Map legacy "dosen" if still present
        $normalized = array_map(static function ($r) {
            return $r === 'dosen' ? 'dosen_pembimbing' : $r;
        }, $normalized);

        foreach (self::PRIMARY_ROLE_PRIORITY as $candidate) {
            if (in_array($candidate, $normalized, true)) {
                return $candidate;
            }
        }

        return $normalized[0] ?? null;
    }

    public function syncPrimaryRoleFromSpatie(): void
    {
        $primary = self::resolvePrimaryRole($this->getRoleNames()->toArray());
        if ($primary && $this->role !== $primary) {
            $this->role = $primary;
            $this->saveQuietly();
        }
    }

    /**
     * Auto-sync Spatie roles when legacy role column is set or updated.
     */
    protected static function booted()
    {
        static::saved(function (User $user) {
            if (!$user->role) {
                return;
            }

            $roleName = strtolower($user->role);
            if ($roleName === 'dosen') {
                $roleName = 'dosen_pembimbing';
            }

            if (\Spatie\Permission\Models\Role::where('name', $roleName)->where('guard_name', 'api')->exists()) {
                // Avoid stacking unrelated roles when only legacy column changes
                if (!$user->hasRole($roleName)) {
                    $user->assignRole($roleName);
                }
            }
        });
    }
}
