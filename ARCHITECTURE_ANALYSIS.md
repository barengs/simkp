# 📊 Analisis Arsitektur SIMKP — Laporan Lengkap

Dokumen ini berisi analisis menyeluruh terhadap arsitektur aplikasi SIMKP saat ini, identifikasi anti-pattern, desain arsitektur baru, dan strategi refactoring bertahap.

---

## 1. Analisis Arsitektur Saat Ini

### 1.1 Backend (Laravel)

#### Struktur Folder Saat Ini
```
app/
├── Http/Controllers/Api/
│   ├── InternshipController.php          ← Mengandung role checks
│   ├── LogbookController.php             ← Mengandung role checks
│   ├── ReportController.php              ← Mengandung role checks
│   ├── EvaluationController.php          ← Mengandung role checks
│   ├── DashboardController.php           ← Mengandung role checks
│   ├── ProfileController.php             ← Mengandung role checks
│   ├── ActivityController.php            ← Mengandung role checks
│   ├── AuthController.php                ← Otentikasi
│   ├── AuthService.php (Service)         ← Role-based logic
│   ├── InternshipService.php (Service)   ← Role-based logic
│   ├── ReportService.php (Service)       ← Role-based logic
│   ├── ActivityService.php (Service)     ← Role-based logic
│   ├── StudentBimbinganController.php    ← Khusus mahasiswa
│   ├── StudentSidangController.php       ← Khusus mahasiswa
│   ├── StudentRepositoryController.php   ← Khusus mahasiswa
│   ├── StudentController.php             ← Khusus mahasiswa
│   ├── StudentService.php (Service)      ← Khusus mahasiswa
│   ├── LecturerController.php            ← Khusus dosen
│   ├── LecturerService.php (Service)     ← Khusus dosen
│   ├── CompanyController.php             ← Generic
│   ├── CompanyService.php (Service)      ← Generic
│   ├── PeriodController.php              ← Generic
│   ├── PeriodService.php (Service)       ← Generic
│   ├── ThemeController.php               ← Generic
│   ├── ThemeService.php (Service)        ← Generic
│   ├── SettingController.php             ← Generic
│   ├── SettingService.php (Service)      ← Generic
│   ├── TugasAkhirController.php          ← Generic (TA)
│   ├── TugasAkhirService.php (Service)   ← Generic (TA)
│   ├── SidangService.php (Service)       ← Generic (TA)
│   ├── BimbinganService.php (Service)    ← Generic (TA)
│   ├── ProfileUser.php (Model)
│   ├── Repository.php (Model)
│   ├── RepositoryService.php (Service)   ← Generic
│   └── RolePermissionController.php      ← RBAC management
├── Models/
│   ├── User.php                          ← Menggunakan Spatie HasRoles + role enum
│   ├── Student.php
│   ├── Lecturer.php
│   ├── Company.php
│   ├── Internship.php
│   ├── Logbook.php
│   ├── Report.php
│   ├── Evaluation.php
│   ├── Period.php
│   ├── Theme.php
│   ├── Activity.php
│   └── ...
├── Policies/                             ← KOSONG (belum ada)
├── Providers/
│   └── AuthServiceProvider.php           ← BELUM ADA (belum terdaftar)
└── Services/
    └── ... (semua service mengandung role checks)
```

#### Masalah Utama Backend

**A. Role-Based Checks di Controller dan Service (Anti-Pattern)**

Terdapat **27+ lokasi** di mana kode melakukan pengecekan berdasarkan nama role:

```php
// ❌ ANTI-PATTERN: Hardcoded role name
if ($user->role === 'mahasiswa') { ... }
if ($user->role === 'dosen') { ... }
if ($user->role === 'admin') { ... }
if ($user->role !== 'dosen' && $user->role !== 'admin') { ... }
```

Masalah:
- Setiap role baru memerlukan perubahan di banyak file
- Tidak ada single source of truth untuk akses
- Sulit di-debug dan di-maintain
- Melanggar Open/Closed Principle

**B. Tidak Ada Policy**

Folder `app/Policies/` kosong. Tidak ada file policy yang dibuat sama sekali.

**C. Tidak Ada AuthServiceProvider**

Tidak ada `AuthServiceProvider.php` yang terdaftar di `bootstrap/providers.php`.

**D. Service Layer Berbasis Role**

`InternshipService`, `ReportService`, `AuthService`, `ActivityService` semuanya mengandung logika berbasis role.

**E. Route Prefix Berbasis Role**

```php
// ❌ Route masih menggunakan prefix berbasis role
Route::prefix('admin/internships')->group(...)  // hanya admin
Route::prefix('koordinator/ta')->group(...)     // hanya koordinator
Route::prefix('student/bimbingan-ta')->group(...) // hanya mahasiswa
```

### 1.2 Frontend (React)

#### Struktur Folder Saat Ini
```
resources/js/src/
├── App.jsx                          ← Import berdasarkan role folder
├── Dashboard.jsx                    ← Dashboard berdasarkan role
├── Login.jsx
├── Register.jsx
├── api.js
├── components/
│   ├── PermissionGate.jsx
│   ├── InternshipGroupList.jsx
│   ├── tableStyles.js
│   └── ...
├── layouts/
│   ├── MainLayout.jsx
│   ├── Navbar.jsx
│   └── Sidebar.jsx                  ← Menu berdasarkan role
├── admin/                           ← ❌ Folder berdasarkan role
│   ├── Dashboard.jsx
│   ├── Internships/InternshipList.jsx
│   ├── Logbooks/Logbook.jsx
│   ├── Reports/Report.jsx
│   ├── Evaluations/Evaluation.jsx
│   ├── Activities/ActivityIndex.jsx
│   ├── Periods/PeriodManagement.jsx
│   ├── Themes/ThemeManagement.jsx
│   ├── Settings/Settings.jsx
│   ├── RoleManagement.jsx
│   ├── KoordinatorTA.jsx
│   ├── RegistrationValidation.jsx
│   └── master/
│       ├── Lecturers/LecturerList.jsx
│       ├── Students/StudentList.jsx
│       └── Companies/CompanyList.jsx
├── dosen/                           ← ❌ Folder berdasarkan role
│   ├── Dashboard.jsx
│   ├── Internships/InternshipList.jsx
│   ├── Logbooks/Logbook.jsx
│   ├── Reports/Report.jsx
│   ├── Evaluations/Evaluation.jsx
│   ├── Activities/ActivityIndex.jsx
│   ├── LogbookValidation.jsx
│   └── ...
├── student/                         ← ❌ Folder berdasarkan role
│   ├── Dashboard.jsx
│   ├── Registration.jsx
│   ├── Logbooks/Logbook.jsx
│   ├── Reports/Report.jsx
│   ├── Evaluations/Evaluation.jsx
│   ├── Activities/ActivityIndex.jsx
│   ├── TARegistration.jsx
│   ├── TABimbingan.jsx
│   ├── TASidang.jsx
│   ├── TAFinal.jsx
│   ├── StudentProfile.jsx
│   └── ...
├── koordinator/                     ← ❌ Folder berdasarkan role (hampir kosong)
├── features/                        ← Folder ini ada tapi isinya kosong/subfolder
├── pages/
│   ├── InternshipGroupDetail.jsx
│   └── ProfileSettings.jsx
├── store/
│   └── slice/
│       └── ...
└── hooks/
    └── ...
```

#### Masalah Utama Frontend

**A. Folder Berdasarkan Role**

Folder `admin/`, `dosen/`, `student/`, `koordinator/` mengelompokkan kode berdasarkan role. Setiap role memiliki:
- Folder sendiri
- Dashboard sendiri
- Komponen monitoring sendiri
- Route sendiri

Masalah:
- Menambah role baru = membuat folder baru + duplikasi kode
- Komponen yang sama (misal: Logbook monitoring) dibuat 3-4 kali
- Maintenance sangat sulit

**B. Sidebar Hardcoded Berdasarkan Role**

Sidebar menggunakan `if (role === 'admin')` atau `if (role === 'dosen')` untuk menampilkan menu.

**C. Dashboard Hardcoded Berdasarkan Role**

Dashboard berbeda untuk setiap role, dengan widget yang sama persis.

**D. App.jsx Import Berdasarkan Role Folder**

Semua lazy import di App.jsx mengacu ke folder berdasarkan role.

---

## 2. Identifikasi Anti-Pattern

| No | Anti-Pattern | Lokasi | Dampak |
|----|-------------|--------|--------|
| 1 | **Role-Based Folder Structure** | `admin/`, `dosen/`, `student/`, `koordinator/` | Duplikasi kode, sulit maintenance |
| 2 | **Hardcoded Role Checks** | 27+ lokasi di controller & service | Setiap role baru = banyak perubahan |
| 3 | **No Policy Layer** | `app/Policies/` kosong | Tidak ada authorization abstraction |
| 4 | **No AuthServiceProvider** | Tidak terdaftar di `bootstrap/providers.php` | Policy tidak aktif |
| 5 | **Role-Prefixed Routes** | `Route::prefix('admin/...')`, `koordinator/...` | URL bergantung pada role |
| 6 | **Role-Based Dashboard** | `admin/Dashboard.jsx`, `dosen/Dashboard.jsx` | Duplikasi UI |
| 7 | **Role-Based Sidebar** | `Sidebar.jsx` menggunakan role checks | Menu tidak dinamis |
| 8 | **Role-Based Import in App.jsx** | Semua lazy import berdasarkan folder role | App.jsx menjadi besar dan sulit dikelola |
| 9 | **Service Layer Role Checks** | `InternshipService`, `ReportService`, dll | Business logic bercampur dengan authorization |
| 10 | **No Permission Abstraction** | Tidak ada konsep permission di frontend | Frontend tidak bisa dinamis |
| 11 | **Duplicate Components** | Logbook, Report, Evaluation dibuat 3-4x | DRY violation |
| 12 | **Mixed Concerns** | Controller melakukan authorization + business logic | Violation of Single Responsibility |

---

## 3. Dampak Jangka Panjang

### 3.1 Maintainability
- Setiap bug di fitur monitoring harus diperbaiki di 3-4 file (admin, dosen, student)
- Perubahan UI memerlukan perubahan di banyak tempat
- Tidak ada single source of truth untuk komponen

### 3.2 Scalability
- Menambah role baru = membuat folder + controller + route + view + dashboard
- Menambah fitur baru = menduplikasi kode ke semua folder role
- Growth tidak linear, eksponensial

### 3.3 Testability
- Tidak ada unit test untuk policy (karena tidak ada)
- Controller sulit di-test karena bercampur dengan role logic
- Frontend component sulit di-test karena bergantung pada role context

### 3.4 Onboarding
- Developer baru harus memahami 4+ folder untuk satu fitur
- Tidak ada pola yang konsisten
- Dokumentasi arsitektur tidak ada

---

## 4. Bagian yang Perlu Di-refactor vs Dipertahankan

### Perlu Di-refactor
1. ❌ Semua controller → hapus role checks, pakai policy
2. ❌ Semua service → hapus role checks, pakai permission
3. ❌ Semua route → hapus role prefix, pakai middleware permission
4. ❌ Semua frontend folder role-based → feature-based
5. ❌ Sidebar → permission-based menu
6. ❌ Dashboard → permission-based widget
7. ❌ App.jsx → feature-based imports
8. ❌ UserSeeder → hanya buat akun, tidak buat data KP
9. ❌ SystemSeeder → hanya master data, tidak buat kelompok KP

### Dipertahankan (Tidak Diubah)
1. ✅ Model (User, Student, Lecturer, Company, Internship, dll)
2. ✅ Database migrations
3. ✅ Spatie Permission package (sudah terinstall)
4. ✅ AuthController (login/logout/register)
5. ✅ AuthService (autentikasi)
6. ✅ RolePermissionController (CRUD role & permission)
7. ✅ SettingController (branding)
8. ✅ ProfileController (profil user)
9. ✅ Komponen UI dasar (DataTable, Modal, dll)
10. ✅ Halaman Login, Register, ProfileSettings

---

## 5. Risiko Selama Migrasi

| Risiko | Tingkat | Mitigasi |
|--------|---------|----------|
| **Broken routes** | Tinggi | Gunakan redirect dari URL lama ke URL baru |
| **Broken UI** | Tinggi | Pertahankan wrapper component selama migrasi |
| **Data inconsistency** | Sedang | UserSeeder hanya buat akun, tidak buat data KP |
| **Permission regression** | Tinggi | Test setiap permission setelah perubahan |
| **Performance degradation** | Rendah | Policy caching sudah built-in Laravel |
| **Regression testing** | Tinggi | Buat checklist test per fitur |

---

## 6. Strategi Refactoring Bertahap

### Fase 0: Persiapan (Hari 1)
- [ ] Buat `AuthServiceProvider` dan daftarkan di `bootstrap/providers.php`
- [ ] Buat 4 Policy (Internship, Logbook, Report, Evaluation)
- [ ] Buat `bootstrap/providers.php` jika belum ada
- [ ] Register policy di AuthServiceProvider

### Fase 1: Backend Policy Layer (Hari 2-3)
- [ ] Rewrite controller menggunakan `$this->authorize()`
- [ ] Hapus role checks di service layer
- [ ] Hapus role checks di controller
- [ ] Test setiap endpoint dengan Postman/curl

### Fase 2: Frontend Feature-Based (Hari 4-5)
- [ ] Buat `features/index.jsx` barrel export
- [ ] Buat komponen reusable (InternshipGroupList, LogbookMonitoring, dll)
- [ ] Rewrite `App.jsx` dengan feature-based routing
- [ ] Rewrite `Sidebar.jsx` dengan permission-based menu
- [ ] Rewrite `DashboardSwitcher` dengan permission-first
- [ ] Buat wrapper component di folder role (thin wrapper → fitur)

### Fase 3: Route Migration (Hari 6)
- [ ] Tambah route universal (tanpa prefix role)
- [ ] Tambah redirect dari URL lama ke URL baru
- [ ] Test semua URL lama masih berfungsi (redirect)
- [ ] Test semua URL baru berfungsi

### Fase 4: Cleanup (Hari 7)
- [ ] Hapus folder role-based yang sudah tidak terpakai
- [ ] Hapus wrapper component yang sudah tidak terpakai
- [ ] Optimize bundle size
- [ ] Final testing

### Fase 5: Documentation (Hari 8)
- [ ] Buat ARCHITECTURE.md
- [ ] Buat panduan menambah role baru
- [ ] Buat panduan menambah fitur baru
- [ ] Update README

---

## 7. Desain Arsitektur Baru

### 7.1 Struktur Folder Backend (Target)
```
app/
├── Http/Controllers/Api/
│   ├── InternshipController.php      ← Generic, permission-based
│   ├── LogbookController.php         ← Generic, permission-based
│   ├── ReportController.php          ← Generic, permission-based
│   ├── EvaluationController.php      ← Generic, permission-based
│   ├── DashboardController.php       ← Generic, permission-based
│   ├── AuthController.php            ← Auth (tidak berubah)
│   ├── RolePermissionController.php  ← RBAC management (tidak berubah)
│   ├── SettingController.php         ← Settings (tidak berubah)
│   ├── ProfileController.php         ← Profile (tidak berubah)
│   └── ... (semua controller generic)
├── Policies/
│   ├── InternshipPolicy.php
│   ├── LogbookPolicy.php
│   ├── ReportPolicy.php
│   └── EvaluationPolicy.php
├── Providers/
│   └── AuthServiceProvider.php
├── Services/
│   ├── InternshipService.php         ← Tanpa role checks
│   ├── LogbookService.php            ← Tanpa role checks
│   ├── ReportService.php             ← Tanpa role checks
│   ├── EvaluationService.php         ← Tanpa role checks
│   └── ... (semua service tanpa role checks)
└── Models/
    └── ... (tidak berubah)
```

### 7.2 Struktur Folder Frontend (Target)
```
resources/js/src/
├── components/                       ← Reusable components
│   ├── InternshipGroupList.jsx       ← Satu komponen untuk semua role
│   ├── LogbookMonitoring.jsx         ← Satu komponen untuk semua role
│   ├── ReportMonitoring.jsx          ← Satu komponen untuk semua role
│   ├── EvaluationMonitoring.jsx      ← Satu komponen untuk semua role
│   ├── DashboardSwitcher.jsx         ← Permission-based dashboard
│   ├── PermissionGate.jsx            ← HOC untuk proteksi
│   ├── Sidebar.jsx                   ← Permission-based menu
│   └── ...
├── features/                         ← Barrel export untuk fitur
│   └── index.jsx
├── pages/                            ← Halaman spesifik (detail, form)
│   ├── InternshipGroupDetail.jsx
│   └── ProfileSettings.jsx
├── layouts/
│   └── MainLayout.jsx
├── auth/                             ← Auth pages
│   ├── Login.jsx
│   └── Register.jsx
├── hooks/                            ← Custom hooks
│   └── ...
├── store/                            ← Redux store
│   └── slice/
│       └── ...
├── config/                           ← Config
│   └── ...
├── api.js                            ← API configuration
├── App.jsx                           ← Feature-based routing
└── index.jsx                         ← Entry point
```

### 7.3 Struktur Route Baru (Target)

**Sebelum (Role-Prefixed):**
```
/admin/internship-groups    → admin only
/dosen/internship-groups    → dosen only
/student/internship-groups  → student only
/admin/logbook              → admin only
/dosen/logbook              → dosen only
```

**Sesudah (Permission-Based, Universal):**
```
/internship-groups          → Siapa pun dengan permission "view internships"
/logbook-monitoring         → Siapa pun dengan permission "view logbook monitoring"
/report-monitoring          → Siapa pun dengan permission "view kp reports"
/evaluation-recap           → Siapa pun dengan permission "view evaluation recap"
/logbook-validation         → Siapa pun dengan permission "validate logbook"
```

**Redirect (Legacy URL → New URL):**
```
/admin/internship-groups    → /internship-groups
/dosen/internship-groups    → /internship-groups
/admin/logbook              → /logbook-monitoring
/dosen/logbook              → /logbook-monitoring
```

---

## 8. Struktur Database RBAC

### 8.1 Tabel yang Sudah Ada (Spatie Permission)

```sql
-- Sudah ada dari migrasi 2026_07_02_190252_create_permission_tables.php

permissions
├── id (bigint, PK)
├── name (varchar)          ← contoh: "view internships", "manage internships"
├── guard_name (varchar)    ← "api" atau "web"
├── created_at
└── updated_at

roles
├── id (bigint, PK)
├── name (varchar)          ← contoh: "admin", "koordinator_ta", "dosen_pembimbing"
├── guard_name (varchar)
├── created_at
└── updated_at

model_has_permissions
├── permission_id (bigint, FK)
├── model_type (varchar)
└── model_id (bigint)

model_has_roles
├── role_id (bigint, FK)
├── model_type (varchar)
└── model_id (bigint)

role_has_permissions
├── permission_id (bigint, FK)
└── role_id (bigint, FK)
```

### 8.2 Tabel Tambahan yang Diperlukan

```sql
-- Menu table untuk sidebar dinamis
menus
├── id (bigint, PK)
├── name (varchar)              ← "Kelompok KP", "Monitoring Logbook", dll
├── slug (varchar, unique)      ← "internship-groups", "logbook-monitoring"
├── route (varchar)             ← "/internship-groups"
├── icon (varchar, nullable)    ← "Users", "Book", dll
├── parent_id (bigint, FK, nullable) ← Untuk submenu
├── sort_order (int, default 0)
├── is_active (boolean, default true)
├── created_at
└── updated_at

menu_permissions
├── id (bigint, PK)
├── menu_id (bigint, FK)
├── permission_id (bigint, FK)
├── created_at
└── updated_at

-- Dashboard widgets (opsional, untuk dashboard dinamis)
dashboard_widgets
├── id (bigint, PK)
├── name (varchar)
├── slug (varchar, unique)
├── permission (varchar)        ← Permission yang dibutuhkan untuk melihat widget
├── component (varchar)         ← Nama komponen React
├── config (json, nullable)     ← Konfigurasi widget
├── sort_order (int, default 0)
├── is_active (boolean, default true)
├── created_at
└── updated_at
```

### 8.3 Hubungan

```
Role ──┬─── has_many ──→ Permissions (via role_has_permissions)
       │
       └─── has_many ──→ Menus (via menu_permissions)

User ──┬─── has_many ──→ Roles (via model_has_roles)
       │
       └─── has_many ──→ Permissions (via model_has_permissions, direct)

Menu ──┬─── belongs_to ──→ Parent Menu (self-referencing)
       │
       └─── has_many ──→ MenuPermissions
       └─── has_many ──→ Permissions (via menu_permissions)
```

### 8.4 Seeder untuk Menu Dinamis

```php
// Database/Seeders/MenuSeeder.php
public function run(): void
{
    $menus = [
        // Dashboard
        ['name' => 'Dashboard', 'slug' => 'dashboard', 'route' => '/', 'icon' => 'LayoutDashboard', 'sort_order' => 1],

        // KP Group
        ['name' => 'Kerja Praktek', 'slug' => 'kerja-praktek', 'sort_order' => 10, 'is_header' => true],
        ['name' => 'Kelompok KP', 'slug' => 'internship-groups', 'route' => '/internship-groups', 'icon' => 'Users', 'parent_id' => null, 'sort_order' => 11],
        ['name' => 'Monitoring Logbook', 'slug' => 'logbook-monitoring', 'route' => '/logbook-monitoring', 'icon' => 'Book', 'sort_order' => 12],
        ['name' => 'Laporan KP', 'slug' => 'report-monitoring', 'route' => '/report-monitoring', 'icon' => 'FileText', 'sort_order' => 13],
        ['name' => 'Rekap Penilaian', 'slug' => 'evaluation-recap', 'route' => '/evaluation-recap', 'icon' => 'CheckSquare', 'sort_order' => 14],

        // Tugas Akhir
        ['name' => 'Tugas Akhir', 'slug' => 'tugas-akhir', 'sort_order' => 20, 'is_header' => true],
        ['name' => 'Manajemen TA', 'slug' => 'koordinator-ta', 'route' => '/admin/koordinator-ta', 'icon' => 'GraduationCap', 'sort_order' => 21],

        // Master Data
        ['name' => 'Master Data', 'slug' => 'master-data', 'sort_order' => 30, 'is_header' => true],
        ['name' => 'Periode', 'slug' => 'period-management', 'route' => '/admin/period-management', 'icon' => 'Calendar', 'sort_order' => 31],
        ['name' => 'Tema', 'slug' => 'theme-management', 'route' => '/admin/theme-management', 'icon' => 'Palette', 'sort_order' => 32],
        ['name' => 'Mitra', 'slug' => 'companies', 'route' => '/admin/master/mitra', 'icon' => 'Building', 'sort_order' => 33],
        ['name' => 'Dosen', 'slug' => 'lecturers', 'route' => '/admin/master/dosen', 'icon' => 'Users', 'sort_order' => 34],
        ['name' => 'Mahasiswa', 'slug' => 'students', 'route' => '/admin/master/mahasiswa', 'icon' => 'UserCheck', 'sort_order' => 35],

        // Settings
        ['name' => 'Pengaturan', 'slug' => 'settings', 'sort_order' => 90, 'is_header' => true],
        ['name' => 'Role & Permission', 'slug' => 'role-management', 'route' => '/admin/role-management', 'icon' => 'Shield', 'sort_order' => 91],
        ['name' => 'Settings', 'slug' => 'settings', 'route' => '/admin/settings', 'icon' => 'Settings', 'sort_order' => 92],
    ];

    foreach ($menus as $menu) {
        Menu::create($menu);
    }

    // Hubungkan menu dengan permission
    $menuPermissions = [
        'internship-groups' => ['view internships'],
        'logbook-monitoring' => ['view logbook monitoring'],
        'report-monitoring' => ['view kp reports'],
        'evaluation-recap' => ['view evaluation recap'],
        'logbook-validation' => ['validate logbook'],
        'period-management' => ['manage periods'],
        'theme-management' => ['manage themes'],
        'companies' => ['manage master data'],
        'lecturers' => ['manage master data'],
        'students' => ['manage master data'],
        'role-management' => ['manage roles'],
        'settings' => ['manage settings'],
    ];

    foreach ($menuPermissions as $slug => $permissions) {
        $menu = Menu::where('slug', $slug)->first();
        if (!$menu) continue;

        foreach ($permissions as $permName) {
            $permission = Permission::where('name', $permName)->first();
            if ($permission) {
                $menu->permissions()->attach($permission);
            }
        }
    }
}
```

### 8.5 Query untuk Sidebar Dinamis

```php
// Di controller atau API endpoint
public function getMenus(Request $request)
{
    $user = $request->user();
    $permissions = $user->getAllPermissions()->pluck('name');

    $menus = Menu::where('is_active', true)
        ->where(function ($query) use ($permissions) {
            foreach ($permissions as $permission) {
                $query->orWhereHas('permissions', function ($q) use ($permission) {
                    $q->where('name', $permission);
                });
            }
        })
        ->with('children')
        ->orderBy('sort_order')
        ->get();

    return response()->json($menus);
}
```

---

## 9. Contoh Implementasi Kode Laravel (Best Practice)

### 9.1 Policy Contoh (InternshipPolicy)

```php
<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Internship;
use Illuminate\Auth\Access\Response;

class InternshipPolicy
{
    /**
     * Determine whether the user can view any internships.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view internships');
    }

    /**
     * Determine whether the user can view a specific internship.
     */
    public function view(User $user, Internship $internship): bool
    {
        // Admin & Koordinator TA: lihat semua
        if ($user->hasPermissionTo('manage internships')) {
            return true;
        }

        // Dosen pembimbing: hanya bimbingannya
        if ($user->hasPermissionTo('validate logbook') 
            && $internship->supervisor_id === $user->lecturer?->id) {
            return true;
        }

        // Mahasiswa: hanya kelompoknya sendiri
        if ($user->hasPermissionTo('student logbook') 
            && $internship->leader_id === $user->student?->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create an internship.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage internships');
    }

    /**
     * Determine whether the user can update an internship.
     */
    public function update(User $user, Internship $internship): bool
    {
        return $user->hasPermissionTo('manage internships');
    }

    /**
     * Determine whether the user can delete an internship.
     */
    public function delete(User $user, Internship $internship): bool
    {
        return $user->hasPermissionTo('manage internships');
    }

    /**
     * Determine whether the user can assign a supervisor.
     */
    public function assignSupervisor(User $user): bool
    {
        return $user->hasPermissionTo('manage internships');
    }
}
```

### 9.2 Controller Contoh (InternshipController)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\InternshipMember;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InternshipController extends Controller
{
    public function __construct()
    {
        // Apply policy middleware
        $this->middleware('can:view,internship')->only(['show']);
        $this->middleware('can:manage,internship')->only(['update', 'destroy']);
        $this->middleware('can:create,App\Models\Internship')->only(['store']);
    }

    /**
     * List internship groups with permission-based filtering.
     */
    public function listGroups(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->authorize('viewAny', Internship::class);

        $query = Internship::with(['leader', 'supervisor', 'company', 'theme', 'period']);

        // Filter berdasarkan permission, bukan role
        if (!$user->hasPermissionTo('manage internships')) {
            if ($user->hasPermissionTo('student logbook')) {
                // Mahasiswa: hanya kelompoknya sendiri
                $student = Student::where('user_id', $user->id)->first();
                if ($student) {
                    $query->where(function ($q) use ($student) {
                        $q->where('leader_id', $student->id)
                          ->orWhereHas('members', function ($q) use ($student) {
                              $q->where('student_id', $student->id);
                          });
                    });
                }
            } elseif ($user->hasPermissionTo('validate logbook')) {
                // Dosen pembimbing: hanya bimbingannya
                $query->where('supervisor_id', $user->lecturer?->id);
            }
        }

        $internships = $query->get();

        return response()->json([
            'success' => true,
            'data' => $internships,
        ]);
    }

    /**
     * Show a specific internship group.
     */
    public function show(Internship $internship): JsonResponse
    {
        $this->authorize('view', $internship);

        return response()->json([
            'success' => true,
            'data' => $internship->load(['leader', 'supervisor', 'company', 'theme', 'members', 'logbooks', 'reports', 'evaluations']),
        ]);
    }

    // ... other methods (store, update, destroy)
}
```

### 9.3 AuthServiceProvider (Policy Registration)

```php
<?php

namespace App\Providers;

use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\Evaluation;
use App\Policies\InternshipPolicy;
use App\Policies\LogbookPolicy;
use App\Policies\ReportPolicy;
use App\Policies\EvaluationPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Internship::class => InternshipPolicy::class,
        Logbook::class => LogbookPolicy::class,
        Report::class => ReportPolicy::class,
        Evaluation::class => EvaluationPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Admin bypass: admin selalu diizinkan
        Gate::before(function ($user, $ability) {
            if ($user->hasRole('admin')) {
                return true;
            }
        });
    }
}
```

### 9.4 Frontend PermissionGate (HOC)

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * PermissionGate - Higher Order Component untuk proteksi route/component
 * Berbasis permission, bukan role.
 *
 * @param {string} permission - Permission yang dibutuhkan (contoh: "view internships")
 * @param {React.ReactNode} children - Komponen yang dilindungi
 * @param {string} fallbackRedirect - Redirect jika tidak punya permission (default: "/")
 */
const PermissionGate = ({ permission, children, fallbackRedirect = '/' }) => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const hasPermission = user.permissions?.includes(permission);

    if (!hasPermission) {
        return <Navigate to={fallbackRedirect} replace />;
    }

    return children;
};

export default PermissionGate;
```

### 9.5 Frontend Sidebar (Permission-Based Menu)

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const permissions = user?.permissions || [];

    // Semua menu item dengan permission yang dibutuhkan
    const allMenus = [
        { id: 'dashboard', name: 'Dashboard', path: '/', icon: 'LayoutDashboard', permission: null },
        { id: 'internship-groups', name: 'Kelompok KP', path: '/internship-groups', icon: 'Users', permission: 'view internships' },
        { id: 'logbook-monitoring', name: 'Monitoring Logbook', path: '/logbook-monitoring', icon: 'Book', permission: 'view logbook monitoring' },
        { id: 'report-monitoring', name: 'Laporan KP', path: '/report-monitoring', icon: 'FileText', permission: 'view kp reports' },
        { id: 'evaluation-recap', name: 'Rekap Penilaian', path: '/evaluation-recap', icon: 'CheckSquare', permission: 'view evaluation recap' },
        { id: 'logbook-validation', name: 'Validasi Logbook', path: '/logbook-validation', icon: 'CheckSquare', permission: 'validate logbook' },
        { id: 'period-management', name: 'Periode', path: '/admin/period-management', icon: 'Calendar', permission: 'manage periods' },
        { id: 'role-management', name: 'Role & Permission', path: '/admin/role-management', icon: 'Shield', permission: 'manage roles' },
        // ... lebih banyak menu
    ];

    // Filter menu berdasarkan permission user
    const visibleMenus = allMenus.filter(menu => {
        if (!menu.permission) return true; // Menu tanpa permission selalu terlihat
        return permissions.includes(menu.permission);
    });

    return (
        <nav>
            {visibleMenus.map(menu => (
                <button
                    key={menu.id}
                    onClick={() => navigate(menu.path)}
                    className="sidebar-menu-item"
                >
                    <Icon name={menu.icon} />
                    <span>{menu.name}</span>
                </button>
            ))}
        </nav>
    );
};

export default Sidebar;
```

### 9.6 Frontend App.jsx (Feature-Based Routing)

```jsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PermissionGate from './components/PermissionGate';

// Feature-based lazy imports (tanpa prefix role)
const InternshipGroupList = lazy(() => import('./components/InternshipGroupList'));
const LogbookMonitoring = lazy(() => import('./components/LogbookMonitoring'));
const ReportMonitoring = lazy(() => import('./components/ReportMonitoring'));
const EvaluationMonitoring = lazy(() => import('./components/EvaluationMonitoring'));

const App = () => {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                {/* Universal routes - siapa pun dengan permission yang benar bisa akses */}
                <Route
                    path="/internship-groups"
                    element={
                        <PermissionGate permission="view internships">
                            <InternshipGroupList />
                        </PermissionGate>
                    }
                />
                <Route
                    path="/logbook-monitoring"
                    element={
                        <PermissionGate permission="view logbook monitoring">
                            <LogbookMonitoring />
                        </PermissionGate>
                    }
                />
                <Route
                    path="/report-monitoring"
                    element={
                        <PermissionGate permission="view kp reports">
                            <ReportMonitoring />
                        </PermissionGate>
                    }
                />
                <Route
                    path="/evaluation-recap"
                    element={
                        <PermissionGate permission="view evaluation recap">
                            <EvaluationMonitoring />
                        </PermissionGate>
                    }
                />

                {/* Legacy redirects (zero-downtime migration) */}
                <Route path="/admin/internship-groups" element={<Navigate to="/internship-groups" replace />} />
                <Route path="/dosen/internship-groups" element={<Navigate to="/internship-groups" replace />} />
                <Route path="/admin/logbook" element={<Navigate to="/logbook-monitoring" replace />} />
                <Route path="/dosen/logbook" element={<Navigate to="/logbook-monitoring" replace />} />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    );
};

export default App;
```

---

## 10. Checklist Refactoring

### Sebelum Mulai
- [ ] Backup database dan file
- [ ] Pastikan git branch baru untuk refactoring
- [ ] Pastikan semua test (jika ada) berjalan
- [ ] Pastikan Spatie Permission sudah terinstall dan berjalan

### Fase 0: Persiapan
- [ ] Buat `app/Providers/AuthServiceProvider.php`
- [ ] Daftarkan di `bootstrap/providers.php`
- [ ] Buat `app/Policies/InternshipPolicy.php`
- [ ] Buat `app/Policies/LogbookPolicy.php`
- [ ] Buat `app/Policies/ReportPolicy.php`
- [ ] Buat `app/Policies/EvaluationPolicy.php`
- [ ] Test: `php artisan policy:list`

### Fase 1: Backend Policy
- [ ] Rewrite `InternshipController` → hapus role checks, pakai `$this->authorize()`
- [ ] Rewrite `LogbookController` → hapus role checks, pakai `$this->authorize()`
- [ ] Rewrite `ReportController` → hapus role checks, pakai `$this->authorize()`
- [ ] Rewrite `EvaluationController` → hapus role checks, pakai `$this->authorize()`
- [ ] Rewrite `DashboardController` → hapus role checks
- [ ] Rewrite `ProfileController` → hapus role checks
- [ ] Rewrite `ActivityController` → hapus role checks
- [ ] Hapus role checks di `InternshipService`
- [ ] Hapus role checks di `ReportService`
- [ ] Hapus role checks di `AuthService`
- [ ] Hapus role checks di `ActivityService`
- [ ] Test semua endpoint dengan Postman

### Fase 2: Frontend Feature-Based
- [ ] Buat `resources/js/src/features/index.jsx` (barrel export)
- [ ] Buat `resources/js/src/components/InternshipGroupList.jsx` (reusable)
- [ ] Buat `resources/js/src/components/LogbookMonitoring.jsx` (reusable)
- [ ] Buat `resources/js/src/components/ReportMonitoring.jsx` (reusable)
- [ ] Buat `resources/js/src/components/EvaluationMonitoring.jsx` (reusable)
- [ ] Rewrite `App.jsx` dengan feature-based routing
- [ ] Rewrite `Sidebar.jsx` dengan permission-based menu
- [ ] Rewrite `DashboardSwitcher` dengan permission-first
- [ ] Buat wrapper thin di folder role (admin/, dosen/, dll)
- [ ] Test semua halaman di browser

### Fase 3: Route Migration
- [ ] Tambah route universal (tanpa prefix role)
- [ ] Tambah redirect dari URL lama ke URL baru
- [ ] Test semua URL lama (redirect works)
- [ ] Test semua URL baru (direct access works)
- [ ] Update sidebar links ke URL baru

### Fase 4: Cleanup
- [ ] Hapus folder role-based yang sudah tidak terpakai
- [ ] Hapus wrapper component yang sudah tidak terpakai
- [ ] Optimize bundle size
- [ ] Final testing

### Fase 5: Documentation
- [ ] Buat `ARCHITECTURE.md`
- [ ] Buat panduan menambah role baru
- [ ] Buat panduan menambah fitur baru
- [ ] Update README

---

## 11. Ringkasan Perubahan Kunci

| Aspek | Sebelum (Role-Based) | Sesudah (Permission-Based) |
|-------|---------------------|---------------------------|
| **Folder Structure** | `admin/`, `dosen/`, `student/`, `koordinator/` | `components/`, `features/`, `pages/` |
| **Authorization** | `if ($user->role === 'admin')` | `$this->authorize('view', $internship)` |
| **Route Prefix** | `/admin/internship-groups` | `/internship-groups` |
| **Sidebar Menu** | Hardcoded per role | Dynamic berdasarkan permission |
| **Dashboard** | Per-role dashboard | Single permission-based dashboard |
| **Component** | Duplikasi 3-4x per role | Single reusable component |
| **Adding New Role** | Buat folder + controller + route + view | Buat role + assign permission di DB |
| **Adding New Feature** | Duplikasi ke semua folder role | Buat 1 komponen + 1 route + 1 permission |

---

**Status: Analisis selesai. Siap untuk implementasi Fase 0.**
