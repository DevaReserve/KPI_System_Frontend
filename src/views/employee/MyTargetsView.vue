<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Target KPI Saya</h1>
        <p class="text-gray-500 text-sm">Daftar target yang harus dicapai pada periode evaluasi.</p>
      </div>

      <div class="flex gap-3 w-full sm:w-auto items-center">
        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
            Pilih Periode
        </label>
        <div class="relative w-full sm:w-64">
            <select 
                v-model="selectedPeriodId" 
                @change="loadMyTargets" 
                class="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out appearance-none"
            >
                <option v-for="p in periods" :key="p.id" :value="p.id">
                    {{ p.name }} {{ p.is_active ? '(Aktif)' : '' }}
                </option>
                <option value="" v-if="periods.length === 0">Tidak ada periode</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <i class="pi pi-chevron-down text-xs"></i>
            </div>
        </div>
      </div>
    </div>

    <!-- BLOCKED STATE: PROFIL BELUM LENGKAP -->
    <div v-if="!isProfileComplete" class="bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center max-w-2xl mx-auto mt-10">
        <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <i class="pi pi-lock text-4xl text-red-500"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">Akses Dibatasi</h2>
        <p class="text-gray-600 mb-6 leading-relaxed">
            Anda belum bisa melihat Target KPI karena <b>Biodata Anda belum lengkap</b> atau <b>Nomor WhatsApp belum diverifikasi</b>. 
            Silakan lengkapi profil Anda terlebih dahulu agar dapat menggunakan semua fitur KPI System.
        </p>
        <button 
            @click="$router.push('/profile')" 
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-blue-500/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
        >
            <i class="pi pi-user-edit"></i> Lengkapi Profil Sekarang
        </button>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable 
        :value="targets" 
        :loading="isLoading"
        stripedRows 
        responsiveLayout="scroll"
        class="p-datatable-sm w-full"
      >
        <template #header>
            <div class="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-gray-50">
                <span class="text-gray-700 font-bold">Daftar Indikator & Target</span>
                <span class="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                    {{ targets.length }} Indikator
                </span>
            </div>
        </template>

        <template #empty>
            <div class="text-center p-12 text-gray-500">
                <div class="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-target text-4xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">Belum Ada Target KPI</h3>
                <p class="text-sm max-w-xs mx-auto">Target Anda untuk periode ini belum ditetapkan oleh atasan.</p>
            </div>
        </template>

        <Column header="No" style="width: 5%">
          <template #body="slotProps">
            <span class="text-gray-500">{{ slotProps.index + 1 }}</span>
          </template>
        </Column>

        <Column field="indicator_name" header="Indikator" style="width: 35%">
          <template #body="{ data }">
            <span class="font-bold text-gray-900">{{ data.indicator_name || 'Indikator Dihapus' }}</span>
          </template>
        </Column>

        <Column field="indicator_type" header="Kategori" style="width: 15%">
          <template #body="{ data }">
            <span 
                :class="data.indicator_type === 'umum' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'" 
                class="px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider"
            >
              {{ data.indicator_type || '-' }}
            </span>
          </template>
        </Column>

        <Column field="weight" header="Bobot" style="width: 15%">
          <template #body="{ data }">
            <span class="font-medium text-gray-700">{{ data.weight ? data.weight + '%' : '-' }}</span>
          </template>
        </Column>

        <Column field="target_score" header="Target Skor" headerClass="justify-center" bodyClass="text-center" style="width: 10%">
          <template #body="{ data }">
            <div class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold shadow-sm">
                {{ data.target_score }}
            </div>
          </template>
        </Column>

        <Column field="notes" header="Catatan Tambahan" style="width: 20%">
          <template #body="{ data }">
            <span class="text-gray-500 text-sm italic">{{ data.notes || '-' }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { periodService, kpiTargetService } from '../../services/api'

// PrimeVue Imports (Pastikan sudah terinstall)
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { useAuthStore } from '../../stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()

const isProfileComplete = computed(() => {
    const emp = authStore.user?.employee
    if (!emp) return false
    return emp.is_phone_verified && 
           emp.phone && 
           emp.address && 
           emp.birth_place && 
           emp.birth_date
})

const periods = ref<any[]>([])
const selectedPeriodId = ref<number | ''>('')
const targets = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const p = await periodService.getAll()
    periods.value = p
    const active = p.find((x: any) => x.is_active)
    if (active) {
      selectedPeriodId.value = active.id
    } else if (p.length > 0) {
      selectedPeriodId.value = p[0].id
    }
    
    if (selectedPeriodId.value) {
      await loadMyTargets()
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

async function loadMyTargets() {
  if (!selectedPeriodId.value) return
  isLoading.value = true
  try {
    const targetsData = await kpiTargetService.getMyTargets(Number(selectedPeriodId.value))
    targets.value = targetsData || []
  } catch (e) {
    console.error(e)
    targets.value = []
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Menyesuaikan gaya internal PrimeVue agar lebih minimalis seperti PositionView */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #fcfcfc;
    color: #94a3b8;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f8fafc;
}
</style>
