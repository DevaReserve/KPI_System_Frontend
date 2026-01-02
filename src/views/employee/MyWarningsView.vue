<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="mb-6">
      <button @click="$router.push('/')" class="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium mb-4">
        <i class="pi pi-arrow-left"></i> Kembali ke Dashboard
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Catatan Pelanggaran & Peringatan</h1>
      <p class="text-gray-500 text-sm">Berikut adalah riwayat surat peringatan yang diterbitkan untuk Anda.</p>
    </div>

    <div v-if="isLoading" class="text-center py-20">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
    </div>

    <div v-else-if="warnings.length > 0" class="space-y-4">
        <div v-for="warn in warnings" :key="warn.id" class="bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
            <div class="flex flex-col items-center justify-center min-w-[100px]">
                <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl border-4 border-white shadow-md">
                    {{ warn.level }}
                </div>
                <span class="text-xs text-gray-400 mt-2 font-medium">{{ formatDate(warn.issued_at) }}</span>
            </div>

            <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ warn.reason }}</h3>
                <p class="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                    "{{ warn.description || 'Tidak ada deskripsi detail.' }}"
                </p>
                <div class="mt-4 flex items-center gap-2 text-xs text-gray-400">
                    <i class="pi pi-user-edit"></i>
                    <span>Diterbitkan oleh: <span class="font-bold text-gray-600">{{ warn.issuer?.name || 'Management' }}</span></span>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-check text-3xl text-green-600"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-800">Bersih!</h3>
        <p class="text-gray-500">Anda tidak memiliki catatan pelanggaran aktif.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { warningService } from '../../services/api'

const warnings = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
    try {
        warnings.value = await warningService.getMyWarnings()
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
})

function formatDate(d: string) {
    if(!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
