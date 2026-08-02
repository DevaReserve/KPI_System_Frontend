<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-6 text-center">
    <div class="mb-8">
      <svg class="w-24 h-24 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h1 class="text-4xl font-bold text-gray-800 mb-4">Akses Ditolak (403)</h1>
    <p class="text-gray-600 mb-8 max-w-md">
      Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya untuk pengguna dengan hak akses tertentu.
    </p>
    <router-link to="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">
      Kembali ke Dashboard Aman
    </router-link>
  </div>
</template>
