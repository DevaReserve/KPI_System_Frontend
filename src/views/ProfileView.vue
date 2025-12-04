<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Profil Saya</h1>
      <p class="text-gray-600 text-sm mt-1">Kelola informasi akun dan keamanan Anda.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div class="md:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div class="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl mx-auto mb-4 border-4 border-white shadow-sm">
            {{ userProfile?.employee?.name?.charAt(0) || 'U' }}
          </div>
          
          <h2 class="text-xl font-bold text-gray-900">{{ userProfile?.employee?.name || userProfile?.username }}</h2>
          <p class="text-sm text-gray-500 mb-4">{{ userProfile?.employee?.position || userProfile?.role }}</p>
          
          <div class="border-t border-gray-100 pt-4 text-left space-y-3">
            <div>
              <span class="text-xs font-bold text-gray-400 uppercase block">NIP</span>
              <span class="text-sm font-medium text-gray-800">{{ userProfile?.employee?.nip || '-' }}</span>
            </div>
            <div>
              <span class="text-xs font-bold text-gray-400 uppercase block">Email</span>
              <span class="text-sm font-medium text-gray-800">{{ userProfile?.email }}</span>
            </div>
            <div>
              <span class="text-xs font-bold text-gray-400 uppercase block">Divisi</span>
              <span class="text-sm font-medium text-gray-800">{{ userProfile?.employee?.division?.name || '-' }}</span>
            </div>
            <div>
              <span class="text-xs font-bold text-gray-400 uppercase block">Username Login</span>
              <span class="text-sm font-medium text-gray-800">@{{ userProfile?.username }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="md:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Ganti Password</h3>
          
          <form @submit.prevent="updatePassword" class="max-w-md">
            
            <div v-if="message.text" :class="`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`">
              {{ message.text }}
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
              <input v-model="form.old_password" type="password" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input v-model="form.new_password" type="password" required minlength="6" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <p class="text-xs text-gray-500 mt-1">Minimal 6 karakter.</p>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
              <input v-model="form.confirm_password" type="password" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <button 
              type="submit" 
              :disabled="isLoading"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}
            </button>

          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { authService } from '../services/api'

const userProfile = ref<any>(null)
const isLoading = ref(false)
const message = reactive({ type: '', text: '' })

const form = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

onMounted(async () => {
  try {
    // Ambil data profile lengkap dari backend
    userProfile.value = await authService.getProfile()
  } catch (e) {
    console.error(e)
  }
})

async function updatePassword() {
  message.text = ''
  
  if (form.new_password !== form.confirm_password) {
    message.type = 'error'
    message.text = 'Password baru dan konfirmasi tidak cocok.'
    return
  }

  try {
    isLoading.value = true
    await authService.changePassword({
      old_password: form.old_password,
      new_password: form.new_password
    })
    
    message.type = 'success'
    message.text = 'Password berhasil diubah. Silakan gunakan password baru saat login berikutnya.'
    
    // Reset Form
    form.old_password = ''
    form.new_password = ''
    form.confirm_password = ''
    
  } catch (error: any) {
    message.type = 'error'
    message.text = error.response?.data?.message || 'Gagal mengubah password'
  } finally {
    isLoading.value = false
  }
}
</script>
