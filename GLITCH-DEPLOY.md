# Panduan Deploy Undi Live ke Glitch

## Langkah 1: Daftar di Glitch
1. Kunjungi [https://glitch.com/](https://glitch.com/)
2. Daftar akun baru atau masuk jika sudah memiliki akun

## Langkah 2: Buat Proyek Baru
1. Klik "New Project" di dashboard Glitch
2. Pilih "Upload Files"
3. Unggah semua file proyek Anda
4. Klik "Create Project"

## Langkah 3: Konfigurasi Proyek
1. Glitch akan secara otomatis menginstal dependensi dan menjalankan aplikasi
2. Tunggu hingga proses selesai (lihat log di panel "Logs")

## Langkah 4: Akses Aplikasi
1. Glitch akan memberikan URL untuk mengakses aplikasi Anda
2. URL biasanya berbentuk: `https://nama-proyek-anda.glitch.me`
3. Bagikan URL ini kepada pengguna lain

## Catatan Penting
- Aplikasi akan "tidur" setelah 5 menit tidak aktif
- Akan "bangun" kembali saat diakses
- Untuk perubahan kode, edit langsung di editor Glitch

## Langkah 5: Fitur Glitch yang Berguna

1. **Live Reload**: Setiap perubahan yang Anda buat akan langsung terlihat
2. **Logs**: Anda bisa melihat log aplikasi di panel "Logs"
3. **Assets**: Anda bisa mengunggah file statis di panel "Assets"
4. **Tools**: Glitch menyediakan berbagai alat seperti terminal, database, dll.

## Pemecahan Masalah

- Jika aplikasi tidak berjalan, periksa log di panel "Logs"
- Pastikan semua dependensi terinstal dengan benar
- Periksa apakah port yang digunakan sudah benar (Glitch menggunakan process.env.PORT)
- Jika mengalami masalah dengan Socket.IO, pastikan konfigurasi CORS sudah benar 