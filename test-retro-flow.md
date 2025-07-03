# Test Retro Flow

## Masalah yang Ditemukan dan Diperbaiki

### 1. **Masalah ID Generation**
- **Sebelum**: ID terlalu panjang dan kompleks
  ```typescript
  const id = generateId(20) + `-${Date.now()}`.slice(-10)
  // Hasil: "aB3cD9eF2gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3-1234567890"
  ```
- **Sesudah**: ID lebih sederhana
  ```typescript
  const id = generateId(12)
  // Hasil: "aB3cD9eF2gH4"
  ```

### 2. **Masalah Frontend Validation**
- **Sebelum**: Frontend mencoba parse ID sebagai number
  ```typescript
  const numericRetroId = Number.parseInt(retroId, 10)
  if (isNaN(numericRetroId)) {
    setError("Invalid retro ID")
  }
  ```
- **Sesudah**: Frontend validasi sebagai string
  ```typescript
  if (!retroId || retroId.trim().length === 0) {
    setError("Invalid retro ID")
  }
  ```

### 3. **Masalah Interface Types**
- **Sebelum**: Interface mendefinisikan ID sebagai number
  ```typescript
  interface Retro {
    id: number
    // ...
  }
  ```
- **Sesudah**: Interface mendefinisikan ID sebagai string
  ```typescript
  interface Retro {
    id: string
    // ...
  }
  ```

## Alur yang Diperbaiki

### 1. **Create Retro**
1. User mengisi form di `/retro/new`
2. POST ke `/api/retros` dengan data retro
3. Backend generate ID string (12 karakter)
4. Insert ke database dengan ID string
5. Return retro object dengan ID string
6. Frontend redirect ke `/retro/{id}/lobby`

### 2. **Access Lobby**
1. User akses `/retro/{id}/lobby`
2. Frontend validasi ID sebagai string (bukan number)
3. Call API `/api/retros/{id}/lobby`
4. Backend query database dengan ID string
5. Return lobby data
6. Auto-join user sebagai participant

### 3. **Auto-Join Process**
1. User akses lobby URL
2. Frontend call `/api/retros/{id}/auto-join`
3. Backend generate participant name
4. Insert participant ke database dengan retro_id string
5. Return participant data
6. Frontend show toast notification

## Testing Steps

1. **Create New Retro**
   ```bash
   # Buka http://localhost:3000/retro/new
   # Isi form dan submit
   # Periksa console untuk ID yang di-generate
   ```

2. **Access Lobby**
   ```bash
   # Copy URL lobby yang di-redirect
   # Buka di browser baru/incognito
   # Seharusnya tidak ada error "Invalid Retro ID"
   ```

3. **Check Database**
   ```sql
   SELECT * FROM retros ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM participants WHERE retro_id = 'ID_YANG_DIGENERATE';
   ```

4. **Test Auto-Join**
   ```bash
   # Share URL lobby ke user lain
   # User lain akses URL
   # Seharusnya otomatis join sebagai participant
   ```

5. **Test Facilitator Transfer**
   ```bash
   # Fasilitator klik pada participant di list (yang bukan facilitator)
   # Modal konfirmasi muncul dengan participant yang dipilih
   # Konfirmasi transfer
   # Verifikasi role berubah real-time
   ```

## Expected Results

- ✅ Retro berhasil dibuat dengan ID string
- ✅ Lobby bisa diakses tanpa error "Invalid Retro ID"
- ✅ Auto-join berfungsi dengan baik
- ✅ Participant list update real-time
- ✅ Toast notification muncul saat join berhasil
- ✅ Participant pertama otomatis menjadi facilitator
- ✅ Transfer fasilitator berfungsi dengan baik

## Troubleshooting

### Auto-Join Issues

Jika ada masalah dengan auto-join:
1. **Cek Console Browser** - Error "Auto-join failed" akan muncul
2. **Cek Log Server** - Detail error akan muncul di console server
3. **Debug Database** - Kunjungi `/debug-db` untuk melihat struktur database
4. **Fix Database** - Klik "Fix Database Structure" jika ada masalah struktur

### Common Issues

1. **"Failed to auto-join retro"** - Biasanya masalah struktur database
2. **"Invalid retro ID"** - ID format tidak sesuai
3. **"Name already taken"** - Nama participant duplikat

### Debug Steps

1. Buka `/debug-db` untuk melihat struktur database
2. Cek apakah kolom `retro_id` bertipe VARCHAR(255)
3. Cek apakah kolom `role` ada di tabel participants
4. Jalankan "Fix Database Structure" jika diperlukan
5. Test ulang auto-join dengan lobby baru

### Database Structure Check

Pastikan struktur database sudah benar:

```sql
-- Check retros table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'retros' AND column_name = 'id';

-- Check participants table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'participants' AND column_name IN ('retro_id', 'role', 'user_id');
```

Expected results:
- `retros.id`: VARCHAR(255)
- `participants.retro_id`: VARCHAR(255)
- `participants.role`: VARCHAR(20)
- `participants.user_id`: VARCHAR(255) 