# Facilitator Transfer Feature

## Overview

Fitur transfer fasilitator memungkinkan fasilitator saat ini untuk menyerahkan peran fasilitator kepada participant lain dalam lobby retrospective.

## Mekanisme

### 1. **Pemilihan Participant**
- Fasilitator dapat klik langsung pada participant di lobby
- Hanya participant yang bukan fasilitator saat ini yang dapat diklik
- Participant yang dapat ditransfer ditandai dengan badge "Click to transfer role"
- Icon UserCheck muncul di sebelah participant yang dapat ditransfer

### 2. **Konfirmasi Transfer**
- Sistem menampilkan pesan konfirmasi alert sederhana
- Menampilkan nama participant yang akan menjadi fasilitator baru
- Pesan peringatan bahwa aksi ini tidak dapat dibatalkan

### 3. **Real-time Transfer**
- Fasilitator digantikan secara real-time
- Database diupdate dengan transaction untuk konsistensi
- UI diupdate otomatis untuk semua user di lobby

## API Endpoint

### POST `/api/retros/[id]/transfer-facilitator`

**Request Body:**
```json
{
  "newFacilitatorId": "participant_id_here"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Facilitator transferred successfully",
  "previousFacilitator": {
    "id": "prev_facilitator_id",
    "name": "Previous Facilitator",
    "role": "participant",
    "user_id": "user_id",
    "joined_at": "2024-01-01T00:00:00Z"
  },
  "newFacilitator": {
    "id": "new_facilitator_id",
    "name": "New Facilitator",
    "role": "facilitator",
    "user_id": "user_id",
    "joined_at": "2024-01-01T00:00:00Z"
  }
}
```

**Response Error:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Validasi

### 1. **Authorization**
- Hanya fasilitator saat ini yang dapat melakukan transfer
- Validasi berdasarkan `user_id` dari session

### 2. **Participant Validation**
- Participant target harus ada di retro yang sama
- Tidak dapat transfer ke diri sendiri
- Participant target harus memiliki role 'participant'

### 3. **Database Constraints**
- Menggunakan transaction untuk konsistensi data
- Rollback jika terjadi error

## UI Components

### TransferFacilitatorModal

**Props:**
- `isOpen: boolean` - Status modal terbuka/tertutup
- `onClose: () => void` - Function untuk menutup modal
- `participants: Participant[]` - List semua participant
- `currentFacilitator: Participant | null` - Fasilitator saat ini
- `retroId: string` - ID retro
- `onTransferSuccess: () => void` - Callback setelah transfer berhasil

**Features:**
- Dropdown untuk memilih participant
- Konfirmasi dengan detail participant yang dipilih
- Loading state saat proses transfer
- Error handling dengan toast notifications

## Database Changes

### Tabel `participants`

**Kolom `role`:**
- Tipe: `VARCHAR(20)`
- Default: `'participant'`
- Nilai yang valid: `'facilitator'`, `'participant'`

**Auto-assignment:**
- Participant pertama yang join otomatis menjadi facilitator
- Participant selanjutnya menjadi participant

## Testing

### Manual Testing

1. **Create Retro**
   ```bash
   # Buka /retro/new
   # Buat retro baru
   # User pertama otomatis menjadi facilitator
   ```

2. **Join Participants**
   ```bash
   # Share link ke participant lain
   # Participant lain akses link
   # Participant otomatis join sebagai participant
   ```

3. **Transfer Facilitator**
   ```bash
   # Fasilitator klik pada participant di list
   # Modal konfirmasi muncul dengan participant yang dipilih
   # Konfirmasi transfer
   # Verifikasi role berubah real-time
   ```

### Expected Results

- ✅ Participant yang dapat ditransfer ditandai dengan badge dan icon
- ✅ Fasilitator dapat klik langsung pada participant
- ✅ Modal konfirmasi muncul dengan participant yang dipilih
- ✅ Transfer berhasil dan role berubah real-time
- ✅ Toast notification muncul untuk konfirmasi
- ✅ UI update otomatis untuk semua user

## Error Handling

### Common Errors

1. **"Only the current facilitator can transfer facilitator role"**
   - User bukan fasilitator saat ini

2. **"New facilitator not found in this retro"**
   - Participant ID tidak valid

3. **"Cannot transfer facilitator role to yourself"**
   - Mencoba transfer ke diri sendiri

4. **"Failed to transfer facilitator"**
   - Error database atau network

### Fallback Behavior

- Modal tetap terbuka jika transfer gagal
- Error message ditampilkan di toast
- User dapat mencoba lagi atau cancel

## Security Considerations

1. **Authorization Check**
   - Validasi session user
   - Cek role fasilitator di database

2. **Input Validation**
   - Sanitasi participant ID
   - Validasi retro ID

3. **Database Transaction**
   - Atomic operation untuk update role
   - Rollback jika terjadi error

## Future Enhancements

1. **Audit Log**
   - Log semua transfer fasilitator
   - Track history perubahan role

2. **Bulk Transfer**
   - Transfer ke multiple participant
   - Co-facilitator support

3. **Temporary Transfer**
   - Transfer sementara dengan auto-revert
   - Time-based facilitator rotation 