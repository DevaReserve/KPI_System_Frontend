<template>
  <div class="p-6">
    <button @click="$router.back()" class="mb-4 text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium transition-colors">
        <i class="pi pi-arrow-left"></i> Kembali ke Daftar Pegawai
    </button>

    <div v-if="isLoading" class="text-center py-20">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
    </div>

    <div v-else-if="employee" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center sticky top-6">
                <div class="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-gray-100">
                    <img 
                        v-if="employee.profile_picture_url" 
                        :src="getProfilePictureUrl(employee.profile_picture_url)" 
                        class="w-full h-full object-cover"
                    >
                    <div v-else class="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500 text-5xl font-bold">
                        {{ employee.name.charAt(0) }}
                    </div>
                </div>

                <h2 class="text-2xl font-bold text-gray-800">{{ employee.name }}</h2>
                <p class="text-gray-500 mb-4">{{ employee.position }}</p>

                <div class="flex justify-center gap-2 mb-6">
                    <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        {{ employee.division_name }}
                    </span>
                    <span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        Active
                    </span>
                </div>

                <div class="border-t border-gray-100 pt-4 text-left space-y-3">
                    <div>
                        <label class="text-xs text-gray-400 uppercase font-bold">NIP</label>
                        <p class="text-gray-700 font-medium">{{ employee.nip }}</p>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 uppercase font-bold">Email</label>
                        <p class="text-gray-700 font-medium break-all">{{ employee.email }}</p>
                    </div>
                    <div>
                        <label class="text-xs text-gray-400 uppercase font-bold">Bergabung Sejak</label>
                        <p class="text-gray-700 font-medium">{{ formatDate(employee.join_date) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                <div class="flex items-center gap-3 mb-6 border-b pb-4">
                    <div class="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                        <i class="pi pi-trophy text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">Prestasi & Sertifikat</h3>
                        <p class="text-sm text-gray-500">Rekam jejak pencapaian pegawai.</p>
                    </div>
                </div>

                <div v-if="achievements.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div 
                        v-for="ach in achievements" 
                        :key="ach.id" 
                        class="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
                    >
                        <a 
                            :href="getProfilePictureUrl(ach.file_url)" 
                            target="_blank"
                            class="h-40 bg-gray-50 flex items-center justify-center relative overflow-hidden cursor-pointer"
                        >
                            <div v-if="ach.file_url.endsWith('.pdf')" class="flex flex-col items-center text-gray-400 group-hover:scale-105 transition-transform">
                                <i class="pi pi-file-pdf text-red-500 text-5xl mb-2"></i>
                                <span class="text-[10px] font-bold uppercase">PDF Document</span>
                            </div>
                            <img 
                                v-else 
                                :src="getProfilePictureUrl(ach.file_url)" 
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            >
                            <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span class="bg-white p-2 rounded-full shadow-lg text-gray-700">
                                    <i class="pi pi-eye"></i>
                                </span>
                            </div>
                        </a>

                        <div class="p-3">
                            <h4 class="text-sm font-bold text-gray-800 truncate" :title="ach.title">{{ ach.title }}</h4>
                            <p class="text-xs text-gray-500 mb-2">{{ formatDate(ach.date) }}</p>
                            <p class="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100">
                                {{ ach.description || 'Tidak ada deskripsi.' }}
                            </p>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <i class="pi pi-folder-open text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500 font-medium">Belum ada prestasi yang diupload.</p>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { employeeService } from '../../services/api'

const route = useRoute()
const employeeId = route.params.id as string

const isLoading = ref(true)
const employee = ref<any>(null)
const achievements = ref<any[]>([])

onMounted(async () => {
    try {
        // Load Data Pegawai & Prestasi secara paralel
        const [empData, achData] = await Promise.all([
            employeeService.getEmployeeById(Number(employeeId)),
            employeeService.getEmployeeAchievementsById(Number(employeeId))
        ])
        
        employee.value = empData
        achievements.value = achData
    } catch (e) {
        console.error("Gagal memuat data", e)
    } finally {
        isLoading.value = false
    }
})

function getProfilePictureUrl(url: string) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080' 
    return `${baseUrl.replace('/api', '')}${url}`
}

function formatDate(d: string) { 
    if(!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
}
</script>
