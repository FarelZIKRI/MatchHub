# MatchHub - AI-Powered SME & Nano Influencer Matching Platform

MatchHub adalah platform inovatif yang dirancang untuk menghubungkan UMKM (Usaha Mikro, Kecil, dan Menengah) dengan Influencer. Platform ini memanfaatkan kecerdasan buatan (AI) untuk memberikan rekomendasi influencer yang paling sesuai berdasarkan niche, budget, lokasi, dan tujuan kampanye.

## Fitur Utama

- **Pencarian Influencer Cerdas**: Temukan influencer berdasarkan kategori, lokasi, dan harga.
- **Rekomendasi AI**: Dapatkan saran influencer yang dipersonalisasi menggunakan teknologi OpenAI.
- **Manajemen Pesanan**: Sistem pemesanan yang mudah untuk kolaborasi antara brand dan influencer.
- **Autentikasi Aman**: Login dan registrasi pengguna (Brand & Influencer) menggunakan Supabase Auth.
- **Profil User**: Kelola profil, portofolio, dan metrik media sosial.
- **Desain Responsif**: Antarmuka modern dan ramah seluler yang dibangun dengan Tailwind CSS.

## Teknologi yang Digunakan

### Frontend

- **React 19**: Library JavaScript untuk membangun antarmuka pengguna.
- **Vite**: Build tool yang cepat untuk pengembangan frontend modern.
- **Tailwind CSS 4**: Framework CSS utility-first untuk styling yang cepat dan fleksibel.
- **React Router 7**: Manajemen routing aplikasi.

### Backend & Layanan

- **Supabase**: Backend-as-a-Service (BaaS) untuk database (PostgreSQL), autentikasi, dan penyimpanan file.
- **EdgeOne / Node.js**: Menjalankan fungsi serverless untuk logika bisnis dan integrasi AI.
- **OpenAI API**: Engine kecerdasan buatan untuk fitur rekomendasi cerdas.

## Prasyarat

Sebelum memulai, pastikan Anda telah memiliki:

- **Node.js** (versi terbaru disarankan)
- **Akun Supabase**: Untuk database dan autentikasi.
- **API Key OpenAI**: (Opsional) Untuk fitur rekomendasi AI penuh.

## Cara Menggunakan (Lokal)

1.  Clone repositori ini:
    ```bash
    git clone https://github.com/username/MatchHub.git
    cd MatchHub
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Buat file `.env` berdasarkan contoh, isi kredensial Supabase Anda.
4.  Jalankan development server:
    ```bash
    npm run dev
    ```

## Deployment ke Tencent Cloud

Untuk panduan lengkap cara men-deploy aplikasi ini ke Tencent Cloud EdgeOne Pages, silakan lihat file [DEPLOYMENT.md](./DEPLOYMENT.md).
