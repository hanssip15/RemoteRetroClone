# RemoteRetro

RemoteRetro adalah aplikasi web untuk melakukan retrospektif tim secara remote. Aplikasi ini memungkinkan tim yang tersebar untuk berkolaborasi dalam sesi retrospektif yang terstruktur dan produktif.

## 🚀 Fitur Utama

- **Real-time Collaboration**: Kolaborasi tim secara real-time
- **Structured Feedback**: Organisasi feedback dengan kategori "What Went Well", "What Could Improve", dan "Action Items"
- **Dashboard Analytics**: Pelacakan progress tim dari waktu ke waktu
- **Responsive Design**: Dapat diakses dari berbagai perangkat
- **Easy Setup**: Setup yang mudah dan cepat

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 dengan App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan Neon
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 📋 Prerequisites

Sebelum memulai, pastikan Anda memiliki:

- Node.js 18+ terinstall
- npm atau yarn
- Akun Neon Database (gratis)
- Akun Vercel (gratis)

## 🚀 Quick Start

### 1. Clone Repository

\`\`\`bash
git clone <repository-url>
cd remote-retro
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Setup Database

#### Buat Database di Neon:
1. Kunjungi [Neon Console](https://console.neon.tech)
2. Buat project baru
3. Copy connection string

#### Setup Environment Variables:
Buat file \`.env.local\` di root project:

\`\`\`env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
\`\`\`

#### Inisialisasi Database:
Jalankan script SQL untuk membuat tabel:

\`\`\`bash
# Script akan dijalankan otomatis saat pertama kali mengakses API
# Atau Anda bisa menjalankan script SQL secara manual di Neon Console
\`\`\`

### 4. Jalankan Development Server

\`\`\`bash
npm run dev
\`\`\`

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Struktur Project

\`\`\`
remote-retro/
├── app/
│   ├── api/
│   │   └── retros/
│   │       └── route.ts          # API endpoints untuk retros
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard page
│   ├── retro/
│   │   └── new/
│   │       └── page.tsx          # Form buat retro baru
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/
│   └── ui/                       # shadcn/ui components
├── scripts/
│   └── init-database.sql         # Database initialization
├── lib/
│   └── utils.ts                  # Utility functions
└── README.md
\`\`\`

## 🗄️ Database Schema

### Tabel \`retros\`
- \`id\`: Primary key
- \`title\`: Judul retrospektif
- \`description\`: Deskripsi (opsional)
- \`team_size\`: Jumlah anggota tim
- \`duration\`: Durasi dalam menit
- \`status\`: Status (draft, active, completed)
- \`created_at\`, \`updated_at\`: Timestamps

### Tabel \`retro_items\`
- \`id\`: Primary key
- \`retro_id\`: Foreign key ke retros
- \`type\`: Tipe item (went_well, improve, action_item)
- \`content\`: Konten feedback
- \`author\`: Nama author
- \`votes\`: Jumlah votes
- \`created_at\`: Timestamp

### Tabel \`participants\`
- \`id\`: Primary key
- \`retro_id\`: Foreign key ke retros
- \`name\`: Nama participant
- \`joined_at\`: Timestamp bergabung

## 🚀 Deployment ke Vercel

### 1. Push ke Git Repository

\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### 2. Deploy ke Vercel

1. Kunjungi [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik "New Project"
3. Import repository Anda
4. Tambahkan environment variable:
   - \`DATABASE_URL\`: Connection string Neon Anda

### 3. Konfigurasi Domain (Opsional)

Setelah deployment berhasil, Anda bisa menambahkan custom domain di Vercel dashboard.

## 📖 Cara Penggunaan

### Untuk User Awam:

1. **Akses Aplikasi**: Buka URL aplikasi di browser
2. **Buat Retrospektif Baru**:
   - Klik "Start Retro" di homepage
   - Isi form dengan judul dan detail retrospektif
   - Klik "Create Retrospective"
3. **Bagikan Link**: Share link retrospektif ke anggota tim
4. **Mulai Sesi**: Tim bisa mulai menambahkan feedback
5. **Review Results**: Lihat hasil di dashboard

### Untuk Developer:

#### Menambah API Endpoint Baru:
\`\`\`typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  // Implementation
}
\`\`\`

#### Menambah Page Baru:
\`\`\`typescript
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>
}
\`\`\`

## 🔧 Development Commands

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
\`\`\`

## 🌟 Fitur yang Akan Datang

- [ ] Real-time collaboration dengan WebSocket
- [ ] Export hasil retrospektif ke PDF
- [ ] Template retrospektif yang dapat dikustomisasi
- [ ] Integrasi dengan Slack/Teams
- [ ] Analytics dan reporting yang lebih detail
- [ ] Mobile app

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit changes (\`git commit -m 'Add amazing feature'\`)
4. Push ke branch (\`git push origin feature/amazing-feature\`)
5. Buat Pull Request

## 📝 License

Project ini menggunakan MIT License. Lihat file \`LICENSE\` untuk detail.

## 🆘 Troubleshooting

### Database Connection Error
- Pastikan \`DATABASE_URL\` sudah benar di \`.env.local\`
- Cek koneksi internet
- Pastikan Neon database aktif

### Build Error di Vercel
- Pastikan semua environment variables sudah diset
- Cek logs di Vercel dashboard
- Pastikan tidak ada syntax error

### Styling Issues
- Jalankan \`npm run build\` untuk cek error
- Pastikan Tailwind classes valid
- Clear browser cache

## 📞 Support

Jika mengalami masalah:
1. Cek dokumentasi ini
2. Lihat GitHub Issues
3. Buat issue baru dengan detail error

---

**Happy Retrospecting! 🎉**
