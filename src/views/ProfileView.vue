<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Profil Saya</h1>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      <div class="flex border-b border-gray-200">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="px-6 py-4 text-sm font-medium transition-colors border-b-2"
          :class="activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="p-6">
        
        <div v-if="activeTab === 'general'" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="col-span-1 text-center">
            <div class="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl mx-auto mb-4 border-4 border-white shadow-sm">
              {{ userProfile?.employee?.name?.charAt(0) || 'U' }}
            </div>
            <h2 class="text-xl font-bold text-gray-900">{{ userProfile?.employee?.name }}</h2>
            <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mt-2">
              {{ userProfile?.role }}
            </span>
          </div>
          <div class="col-span-2 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-xs text-gray-400 uppercase font-bold">NIP</label><p class="font-medium">{{ userProfile?.employee?.nip || '-' }}</p></div>
              <div><label class="text-xs text-gray-400 uppercase font-bold">Email</label><p class="font-medium">{{ userProfile?.email }}</p></div>
              <div><label class="text-xs text-gray-400 uppercase font-bold">No. HP</label><p class="font-medium text-gray-500 italic">(Belum tersedia)</p></div>
              <div><label class="text-xs text-gray-400 uppercase font-bold">Alamat</label><p class="font-medium text-gray-500 italic">(Belum tersedia)</p></div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'job'">
          <div class="grid grid-cols-2 gap-6">
            <div class="p-4 bg-gray-50 rounded-lg">
              <label class="text-xs text-gray-400 uppercase font-bold block mb-1">Divisi</label>
              <p class="font-bold text-lg text-gray-800">{{ userProfile?.employee?.division?.name || '-' }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <label class="text-xs text-gray-400 uppercase font-bold block mb-1">Jabatan</label>
              <p class="font-bold text-lg text-gray-800">{{ userProfile?.employee?.position || '-' }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <label class="text-xs text-gray-400 uppercase font-bold block mb-1">Tanggal Bergabung</label>
              <p class="font-bold text-lg text-gray-800">{{ formatDate(userProfile?.employee?.join_date) }}</p>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'security'">
          <div class="max-w-md">
            <h3 class="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Ganti Password</h3>
            
            <form @submit.prevent="updatePassword">
              
              <div v-if="message.text" :class="`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`">
                {{ message.text }}
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                <input v-model="passForm.old_password" type="password" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan password saat ini">
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input v-model="passForm.new_password" type="password" required minlength="6" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Minimal 6 karakter">
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input v-model="passForm.confirm_password" type="password" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ulangi password baru">
              </div>

              <button 
                type="submit" 
                :disabled="isLoading"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ isLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { authService } from '../services/api'

// Hapus tab 'family'
const tabs = [
  { id: 'general', name: 'Umum' },
  { id: 'job', name: 'Pekerjaan' },
  { id: 'security', name: 'Keamanan' }
]

const activeTab = ref('general')
const userProfile = ref<any>(null)
const isLoading = ref(false)

// State untuk form password
const passForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const message = reactive({ type: '', text: '' })

onMounted(async () => {
  try { userProfile.value = await authService.getProfile() } catch (e) {}
})

function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(dateString))
}

async function updatePassword() {
  message.text = ''
  
  if (passForm.new_password !== passForm.confirm_password) {
    message.type = 'error'
    message.text = 'Password baru dan konfirmasi tidak cocok.'
    return
  }

  try {
    isLoading.value = true
    // Memanggil API changePassword (pastikan endpoint ini sudah ada di api.ts)
    await authService.changePassword({
      old_password: passForm.old_password,
      new_password: passForm.new_password
    })
    
    message.type = 'success'
    message.text = 'Password berhasil diubah. Silakan gunakan password baru saat login berikutnya.'
    
    // Reset Form
    passForm.old_password = ''
    passForm.new_password = ''
    passForm.confirm_password = ''
    
  } catch (error: any) {
    message.type = 'error'
    // Tampilkan pesan error dari backend jika ada, atau pesan default
    message.text = error.response?.data?.message || 'Gagal mengubah password. Pastikan password lama benar.'
  } finally {
    isLoading.value = false
  }
}
</script>
