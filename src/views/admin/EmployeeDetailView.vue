<template>
  <div class="p-6">
    <Toast />
    <ConfirmDialog group="headless">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm">
                <div class="rounded-full bg-red-100 text-red-600 p-4 mb-4">
                    <i class="pi pi-exclamation-triangle text-3xl"></i>
                </div>
                <span class="font-bold text-xl block mb-2 text-gray-800">{{ message.header }}</span>
                <p class="mb-6 text-gray-500 text-center text-sm">{{ message.message }}</p>
                <div class="flex gap-3 w-full">
                    <button @click="rejectCallback" class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                    <button @click="acceptCallback" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Ya, Hapus</button>
                </div>
            </div>
        </template>
    </ConfirmDialog>

    <div class="flex justify-between items-center mb-6">
        <button @click="$router.back()" class="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium transition-colors">
            <i class="pi pi-arrow-left"></i> Kembali
        </button>
        
        <button @click="openWarningModal" class="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-red-200 shadow-sm">
            <i class="pi pi-exclamation-circle"></i>
            Terbitkan SP
        </button>
    </div>

    <div v-if="isLoading" class="text-center py-20">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
    </div>

    <div v-else-if="employee" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div class="lg:col-span-4">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center sticky top-6">
                <div class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-gray-100">
                    <img v-if="employee.profile_picture_url" :src="getProfilePictureUrl(employee.profile_picture_url)" class="w-full h-full object-cover">
                    <div v-else class="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500 text-4xl font-bold">
                        {{ employee.name.charAt(0) }}
                    </div>
                </div>

                <h2 class="text-xl font-bold text-gray-800">{{ employee.name }}</h2>
                <p class="text-gray-500 text-sm mb-4">{{ employee.position }}</p>

                <div class="flex justify-center gap-2 mb-6">
                    <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase">{{ employee.division_name }}</span>
                    <span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase">Active</span>
                </div>
                
                <div v-if="warnings.length > 0" class="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-left flex items-start gap-3">
                    <i class="pi pi-info-circle text-red-500 mt-1"></i>
                    <div>
                        <p class="text-xs font-bold text-red-800 uppercase">Status Perhatian</p>
                        <p class="text-xs text-red-600">Pegawai ini memiliki {{ warnings.length }} catatan pelanggaran aktif.</p>
                    </div>
                </div>

                <div class="border-t border-gray-100 pt-4 text-left space-y-3 text-sm">
                    <div><label class="text-xs text-gray-400 uppercase font-bold">NIP</label><p class="text-gray-700 font-medium">{{ employee.nip }}</p></div>
                    <div><label class="text-xs text-gray-400 uppercase font-bold">Email</label><p class="text-gray-700 font-medium break-all">{{ employee.email }}</p></div>
                    <div>
                        <label class="text-xs text-gray-400 uppercase font-bold">No. Telepon / WhatsApp</label>
                        <p class="text-gray-700 font-medium flex items-center justify-between">
                            <span v-if="employee.phone">{{ employee.phone }}</span>
                            <span v-else class="text-gray-400 italic">Belum diisi</span>
                            <a v-if="employee.phone" :href="`https://wa.me/${employee.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`" target="_blank" class="text-green-600 hover:text-green-700 font-bold text-xs bg-green-50 px-2 py-0.5 rounded flex items-center gap-1 border border-green-200">
                                <i class="pi pi-whatsapp"></i> Chat WA
                            </a>
                        </p>
                    </div>
                    <div v-if="employee.bio"><label class="text-xs text-gray-400 uppercase font-bold">Tentang Saya / Bio</label><p class="text-gray-700 font-medium italic text-xs bg-gray-50 p-2.5 rounded border border-gray-200">"{{ employee.bio }}"</p></div>
                    <div v-if="employee.social_media"><label class="text-xs text-gray-400 uppercase font-bold">Media Sosial / LinkedIn</label><p class="text-blue-600 font-medium text-xs truncate"><a :href="employee.social_media" target="_blank" class="hover:underline flex items-center gap-1"><i class="pi pi-external-link"></i> {{ employee.social_media }}</a></p></div>
                    <div><label class="text-xs text-gray-400 uppercase font-bold">Bergabung</label><p class="text-gray-700 font-medium">{{ formatDate(employee.join_date) }}</p></div>
                </div>
            </div>
        </div>

        <div class="lg:col-span-8 space-y-6">
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center justify-between mb-4 pb-2 border-b">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-yellow-100 rounded-lg text-yellow-600"><i class="pi pi-trophy text-lg"></i></div>
                        <h3 class="text-lg font-bold text-gray-800">Prestasi & Sertifikat</h3>
                    </div>
                    <button @click="showCertificateModal = true" class="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-sm text-xs flex items-center gap-1.5 transition">
                        <i class="pi pi-print"></i> Cetak E-Sertifikat Top Performer
                    </button>
                </div>

                <div v-if="achievements.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div v-for="ach in achievements" :key="ach.id" class="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                        <a :href="getProfilePictureUrl(ach.file_url)" target="_blank" class="h-32 bg-gray-50 flex items-center justify-center relative overflow-hidden cursor-pointer">
                            <img v-if="!ach.file_url.endsWith('.pdf')" :src="getProfilePictureUrl(ach.file_url)" class="w-full h-full object-cover">
                            <div v-else class="flex flex-col items-center text-gray-400"><i class="pi pi-file-pdf text-red-500 text-3xl"></i><span class="text-[10px] font-bold mt-1">PDF</span></div>
                        </a>
                        <div class="p-3">
                            <h4 class="text-xs font-bold text-gray-800 truncate" :title="ach.title">{{ ach.title }}</h4>
                            <p class="text-[10px] text-gray-500">{{ formatDate(ach.date) }}</p>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-8 text-gray-400 text-sm italic bg-gray-50 rounded-lg border border-dashed">Belum ada data prestasi.</div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center gap-3 mb-4 pb-2 border-b border-red-100">
                    <div class="p-2 bg-red-100 rounded-lg text-red-600"><i class="pi pi-exclamation-circle text-lg"></i></div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-800">Riwayat Pelanggaran (SP)</h3>
                        <p class="text-xs text-gray-500">Catatan dan surat peringatan.</p>
                    </div>
                </div>

                <div v-if="warnings.length > 0" class="space-y-3">
                    <div v-for="warn in warnings" :key="warn.id" class="flex gap-4 p-4 rounded-lg bg-red-50 border border-red-100 relative group">
                        <div class="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-white rounded-lg border-2 border-red-200 shadow-sm">
                            <span class="text-red-600 font-bold text-lg">{{ warn.level }}</span>
                            <span class="text-[10px] text-gray-400 uppercase">Level</span>
                        </div>
                        
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <h4 class="text-sm font-bold text-gray-900">{{ warn.reason }}</h4>
                                <span class="text-xs text-gray-500">{{ formatDate(warn.issued_at) }}</span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">{{ warn.description || 'Tidak ada keterangan tambahan.' }}</p>
                            <div class="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                <i class="pi pi-user"></i> Diterbitkan oleh: <span class="font-medium text-gray-600">{{ warn.issuer?.name || 'Admin' }}</span>
                            </div>
                        </div>

                        <button @click="deleteWarning(warn)" class="absolute bottom-2 right-2 p-1 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Hapus SP">
                            <i class="pi pi-trash"></i>
                        </button>
                    </div>
                </div>
                <div v-else class="text-center py-8 text-green-600 text-sm bg-green-50 rounded-lg border border-dashed border-green-200 flex flex-col items-center">
                    <i class="pi pi-check-circle text-2xl mb-2"></i>
                    Pegawai ini bersih dari catatan pelanggaran.
                </div>
            </div>

        </div>
    </div>

    <div v-if="showWarningModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 text-center">
            <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" @click="showWarningModal = false"></div>
            <div class="bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:max-w-md w-full z-10">
                <form @submit.prevent="submitWarning">
                    <div class="px-6 py-4 border-b bg-red-50 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-red-800 flex items-center gap-2">
                            <i class="pi pi-exclamation-triangle"></i> Terbitkan Surat Peringatan
                        </h3>
                        <button type="button" @click="showWarningModal = false" class="text-red-400 hover:text-red-600"><i class="pi pi-times"></i></button>
                    </div>
                    
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tingkat Peringatan</label>
                            <select v-model="warnForm.level" required class="w-full border rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500">
                                <option value="" disabled>Pilih Level</option>
                                <option value="TEGURAN">Teguran Lisan/Tulisan</option>
                                <option value="SP1" :disabled="authStore.user?.role !== 'manager'">SP 1 (Peringatan Pertama)</option>
                                <option value="SP2" :disabled="authStore.user?.role !== 'manager'">SP 2 (Peringatan Kedua)</option>
                                <option value="SP3" :disabled="authStore.user?.role !== 'admin'">SP 3 (Peringatan Terakhir/PHK)</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Pelanggaran / Alasan</label>
                            <input v-model="warnForm.reason" type="text" required placeholder="Contoh: Terlambat > 5 kali bulan ini" class="w-full border rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Detail & Saran</label>
                            <textarea v-model="warnForm.description" rows="3" placeholder="Jelaskan detail kejadian dan harapan perbaikan..." class="w-full border rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500"></textarea>
                        </div>
                    </div>

                    <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                        <button type="button" @click="showWarningModal = false" class="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg text-sm">Batal</button>
                        <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50">
                            {{ isSubmitting ? 'Menerbitkan...' : 'Terbitkan SP' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- [MODAL E-SERTIFIKAT PENGHARGAAN TOP PERFORMER] -->
    <Dialog v-model:visible="showCertificateModal" modal header="E-Sertifikat Penghargaan Resmi" :style="{ width: '850px' }" class="no-print">
      <div class="p-6">
         <!-- PREVIEW SERTIFIKAT DI LAYAR -->
         <div id="printable-certificate" class="border-[12px] border-double border-amber-500 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/60 p-10 text-center relative overflow-hidden shadow-xl rounded-2xl">
            <div class="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>
            <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

            <div class="inline-block p-3.5 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 rounded-full mb-3 shadow-inner border border-amber-200">
               <i class="pi pi-trophy text-4xl"></i>
            </div>
            <p class="text-[11px] font-extrabold uppercase tracking-[0.35em] text-amber-800 mb-2">PT. CAKRA MEDIA DATA • KPI MANAGEMENT SYSTEM</p>
            <h1 class="text-3xl sm:text-4xl font-black text-gray-900 tracking-wide uppercase font-serif mb-6">Piagam Penghargaan</h1>
            <p class="text-sm text-gray-600 mb-6 italic">Diberikan sebagai bentuk apresiasi dan penghargaan setinggi-tingginya kepada:</p>
            
            <h2 class="text-2xl sm:text-3xl font-extrabold text-blue-950 underline decoration-amber-500 decoration-4 underline-offset-8 mb-4">{{ employee?.name }}</h2>
            <p class="text-xs font-bold text-gray-600 uppercase tracking-wide mb-6">NIP: {{ employee?.nip || '-' }} • Divisi: {{ employee?.division_name || '-' }} • Posisi: {{ employee?.position || '-' }}</p>

            <div class="max-w-xl mx-auto bg-white/90 p-6 rounded-2xl border border-amber-200/80 shadow-sm mb-8">
               <p class="text-sm sm:text-base font-medium text-gray-800 leading-relaxed">
                  Atas kontribusi luar biasa, dedikasi, serta pencapaian kinerja prima sehingga berhasil meraih predikat sebagai <br>
                  <span class="font-extrabold text-amber-600 text-lg sm:text-xl uppercase tracking-wider block mt-2.5">🌟 Top 1 Performer & Pegawai Terbaik 🌟</span>
                  pada evaluasi kinerja periode aktif ini.
               </p>
            </div>

            <div class="grid grid-cols-2 gap-8 items-end max-w-lg mx-auto pt-4 border-t border-amber-200/80 text-xs text-gray-600">
               <div class="text-center">
                  <p class="mb-12 font-medium">Diterbitkan pada tanggal:</p>
                  <p class="font-bold text-gray-900 border-t border-gray-400 inline-block px-5 pt-1.5">{{ new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) }}</p>
               </div>
               <div class="text-center">
                  <p class="mb-12 font-medium">Disahkan Oleh:</p>
                  <p class="font-bold text-gray-900 border-t border-gray-400 inline-block px-5 pt-1.5">Manajemen PT. Cakra Media Data</p>
               </div>
            </div>
         </div>

         <div class="mt-6 flex justify-end gap-3 no-print">
            <button @click="showCertificateModal = false" class="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-sm text-gray-700">Tutup</button>
            <button @click="printCertificate" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-md hover:from-amber-600 hover:to-orange-700 flex items-center gap-2 text-sm transition">
               <i class="pi pi-print"></i> Cetak PDF E-Sertifikat
            </button>
         </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Dialog from 'primevue/dialog'
// Pastikan warningService diimport
import { employeeService, warningService } from '../../services/api' 
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const showCertificateModal = ref(false)
function printCertificate() { window.print() }

const route = useRoute()
const toast = useToast()
const confirm = useConfirm()
const employeeId = route.params.id as string

const isLoading = ref(true)
const isSubmitting = ref(false)
const employee = ref<any>(null)
const achievements = ref<any[]>([])
const warnings = ref<any[]>([]) 

// State Modal Warning
const showWarningModal = ref(false)
const warnForm = reactive({ level: '', reason: '', description: '' })

onMounted(async () => {
    loadData()
})

async function loadData() {
    try {
        isLoading.value = true
        // Load Pegawai, Prestasi, dan SP secara paralel
        const [empData, achData, warnData] = await Promise.all([
            employeeService.getEmployeeById(Number(employeeId)),
            employeeService.getEmployeeAchievementsById(Number(employeeId)),
            warningService.getByEmployee(Number(employeeId)) // Load Warning dari API
        ])
        
        employee.value = empData
        achievements.value = achData
        warnings.value = warnData
    } catch (e) {
        console.error(e)
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 3000 })
    } finally {
        isLoading.value = false
    }
}

// Fungsi Buka Modal
function openWarningModal() {
    let defaultLevel = 'TEGURAN'
    if (authStore.user?.role === 'admin') defaultLevel = 'SP3'
    else if (authStore.user?.role === 'manager') defaultLevel = 'SP1'
    
    warnForm.level = defaultLevel
    warnForm.reason = ''
    warnForm.description = ''
    showWarningModal.value = true
}

// Fungsi Submit SP
async function submitWarning() {
    try {
        isSubmitting.value = true
        await warningService.create({
            employee_id: Number(employeeId),
            level: warnForm.level,
            reason: warnForm.reason,
            description: warnForm.description
        })
        
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Surat Peringatan diterbitkan', life: 3000 })
        showWarningModal.value = false
        loadData() // Reload data untuk update list SP
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal menerbitkan SP', life: 3000 })
    } finally {
        isSubmitting.value = false
    }
}

// Fungsi Hapus SP
function deleteWarning(warn: any) {
    confirm.require({
        group: 'headless',
        message: `Hapus ${warn.level} untuk pelanggaran "${warn.reason}"?`,
        header: 'Hapus Peringatan',
        accept: async () => {
            try {
                await warningService.delete(warn.id)
                toast.add({ severity: 'success', summary: 'Terhapus', detail: 'Data peringatan dihapus', life: 3000 })
                loadData()
            } catch (e) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus data', life: 3000 })
            }
        }
    })
}

function getProfilePictureUrl(url: string) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080' 
    return `${baseUrl.replace('/api', '')}${url}`
}

function formatDate(d: string) { 
    if(!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
}
</script>

<style>
@media print {
    body * {
        visibility: hidden;
    }
    #printable-certificate,
    #printable-certificate * {
        visibility: visible;
    }
    #printable-certificate {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100% !important;
        max-width: 980px !important;
        border: 10px double #f59e0b !important;
        box-shadow: none !important;
        margin: 0 !important;
        background: #fff !important;
    }
    .no-print, [class*="Navbar"], [class*="Sidebar"], [class*="Dialog"] > div > div:first-child {
        display: none !important;
    }
}
</style>
