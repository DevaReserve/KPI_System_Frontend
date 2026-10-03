# KPI System Frontend

Antarmuka web KPI System (PT. Cakra Media Data) dibangun dengan Vue 3, Vite, TypeScript, Pinia, PrimeVue, dan Tailwind CSS.

## Prasyarat
- [Node.js](https://nodejs.org/) 18 atau lebih baru
- Backend sudah berjalan di `http://localhost:8080` (lihat README repository `KPI_System_Backend`)

## Instalasi
1. Clone repository dan masuk ke foldernya.
   ```
   git clone <url-repo-frontend>
   cd KPI_System_Frontend
   ```
2. Salin file environment:
   ```
   copy .env.example .env
   ```
   Isi minimal:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_APP_TITLE=KPI System - PT. Cakra Media Data
   ```
3. Pasang dependency:
   ```
   npm install
   ```

## Menjalankan
```
npm run dev
```
Buka http://localhost:3000.

## Build Produksi
```
npm run build
npm run preview
```
Hasil build ada di folder `dist/`.

## Pemakaian
1. Jalankan backend terlebih dahulu, lalu frontend.
2. Login memakai akun dari database. Pada database baru, tersedia akun awal `superadmin` / `Admin@1234` (segera ganti passwordnya).
3. Menu yang tampil mengikuti role: admin, manager, atau employee.

## Troubleshooting
- **`'vite' is not recognized`**: jalankan `npm install` lebih dulu.
- **Data tidak muncul / network error**: periksa backend aktif dan `VITE_API_URL` benar. Restart `npm run dev` setelah mengubah `.env`.
- **Port 3000 terpakai**: ubah `server.port` di `vite.config.ts`, dan sesuaikan `FRONTEND_URL` di `.env` backend.
