# Undi Live

Aplikasi undian real-time dengan Socket.IO untuk membuat dan bergabung dengan sesi undian secara langsung.

## Fitur

- Buat sesi undian baru dengan range nomor yang dapat dikonfigurasi
- Bergabung dengan sesi yang ada menggunakan kode sesi
- Dapatkan nomor unik secara otomatis saat bergabung
- Mulai undian dan tentukan pemenang secara acak
- Antarmuka pengguna yang responsif dan mudah digunakan

## Instalasi Lokal

1. Clone repositori ini
2. Instal dependensi:
   ```
   npm install
   ```
3. Jalankan aplikasi:
   ```
   npm start
   ```
4. Buka browser dan akses `http://localhost:3001`

## Deploy ke Glitch

Lihat [GLITCH-DEPLOY.md](GLITCH-DEPLOY.md) untuk panduan lengkap tentang cara mendeploy aplikasi ini ke Glitch.

### Langkah Singkat

1. Daftar di [glitch.com](https://glitch.com/)
2. Buat proyek baru dan pilih "Import from GitHub" atau "Upload Files"
3. Unggah semua file proyek ini
4. Glitch akan secara otomatis menginstal dependensi dan menjalankan aplikasi
5. Akses aplikasi melalui URL yang diberikan oleh Glitch

## Struktur Proyek

- `server.js` - Server Node.js dengan Express dan Socket.IO
- `public/` - File statis (HTML, CSS, JavaScript)
  - `index.html` - Halaman utama aplikasi
  - `styles.css` - Styling aplikasi
  - `app.js` - Kode JavaScript client-side

## Teknologi yang Digunakan

- Node.js
- Express
- Socket.IO
- HTML/CSS/JavaScript

## Lisensi

MIT 