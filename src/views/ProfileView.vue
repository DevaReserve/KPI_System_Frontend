<template>
  <div>
    <Toast />

    <div v-if="showCropModal" class="fixed inset-0 z-[60] overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 text-center">
            <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity" @click="cancelCrop"></div>
            
            <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg w-full">
                <div class="bg-white px-6 pt-6 pb-4">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Sesuaikan Foto Profil</h3>
                    
                    <div class="h-80 w-full bg-gray-900 rounded-lg overflow-hidden mb-4 relative flex items-center justify-center">
                        <cropper
                            ref="cropperRef"
                            class="cropper"
                            :src="cropImgSrc"
                            :stencil-component="CircleStencil"
                            :stencil-props="{ aspectRatio: 1/1 }"
                            image-restriction="stencil"
                        />
                    </div>
                    
                    <p class="text-xs text-gray-500 mb-4 text-center">Geser dan perbesar (scroll) untuk menyesuaikan area foto.</p>

                    <div class="flex justify-end gap-3">
                        <button 
                            @click="cancelCrop" 
                            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button 
                            @click="performCropAndUpload" 
                            :disabled="isProcessing"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm disabled:opacity-50 flex items-center"
                        >
                            <i v-if="isProcessing" class="pi pi-spin pi-spinner mr-2"></i>
                            {{ isProcessing ? 'Menyimpan...' : 'Simpan Foto' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showAchModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeAchModal"></div>
            <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div class="bg-white px-6 pt-6 pb-4">
                    <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4">
                        {{ isEditing ? 'Edit Prestasi' : 'Tambah Prestasi Baru' }}
                    </h3>
                    
                    <form @submit.prevent="submitAchievement">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Judul Sertifikat</label>
                            <input v-model="achForm.title" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Pegawai Terbaik Q1">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Perolehan</label>
                            <input v-model="achForm.date" type="date" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                            <textarea v-model="achForm.description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                {{ isEditing ? 'File Bukti' : 'Upload Bukti (PDF/JPG)' }}
                            </label>

                            <div v-if="isEditing && currentFileUrl" class="mb-2 flex items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <i class="pi pi-file text-blue-500 mr-3 text-xl"></i>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-blue-900 truncate">File saat ini tersimpan</p>
                                    <a :href="getProfilePictureUrl(currentFileUrl)" target="_blank" class="text-xs text-blue-600 hover:underline font-bold">
                                        Lihat File Lama
                                    </a>
                                </div>
                            </div>

                            <div class="relative">
                                <label class="block text-xs text-gray-500 mb-1" v-if="isEditing">
                                    Upload file baru di bawah jika ingin mengganti file lama:
                                </label>
                                <input 
                                    ref="achFile" 
                                    type="file" 
                                    :required="!isEditing" 
                                    accept=".pdf,.jpg,.jpeg,.png" 
                                    @change="handleAchFileChange" 
                                    class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                >
                            </div>
                            <p class="text-xs text-gray-600 mt-1">Jika lebih dari 1 foto, silakan upload file PDF yang berisi semua foto.</p>
                            <p class="text-xs text-gray-600 mt-1">Maksimal 5MB.</p>

                        </div>
                        <div class="mt-6 flex justify-end gap-3">
                            <button type="button" @click="closeAchModal" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Batal</button>
                            <button type="submit" :disabled="isProcessing" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
                                {{ isProcessing ? 'Menyimpan...' : 'Simpan' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Profil Saya</h1>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
      
      <div class="flex border-b border-gray-200 overflow-x-auto">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap focus:outline-none"
          :class="activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="p-6">
        
        <div v-if="activeTab === 'biodata'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="col-span-1 text-center lg:border-r lg:border-gray-100 lg:pr-8">
                <div class="relative group mx-auto w-32 h-32 mb-4">
                    <div class="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-blue-100 flex items-center justify-center relative group">
                        <img 
                            v-if="userProfile?.employee?.profile_picture_url || authStore.user?.employee?.profile_picture_url" 
                            :src="getProfilePictureUrl(userProfile?.employee?.profile_picture_url || authStore.user?.employee?.profile_picture_url)" 
                            alt="Profile" 
                            class="w-full h-full object-cover"
                            @error="handleImageError" 
                        />
                        <span v-else class="text-blue-600 font-bold text-4xl">
                            {{ userProfile?.employee?.name?.charAt(0) || authStore.user?.employee?.name?.charAt(0) || 'U' }}
                        </span>
                        
                        <label class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                            <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onSelectFile">
                            <div class="text-white text-xs font-bold flex flex-col items-center">
                                <i class="pi pi-camera text-xl mb-1"></i>
                                <span>Ubah Foto</span>
                            </div>
                        </label>
                    </div>
                </div>

                <h2 class="text-xl font-bold text-gray-900 mb-1">{{ userProfile?.employee?.name }}</h2>
                <p class="text-sm text-gray-500 mb-3">{{ userProfile?.email }}</p>
                <span class="inline-block bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                    {{ userProfile?.role }}
                </span>
            </div>

            <div class="col-span-1 lg:col-span-2 space-y-6">
                <div>
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Data Diri</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                        <div><label class="text-xs text-gray-500 block mb-1">NIP</label><p class="font-medium text-gray-900">{{ userProfile?.employee?.nip || '-' }}</p></div>
                        <div><label class="text-xs text-gray-500 block mb-1">Status</label><span class="text-green-600 text-sm font-bold">Aktif</span></div>
                    </div>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 mt-2">Informasi Pekerjaan</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="p-4 bg-gray-50 rounded-lg border border-gray-100"><label class="text-xs text-gray-500 block mb-1">Divisi</label><p class="font-bold text-gray-800">{{ userProfile?.employee?.division?.name || '-' }}</p></div>
                        <div class="p-4 bg-gray-50 rounded-lg border border-gray-100"><label class="text-xs text-gray-500 block mb-1">Jabatan</label><p class="font-bold text-gray-800">{{ userProfile?.employee?.position || '-' }}</p></div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'achievements'">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">File Prestasi</h3>
                    <p class="text-sm text-gray-500">Kumpulan sertifikat dan dokumen pendukung.</p>
                </div>
                <button 
                    @click="openCreateModal" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-all"
                >
                    <i class="pi pi-plus mr-2"></i> Upload
                </button>
            </div>

            <div v-if="achievements.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div 
                    v-for="ach in achievements" 
                    :key="ach.id" 
                    class="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col"
                >
                    <a 
                        :href="getProfilePictureUrl(ach.file_url)" 
                        target="_blank"
                        class="h-36 bg-gray-100 flex items-center justify-center relative overflow-hidden cursor-pointer"
                        title="Klik untuk melihat file"
                    >
                        <div v-if="ach.file_url.endsWith('.pdf')" class="flex flex-col items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-300">
                            <i class="pi pi-file-pdf text-red-500 text-5xl mb-2"></i>
                            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PDF DOC</span>
                        </div>
                        <img 
                            v-else 
                            :src="getProfilePictureUrl(ach.file_url)" 
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt="Preview"
                        >
                        <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </a>

                    <div class="p-3 bg-white flex items-start justify-between border-t border-gray-100 relative">
                        <div class="flex-1 min-w-0 pr-2">
                            <h4 class="text-sm font-bold text-gray-800 truncate" :title="ach.title">{{ ach.title }}</h4>
                            <p class="text-[10px] text-gray-500">{{ formatDate(ach.date) }}</p>
                        </div>

                        <button 
                            @click.stop="toggleMenu(ach.id)"
                            class="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none"
                        >
                            <i class="pi pi-ellipsis-v text-sm"></i>
                        </button>

                        <div 
                            v-if="activeMenu === ach.id" 
                            v-click-outside="closeMenu"
                            class="absolute bottom-8 right-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden text-sm animate-fade-in"
                        >
                            <button 
                                @click="openEditModal(ach)"
                                class="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 flex items-center gap-2"
                            >
                                <i class="pi pi-pencil text-xs"></i> Edit
                            </button>
                            <button 
                                @click="deleteAchievement(ach.id)"
                                class="w-full text-left px-4 py-2 hover:bg-red-50 text-gray-700 hover:text-red-600 flex items-center gap-2 border-t border-gray-50"
                            >
                                <i class="pi pi-trash text-xs"></i> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div class="bg-white p-4 rounded-full shadow-sm mb-4">
                    <i class="pi pi-folder-open text-4xl text-blue-200"></i>
                </div>
                <h4 class="text-gray-900 font-medium mb-1">Belum ada file</h4>
                <button @click="openCreateModal" class="text-blue-600 font-medium text-sm hover:underline">
                    Upload File Sekarang
                </button>
            </div>
        </div>

        <div v-if="activeTab === 'warnings'">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </span>
                Riwayat Surat Peringatan
              </h3>
              <p class="text-sm text-gray-500 mt-1 ml-10">Anda memiliki <span class="font-semibold text-red-600">{{ myWarnings.length }}</span> surat peringatan.</p>
            </div>
          </div>

          <!-- SP Cards -->
          <div class="space-y-3"
            @click="$router.push('/employee/warnings')">
            <div 
              v-for="(w, idx) in myWarnings" 
              :key="w.id"
              class="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-200 overflow-hidden"
            >
              <!-- Colored left bar -->
              <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                :class="w.level === 'SP3' ? 'bg-red-600' : w.level === 'SP2' ? 'bg-orange-500' : 'bg-yellow-400'"
              ></div>

              <div class="flex items-center gap-4 p-5 pl-6">
                <!-- Number badge -->
                <div class="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner"
                  :class="w.level === 'SP3' ? 'bg-red-100 text-red-700' : w.level === 'SP2' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-800'"
                >
                  {{ idx + 1 }}
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                      :class="w.level === 'SP3' ? 'bg-red-600 text-white' : w.level === 'SP2' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-yellow-900'"
                    >{{ w.level || 'SP' }}</span>
                    <span class="text-xs text-gray-400 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      {{ formatDate(w.issued_date || w.created_at) }}
                    </span>
                    <span v-if="w.period_name" class="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{{ w.period_name }}</span>
                  </div>
                  <p class="text-sm font-medium text-gray-800 truncate">{{ w.reason || w.description || 'Pelanggaran Kinerja' }}</p>
                </div>

                <!-- Arrow icon -->
                <button class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="$router.push('/employee/warnings')">
                    <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>


        <div v-if="activeTab === 'security'">
             <div class="max-w-xl mx-auto py-4">
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <p class="text-sm text-yellow-700">Gunakan password yang kuat untuk menjaga keamanan akun Anda.</p>
                </div>
                <form @submit.prevent="updatePassword" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                        <input v-model="passForm.old_password" type="password" required class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input v-model="passForm.new_password" type="password" required minlength="6" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                        <input v-model="passForm.confirm_password" type="password" required class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <button type="submit" :disabled="isLoading" class="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-bold transition disabled:opacity-50">
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
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, reactive, ref } from 'vue'
import { authService, employeeService, myPerformanceService, warningService } from '../services/api'
import { useAuthStore } from '../stores/auth'

// --- CROPPER ---
import { CircleStencil, Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

// --- CLICK OUTSIDE DIRECTIVE (Untuk Dropdown Menu) ---
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = function(event: Event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};

const authStore = useAuthStore()
const toast = useToast()

const tabs = computed(() => {
  const baseTabs = [
    { id: 'biodata', name: 'Biodata' },
    { id: 'achievements', name: 'Prestasi' },
    { id: 'security', name: 'Keamanan' }
  ]
  if (myWarnings.value.length > 0) {
    baseTabs.splice(2, 0, { id: 'warnings', name: 'Riwayat SP' })
  }
  return baseTabs
})

const activeTab = ref('biodata')
const userProfile = ref<any>(null)
const achievements = ref<any[]>([])
const myWarnings = ref<any[]>([])
const isLoading = ref(false)
const isProcessing = ref(false)

// State Chart & Password
const passForm = reactive({ old_password: '', new_password: '', confirm_password: '' })

// State Cropper
const showCropModal = ref(false)
const cropImgSrc = ref('')
const cropperRef = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// State Achievements (CRUD & Menu)
const showAchModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const achForm = reactive({ title: '', date: '', description: '', file: null as File | null })
const activeMenu = ref<number | null>(null)
const currentFileUrl = ref('') 
const achFile = ref<HTMLInputElement | null>(null)

// --- LIFECYCLE ---
onMounted(async () => {
  await loadData()
})

async function loadData() {
    try { 
        userProfile.value = await authService.getProfile() 
        try { achievements.value = await employeeService.getAchievements() } catch(e){}
        try { myWarnings.value = await warningService.getMyWarnings() } catch(e){}
    } catch (e) { console.error(e) }
}

function getProfilePictureUrl(url: string) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080' 
    return `${baseUrl.replace('/api', '')}${url}`
}

// --- FUNGSI CROP & UPLOAD FOTO ---
function onSelectFile(e: Event) {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    if (!file.type.includes('image/')) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Mohon pilih file gambar', life: 3000 })
        return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
        cropImgSrc.value = event.target?.result as string
        showCropModal.value = true
    }
    reader.readAsDataURL(file)
    target.value = ''
}

function cancelCrop() {
    showCropModal.value = false; cropImgSrc.value = ''
}

function performCropAndUpload() {
    if (!cropperRef.value) return
    isProcessing.value = true
    const { canvas } = cropperRef.value.getResult();
    if (canvas) {
        canvas.toBlob((blob: Blob) => {
            if (!blob) { isProcessing.value = false; return }
            const croppedFile = new File([blob], "avatar_cropped.jpg", { type: "image/jpeg" })
            uploadProfilePic(croppedFile)
            showCropModal.value = false
            isProcessing.value = false
        }, 'image/jpeg', 0.9)
    } else { isProcessing.value = false }
}

async function uploadProfilePic(file: File) {
    if (file.size > 2 * 1024 * 1024) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Maksimal 2MB', life: 3000 })
        return
    }
    try {
        const newUrl = await employeeService.uploadProfilePicture(file)
        if (userProfile.value?.employee) { userProfile.value.employee.profile_picture_url = newUrl }
        if (authStore.user && authStore.user.employee) {
            const updatedUser = JSON.parse(JSON.stringify(authStore.user))
            if (updatedUser.employee) { updatedUser.employee.profile_picture_url = newUrl }
            authStore.user = updatedUser
            localStorage.setItem('user', JSON.stringify(updatedUser))
        }
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Foto profil diperbarui', life: 3000 })
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal upload foto', life: 3000 })
    }
}

function handleImageError(e: Event) { (e.target as HTMLImageElement).style.display = 'none'; }

// --- FUNGSI PRESTASI (CRUD & MENU) ---
function toggleMenu(id: number) {
    activeMenu.value = activeMenu.value === id ? null : id
}
function closeMenu() {
    activeMenu.value = null
}

function openCreateModal() {
    isEditing.value = false
    editingId.value = null
    currentFileUrl.value = '' // Reset URL lama
    achForm.title = ''; achForm.date = ''; achForm.description = ''; achForm.file = null
    
    // Reset element input file (gunakan achFile sesuai ref di template)
    if (achFile.value) achFile.value.value = ''
    
    showAchModal.value = true
}

function openEditModal(ach: any) {
    isEditing.value = true
    editingId.value = ach.id
    
    // Isi data form
    achForm.title = ach.title
    achForm.date = ach.date ? new Date(ach.date).toISOString().split('T')[0] : ''
    achForm.description = ach.description
    
    // Set URL file lama agar muncul di UI
    currentFileUrl.value = ach.file_url 
    
    // Kosongkan file input (user belum memilih file baru)
    achForm.file = null 
    if (achFile.value) achFile.value.value = '' 

    showAchModal.value = true
    closeMenu()
}

function closeAchModal() { showAchModal.value = false; closeMenu(); }
function handleAchFileChange(event: any) { achForm.file = event.target.files[0]; }

async function submitAchievement() {
    // Validasi Wajib File HANYA SAAT CREATE (Bukan Edit)
    if (!isEditing.value && !achForm.file) {
        toast.add({ severity: 'warn', summary: 'Wajib', detail: 'File bukti harus diupload', life: 3000 })
        return
    }
    
    // Validasi Ukuran (Hanya jika ada file baru)
    if (achForm.file && achForm.file.size > 5 * 1024 * 1024) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Maksimal 5MB', life: 3000 })
        return
    }

    isProcessing.value = true
    try {
        const formData = new FormData()
        formData.append('title', achForm.title)
        formData.append('date', achForm.date)
        formData.append('description', achForm.description)
        
        // LOGIKA KUNCI: Hanya append file jika user memilih file baru
        if (achForm.file) {
            formData.append('file', achForm.file)
        }

        if (isEditing.value && editingId.value) {
            // MODE UPDATE
            await employeeService.updateAchievement(editingId.value, formData)
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Prestasi diperbarui', life: 3000 })
        } else {
            // MODE CREATE
            await employeeService.addAchievement(formData)
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Prestasi ditambahkan', life: 3000 })
        }

        // Refresh Data
        achievements.value = await employeeService.getAchievements()
        closeAchModal()
    } catch (e) {
        console.error(e) // Debugging
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan saat menyimpan', life: 3000 })
    } finally {
        isProcessing.value = false
    }
}
async function deleteAchievement(id: number) {
    if(!confirm('Hapus file prestasi ini?')) return
    try { 
        await employeeService.deleteAchievement(id)
        achievements.value = achievements.value.filter(a => a.id !== id)
        toast.add({ severity: 'success', summary: 'Terhapus', detail: 'File dihapus', life: 3000 })
    } catch(e) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus', life: 3000 })
    }
}

function formatDate(d: string) { if(!d) return '-'; return new Date(d).toLocaleDateString('id-ID'); }

async function updatePassword() {
    if (passForm.new_password !== passForm.confirm_password) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Konfirmasi password tidak cocok', life: 3000 })
        return
    }
    isLoading.value = true
    try {
        await authService.changePassword({ old_password: passForm.old_password, new_password: passForm.new_password })
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Password berhasil diubah', life: 5000 })
        passForm.old_password = ''; passForm.new_password = ''; passForm.confirm_password = ''
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal mengubah password', life: 3000 })
    } finally {
        isLoading.value = false
    }
}
</script>

<style>
/* Styling khusus untuk cropper area */
.cropper {
    height: 100%;
    width: 100%;
}
/* Animasi Dropdown */
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95) translateY(-5px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.1s ease-out forwards;
}
</style>
