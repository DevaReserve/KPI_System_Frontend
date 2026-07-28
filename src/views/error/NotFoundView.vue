<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-6 text-center">
    <h1 class="text-9xl font-extrabold text-blue-600 tracking-widest">404</h1>
    <div class="bg-blue-600 text-white px-2 text-sm rounded rotate-12 absolute">
      Halaman Tidak Ditemukan
    </div>
    <div class="mt-8 text-gray-500 font-medium">
      Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
    </div>
    <div class="mt-8">
      <router-link to="/" class="relative inline-block text-sm font-medium text-blue-600 group active:text-orange-500 focus:outline-none focus:ring">
        <span class="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-blue-600 group-hover:translate-y-0 group-hover:translate-x-0"></span>
        <span class="relative block px-8 py-3 bg-white border border-current">
          Kembali ke Dashboard
        </span>
      </router-link>
    </div>
  </div>
</template>
