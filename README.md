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

### 3. Setup Google OAuth

#### Create Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application Type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.com/api/auth/callback/google` (for production)
7. Copy Client ID and Client Secret

### 4. Setup Database

#### Buat Database di Neon:
1. Kunjungi [Neon Console](https://console.neon.tech)
2. Buat project baru
3. Copy connection string

#### Setup Environment Variables:
Buat file \`.env.local\` di root project:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# NextAuth
VITE_BACKEND_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
\`\`\`

#### Generate JWT Secret:
\`\`\`bash
# Using Node.js (Windows/Linux/Mac)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using OpenSSL (Linux/Mac)
openssl rand -base64 32
\`\`\`

#### Inisialisasi Database:
Jalankan script SQL untuk membuat tabel:

\`\`\`bash
# Run the database initialization script
# This will create the users table and update existing tables
psql $DATABASE_URL -f scripts/update-users-table.sql
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

### Tabel \`users\`
- \`id\`: Primary key (Google OAuth ID)
- \`email\`: Email user (unique)
- \`name\`: Nama lengkap user
- \`image_url\`: URL foto profil Google
- \`created_at\`, \`updated_at\`: Timestamps

### Tabel \`retros\`
- \`id\`: Primary key
- \`title\`: Judul retrospektif
- \`description\`: Deskripsi (opsional)
- \`team_size\`: Jumlah anggota tim
- \`duration\`: Durasi dalam menit
- \`status\`: Status (draft, active, completed)
- \`created_by\`: Foreign key ke users (creator)
- \`created_at\`, \`updated_at\`: Timestamps

### Tabel \`retro_items\`
- \`id\`: Primary key
- \`retro_id\`: Foreign key ke retros
- \`type\`: Tipe item (went_well, improve, action_item)
- \`content\`: Konten feedback
- \`author\`: Nama author
- \`user_id\`: Foreign key ke users (author)
- \`votes\`: Jumlah votes
- \`created_at\`: Timestamp

### Tabel \`participants\`
- \`id\`: Primary key
- \`retro_id\`: Foreign key ke retros
- \`name\`: Nama participant
- \`user_id\`: Foreign key ke users
- \`role\`: Role dalam retro (facilitator, participant)
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

1. **Sign In**: Klik "Sign In" dan login dengan Google
2. **Buat Retrospektif Baru**:
   - Klik "Start Retro" di homepage atau "New Retro" di dashboard
   - Isi form dengan judul dan detail retrospektif
   - Klik "Create Retrospective"
3. **Bagikan Link**: Share link retrospektif ke anggota tim
4. **Join Session**: Tim members sign in dan join retro session
5. **Mulai Sesi**: Tim bisa mulai menambahkan feedback
6. **Review Results**: Lihat hasil di dashboard

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
