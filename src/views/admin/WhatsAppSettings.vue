<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
        <i class="pi pi-whatsapp text-[200px]"></i>
      </div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-extrabold uppercase tracking-wider text-blue-200 border border-white/15 flex items-center gap-1.5">
              <i class="pi pi-cog text-xs"></i> Sistem & Keamanan
            </span>
            <span class="px-3 py-1 bg-blue-600/60 backdrop-blur rounded-full text-xs font-extrabold uppercase tracking-wider text-white border border-blue-400/25">
              Role: Admin
            </span>
          </div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight">WhatsApp Bot Settings</h1>
          <p class="text-blue-100 text-sm mt-1 max-w-2xl leading-relaxed">
            Kelola koneksi bot WhatsApp yang digunakan untuk mengirim notifikasi otomatis dan kode OTP kepada seluruh pegawai di sistem.
          </p>
        </div>
      </div>
    </div>

    <!-- Status Card -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Status Koneksi</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Real-time status dari sesi WhatsApp.
          </p>
        </div>
        <div 
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
        >
          <span class="w-2 h-2 mr-2 rounded-full" :class="isConnected ? 'bg-green-500' : 'bg-red-500'"></span>
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </div>
      </div>
      
      <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
        <!-- Connected State -->
        <div v-if="isConnected" class="text-center py-8">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900">WhatsApp Bot Aktif</h3>
          <p class="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Sistem saat ini terhubung ke WhatsApp dan siap mengirimkan pesan OTP. Anda tidak perlu melakukan scan QR lagi.
          </p>
          
          <div v-if="deviceInfo" class="mt-8 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden max-w-sm mx-auto text-left">
            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h4 class="text-sm font-semibold text-gray-700 flex items-center">
                <svg class="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detail Perangkat
              </h4>
            </div>
            <div class="p-4 space-y-4">
              <!-- Nama Device -->
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Akun</p>
                  <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ deviceInfo.push_name || 'Tidak diketahui' }}</p>
                </div>
              </div>

              <!-- Nomor WA -->
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Terhubung</p>
                  <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ deviceInfo.jid ? deviceInfo.jid.split('@')[0] : '-' }}</p>
                </div>
              </div>

              <!-- Platform -->
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Platform / OS</p>
                  <p class="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{{ deviceInfo.platform || 'Unknown' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <button 
              @click="handleLogout" 
              :disabled="isLoggingOut"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {{ isLoggingOut ? 'Memutuskan Koneksi...' : 'Putuskan Koneksi (Logout)' }}
            </button>
          </div>
        </div>

        <!-- Disconnected State (QR Code Area) -->
        <div v-else class="text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Tautkan Perangkat WhatsApp</h3>
          
          <div v-if="isLoadingStatus" class="py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p class="mt-4 text-sm text-gray-500">Memeriksa status koneksi...</p>
          </div>

          <div v-else>
            <div v-if="qrString" class="inline-block p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
              <!-- QRCode Vue Component -->
              <qrcode-vue :value="qrString" :size="250" level="M" />
              <div v-if="timeLeft > 0" class="mt-3 text-sm font-medium text-gray-600 flex items-center justify-center gap-1.5">
                <i class="pi pi-clock"></i> 
                QR Code kadaluarsa dalam: <span :class="timeLeft <= 10 ? 'text-red-600 font-bold' : 'text-indigo-600 font-bold'">{{ timeLeft }}s</span>
              </div>
              <div v-else class="mt-3 flex flex-col items-center gap-2">
                <span class="text-sm font-medium text-red-600 flex items-center gap-1.5">
                  <i class="pi pi-times-circle"></i> QR Code telah kedaluwarsa
                </span>
                <button @click="startPairingStream" class="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                  <i class="pi pi-refresh"></i> Perbarui QR Code
                </button>
              </div>
            </div>
            <div v-else-if="sseError" class="py-12">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p class="text-sm text-red-600">{{ sseError }}</p>
              <button @click="startPairingStream" class="mt-4 text-indigo-600 hover:text-indigo-900 font-medium text-sm">
                Coba Lagi
              </button>
            </div>
            <div v-else class="py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p class="mt-4 text-sm text-gray-500">Memuat QR Code...</p>
            </div>

            <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-lg mx-auto text-left">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">Instruksi:</h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <ul class="list-disc pl-5 space-y-1">
                      <li>Buka WhatsApp di HP Anda.</li>
                      <li>Pilih menu <strong>Perangkat Taut (Linked Devices)</strong>.</li>
                      <li>Scan QR Code di atas.</li>
                      <li>Tunggu hingga indikator status menjadi hijau (Connected).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { whatsappService } from '@/services/whatsappService';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const isConnected = ref(false);
const isLoadingStatus = ref(true);
const isLoggingOut = ref(false);
const deviceInfo = ref<any>(null);
const qrString = ref('');
const sseError = ref('');
const timeLeft = ref(0);
let qrTimer: number | null = null;

let wsConn: WebSocket | null = null;
const authStore = useAuthStore();

const clearTimer = () => {
  if (qrTimer) {
    window.clearInterval(qrTimer);
    qrTimer = null;
  }
};

const checkStatus = async () => {
  isLoadingStatus.value = true;
  try {
    const res = await whatsappService.getStatus();
    isConnected.value = res.data?.status === 'connected';
    deviceInfo.value = res.data?.device || null;
    
    if (!isConnected.value) {
      startPairingStream();
    }
  } catch (error) {
    console.error('Error checking status:', error);
    sseError.value = 'Gagal memeriksa status WhatsApp. Pastikan backend berjalan.';
  } finally {
    isLoadingStatus.value = false;
  }
};

const startPairingStream = () => {
  if (wsConn) {
    wsConn.close();
  }

  const token = authStore.token;
  if (!token) {
    console.warn('No token found, stopping WA pairing stream');
    return;
  }

  qrString.value = '';
  sseError.value = '';

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const wsUrlBase = baseUrl.replace(/^http/, 'ws');
  const url = `${wsUrlBase}/admin/wa/pair-stream?token=${token}`;

  wsConn = new WebSocket(url);

  wsConn.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      if (parsed.event === 'qr') {
        console.log('Received new QR Code');
        qrString.value = parsed.data;
        
        // Start countdown for QR expiration
        clearTimer();
        timeLeft.value = 40; // Default expiry is typically ~40s
        qrTimer = window.setInterval(() => {
          if (timeLeft.value > 0) {
            timeLeft.value--;
          } else {
            clearTimer();
          }
        }, 1000);

      } else if (parsed.event === 'success') {
        console.log('Pairing successful');
        isConnected.value = true;
        qrString.value = '';
        clearTimer();
        if (wsConn) {
          wsConn.close();
        }
        if (parsed.data !== 'already_logged_in') {
          Swal.fire({
            icon: 'success',
            title: 'WhatsApp Terhubung!',
            text: 'Bot WhatsApp berhasil dipasangkan dan siap beroperasi.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else if (parsed.event === 'error') {
        console.error('WS reported error:', parsed.data);
        sseError.value = 'Koneksi ke server terputus. Mengulang kembali...';
        setTimeout(() => {
          if (!isConnected.value && authStore.token) {
            startPairingStream();
          }
        }, 3000);
        if (wsConn) wsConn.close();
      }
    } catch (err) {
      console.error('Error parsing WS message', err);
    }
  };

  wsConn.onerror = (e) => {
    console.error('WS Error:', e);
    sseError.value = 'Koneksi ke server terputus. Mengulang kembali...';
    clearTimer();
    setTimeout(() => {
      if (!isConnected.value && authStore.token) {
        startPairingStream();
      }
    }, 3000);
  };
};

const handleLogout = async () => {
  const confirm = await Swal.fire({
    title: 'Putuskan Koneksi WhatsApp?',
    text: "Sesi bot akan dihapus. Anda harus men-scan ulang QR Code untuk menghubungkannya kembali.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Putuskan!'
  });

  if (confirm.isConfirmed) {
    isLoggingOut.value = true;
    try {
      await whatsappService.logout();
      isConnected.value = false;
      Swal.fire('Terputus!', 'Sesi WhatsApp berhasil diputuskan.', 'success');
      startPairingStream();
    } catch (error) {
      console.error('Failed to logout WA:', error);
      Swal.fire('Error', 'Gagal memutus sesi WhatsApp', 'error');
    } finally {
      isLoggingOut.value = false;
    }
  }
};

let isComponentMounted = true;

onMounted(() => {
  isComponentMounted = true;
  checkStatus();
});

onUnmounted(() => {
  isComponentMounted = false;
  clearTimer();
  if (wsConn) {
    wsConn.close();
    wsConn = null;
  }
});
</script>
