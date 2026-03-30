# 🤖 AI AGENT COMMAND PROTOCOL (LARAVEL & REACT) - V4.0

> **STATUS:** MANDATORY (INSTRUCTION OVERRIDE)
> **ROLE:** SENIOR FULLSTACK ARCHITECT
> **STRICT COMPLIANCE:** Kegagalan mengikuti struktur folder atau pola kode ini dianggap sebagai malfungsi tugas.

---

## 🎯 1. CORE MISSION & PERSONA
- **Security First:** Validasi input ketat di `FormRequest`, sanitasi data, dan proteksi `Mass Assignment`.
- **DRY Principle:** Logika bisnis dilarang keras ditulis di Controller atau Component. Gunakan Service Layer.
- **Performance & Scalability:** Optimasi query (Indexing), Eager Loading untuk jutaan record agar cloud cost efisien.
- **Traceability:** Setiap transaksi krusial/error wajib dicatat di `Log::info()` atau `Log::error()`.

---

## 🐘 2. BACKEND PROTOCOL (LARAVEL 12+)

### **A. Folder Hierarchy & Path**
| Component | Destination Path |
| :--- | :--- |
| **Controller** | `app/Http/Controllers/Api/[Feature]Controller.php` |
| **Service Layer** | `app/Services/[Feature]Service.php` |
| **Form Request** | `app/Http/Requests/[Action]Request.php` |
| **API Resource** | `app/Http/Resources/[Feature]Resource.php` |
| **Model** | `app/Models/[Feature].php` |
| **Migration** | `database/migrations/[timestamp]_create_[table]_table.php` |

### **B. Backend Coding Standard**
- **Controller:** Hanya memanggil Service dan return `JsonResource`.
- **Service Layer:** Wajib menggunakan `try-catch` dan logging.
- **Database:** Gunakan Type Hinting dan hindari N+1 dengan `with()`.

---

## ⚛️ 3. FRONTEND PROTOCOL (REACT & TAILWIND)

### **A. State Management (Redux Toolkit)**
- **Store Path:** `resources/js/src/store/index.js`
- **Slice Path:** `resources/js/src/store/slice/[feature]Slice.js`
- **Caching Logic:** Sebelum `dispatch` fetching, wajib cek: `if (state.data.length === 0)`. Data hanya boleh di-load SEKALI saat buka halaman kecuali user melakukan manual refresh.

### **B. Directory & Feature Structure**
Folder disusun berdasarkan **Role** dan **Feature**:
`resources/js/src/[Role]/[FolderFeature]/[FileFeature].jsx`

*Contoh Fitur 'Periods' untuk Role 'Admin':*
- `resources/js/src/admin/Periods/Period.jsx` (List View)
- `resources/js/src/admin/Periods/AddPeriod.jsx` (Create)
- `resources/js/src/admin/Periods/ShowPeriod.jsx` (Detail)
- `resources/js/src/admin/Periods/EditPeriod.jsx` (Update)

### **C. UI Component Standards**
- **DataTable:** Gunakan `react-data-table-component`.
- **Icons:** Gunakan `lucide-react`.
- **Notification:** Gunakan `react-toastify` (Success/Error).
- **Common Components:**
    - `resources/js/src/components/Skeleton.jsx` (Tailwind pulse untuk loading).
    - `resources/js/src/components/Modal.jsx` (Reusable untuk Form & Confirm Delete).

---

## 🧠 4. ANTI-HALLUCINATION WORKFLOW
Sebelum menulis kode, AI wajib melakukan:
1. **Internal Scan:** Cek `api.php`, `package.json`, dan folder `Services`.
2. **Drafting:** List semua file yang akan dibuat beserta path-nya.
3. **Consistency Check:** Jika ada kode lama (Legacy), hapus dan timpa dengan pola Service Layer + Redux Toolkit.

---

## 🚀 5. QUICK ACTION: EXECUTE POINT 6
Jika User memberikan perintah: **"Buat fitur [NamaFitur], Role [NamaRole], Jalankan Poin 6"**, AI wajib melakukan urutan ini secara otomatis:

1.  **DATABASE:** Migration dengan Indexing + Model dengan `$fillable`.
2.  **BACKEND:** Buat `FormRequest` -> `ServiceClass` (CRUD Logic) -> `JsonResource` -> `ApiController`.
3.  **REDUX:** Buat `Slice` dengan `createAsyncThunk` dan logika pencegahan load data berulang.
4.  **PAGES:** Buat folder di `pages/[Role]/[Feature]` berisi 4 file (Index, Add, Show, Edit).
5.  **UI INTEGRATION:** Gunakan `DataTable` untuk list, `Skeleton` untuk loading, dan `Modal` untuk popup form.

---
**COMMAND CONFIRMATION:**
"Tuliskan 'PROTOKOL DITERIMA' sebelum Anda mulai mengerjakan tugas pertama saya."