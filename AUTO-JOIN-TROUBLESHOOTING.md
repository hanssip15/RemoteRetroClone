# Auto-Join Troubleshooting Guide

## Masalah: "Auto-join failed: Failed to auto-join retro"

### Deskripsi Masalah
Error ini muncul di console browser ketika user mengakses lobby URL, tetapi participant sebenarnya berhasil masuk ke database.

### Penyebab Umum

1. **Database Structure Mismatch**
   - Kolom `retro_id` di tabel `participants` masih bertipe integer
   - Kolom `id` di tabel `retros` masih bertipe integer
   - Kolom `role` tidak ada di tabel `participants`

2. **Foreign Key Constraint Issues**
   - Constraint yang tidak sesuai dengan tipe data baru
   - Constraint yang hilang atau rusak

3. **Unique Constraint Violations**
   - Nama participant yang duplikat dalam satu retro

### Solusi

#### 1. Debug Database Structure
Kunjungi `/debug-db` untuk melihat struktur database saat ini.

#### 2. Fix Database Structure
Klik tombol "Fix Database Structure" di halaman debug untuk:
- Mengubah tipe data ID menjadi VARCHAR(255)
- Menambahkan kolom `role` jika belum ada
- Menambahkan kolom `user_id` jika belum ada
- Memperbaiki foreign key constraints
- Menambahkan unique constraints

#### 3. Manual Database Fix
Jika tombol fix tidak berhasil, jalankan script SQL manual:

```sql
-- Fix database structure
ALTER TABLE retros ALTER COLUMN id TYPE VARCHAR(255);
ALTER TABLE participants ALTER COLUMN retro_id TYPE VARCHAR(255);
ALTER TABLE participants ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'participant';
ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- Update existing data
UPDATE participants SET role = 'participant' WHERE role IS NULL OR role = '';

-- Recreate constraints
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_retro_id_fkey;
ALTER TABLE participants ADD CONSTRAINT participants_retro_id_fkey 
    FOREIGN KEY (retro_id) REFERENCES retros(id) ON DELETE CASCADE;

ALTER TABLE participants DROP CONSTRAINT IF EXISTS unique_name_per_retro;
ALTER TABLE participants ADD CONSTRAINT unique_name_per_retro UNIQUE (retro_id, name);
```

### Verifikasi Perbaikan

1. **Cek Console Browser**
   - Error "Auto-join failed" seharusnya hilang
   - Log "Auto-join successful" seharusnya muncul

2. **Cek Database**
   - Participant seharusnya ada di database
   - Tipe data ID seharusnya VARCHAR(255)

3. **Test Auto-Join**
   - Buka lobby URL baru
   - Participant seharusnya otomatis masuk tanpa error

### Log Debug

Auto-join sekarang memiliki logging yang lebih detail:

```
=== POST /api/retros/[id]/auto-join STARTED ===
Session data: {...}
Role column exists check: true/false
Role column exists, inserting with role
Inserting with data: { retroId: "...", participantName: "...", userId: "..." }
Participant inserted with role: {...}
Auto-join successful: {...}
```

### Fallback Behavior

Jika auto-join gagal:
1. Error toast akan muncul dengan detail error
2. Participant list akan di-refresh untuk memastikan join berhasil
3. User tetap bisa menggunakan aplikasi normal

### Monitoring

Untuk monitoring berkelanjutan:
1. Cek log server untuk error database
2. Monitor halaman debug untuk struktur database
3. Test auto-join secara berkala dengan user baru 