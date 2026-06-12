<template>
  <div>
    <Toast />

    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manajemen Surat Peringatan</h1>
        <p class="text-gray-600 text-sm mt-1">Pantau dan kelola seluruh Surat Peringatan (SP) yang diterbitkan.</p>
      </div>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
      >
        <i class="pi pi-plus"></i>
        Terbitkan SP Baru
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="card in summaryCards" :key="card.level"
        class="bg-white rounded-xl p-4 border shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:shadow-md"
        :class="[card.borderClass, selectedLevel === card.filterValue ? card.activeBg : '']"
        @click="toggleLevelFilter(card.filterValue)"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" :class="card.iconClass">
          {{ card.level }}
        </div>
        <div>
          <div class="text-xs text-gray-500">{{ card.label }}</div>
          <div class="text-2xl font-extrabold" :class="card.textClass">{{ card.count }}</div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
      <!-- Search -->
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama pegawai atau alasan SP..."
          class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
        />
      </div>

      <!-- Filter Level -->
      <select v-model="selectedLevel" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-400 outline-none">
        <option value="">Semua Level</option>
        <option value="SP1">SP1</option>
        <option value="SP2">SP2</option>
        <option value="SP3">SP3</option>
      </select>

      <!-- Reset -->
      <button
        v-if="searchQuery || selectedLevel"
        @click="resetFilter"
        class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-2 transition"
      >
        <i class="pi pi-filter-slash"></i>
        Reset
      </button>

      <div class="text-sm text-gray-500 whitespace-nowrap self-center">
        <span class="font-bold text-red-600">{{ filteredWarnings.length }}</span> data
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable
        :value="filteredWarnings"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        :loading="isLoading"
        dataKey="id"
        stripedRows
        responsiveLayout="scroll"
        removableSort
      >
        <template #empty>
          <div class="text-center p-10 text-gray-400">
            <i class="pi pi-shield text-5xl mb-3 block"></i>
            <p class="text-base font-medium">Tidak ada data SP</p>
            <p class="text-sm mt-1">{{ selectedLevel || searchQuery ? 'Coba ubah filter pencarian.' : 'Belum ada Surat Peringatan yang diterbitkan.' }}</p>
          </div>
        </template>

        <!-- No -->
        <Column header="No" style="width: 60px">
          <template #body="{ index }">
            <span class="text-gray-500 text-sm">{{ index + 1 }}</span>
          </template>
        </Column>

        <!-- Nama Pegawai -->
        <Column field="employee_name" header="Nama Pegawai" sortable style="min-width: 180px">
          <template #body="{ data }">
            <div>
              <div class="font-semibold text-gray-900 text-sm">{{ data.employee_name }}</div>
              <div class="text-xs text-gray-500">{{ data.division_name || '-' }}</div>
            </div>
          </template>
        </Column>

        <!-- Level SP -->
        <Column field="level" header="Level SP" sortable style="width: 110px">
          <template #body="{ data }">
            <span class="px-2.5 py-1 rounded-full text-xs font-extrabold border" :class="getLevelBadge(data.level)">
              {{ data.level }}
            </span>
          </template>
        </Column>

        <!-- Alasan -->
        <Column field="reason" header="Alasan / Pelanggaran" style="min-width: 220px">
          <template #body="{ data }">
            <p class="text-sm text-gray-700 line-clamp-2 leading-snug">{{ data.reason }}</p>
            <p v-if="data.description" class="text-xs text-gray-400 mt-0.5 line-clamp-1 italic">{{ data.description }}</p>
          </template>
        </Column>

        <!-- Diterbitkan Oleh -->
        <Column field="issued_by_name" header="Diterbitkan Oleh" sortable style="min-width: 150px">
          <template #body="{ data }">
            <span class="text-sm text-gray-700">{{ data.issued_by_name || 'Sistem (Otomatis)' }}</span>
          </template>
        </Column>

        <!-- Tanggal -->
        <Column field="issued_at" header="Tanggal Terbit" sortable style="width: 150px">
          <template #body="{ data }">
            <span class="text-sm text-gray-600">{{ formatDate(data.issued_at) }}</span>
          </template>
        </Column>

        <!-- Aksi -->
        <Column header="Aksi" style="width: 80px">
          <template #body="{ data }">
            <button
              @click="confirmDelete(data)"
              class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
              title="Hapus SP ini"
            >
              <i class="pi pi-trash text-sm"></i>
            </button>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal: Terbitkan SP Baru -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Terbitkan Surat Peringatan</h2>
            <p class="text-sm text-gray-500 mt-0.5">Isi form di bawah ini untuk menerbitkan SP.</p>
          </div>
          <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
            <i class="pi pi-times text-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pegawai <span class="text-red-500">*</span></label>
            <select v-model="createForm.employee_id" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none bg-white">
              <option value="">-- Pilih Pegawai --</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }} ({{ emp.division_name || emp.position }})</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Level SP <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <button
                v-for="lvl in ['SP1', 'SP2', 'SP3']"
                :key="lvl"
                @click="createForm.level = lvl"
                class="flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                :class="createForm.level === lvl ? getLevelActive(lvl) : 'border-gray-200 text-gray-500 hover:border-gray-300'"
              >
                {{ lvl }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Alasan / Pelanggaran <span class="text-red-500">*</span></label>
            <textarea
              v-model="createForm.reason"
              rows="3"
              placeholder="Jelaskan alasan penerbitan SP ini..."
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Catatan / Saran Perbaikan</label>
            <textarea
              v-model="createForm.description"
              rows="2"
              placeholder="Catatan tambahan atau saran perbaikan (opsional)..."
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex gap-3 p-6 border-t border-gray-100">
          <button @click="closeCreateModal" class="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
            Batal
          </button>
          <button
            @click="submitCreateSP"
            :disabled="isSubmitting || !createForm.employee_id || !createForm.level || !createForm.reason"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <i class="pi pi-spin pi-spinner" v-if="isSubmitting"></i>
            <i class="pi pi-send" v-else></i>
            {{ isSubmitting ? 'Menerbitkan...' : 'Terbitkan SP' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { warningService, employeeService } from '../../services/api'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Swal from 'sweetalert2'

const toast = useToast()

const warnings = ref<any[]>([])
const employees = ref<any[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const searchQuery = ref('')
const selectedLevel = ref('')
const showCreateModal = ref(false)

const createForm = ref({
  employee_id: '' as any,
  level: 'SP1',
  reason: '',
  description: ''
})

// ---- Computed: Summary Cards ----
const summaryCards = computed(() => {
  const counts = { SP1: 0, SP2: 0, SP3: 0 }
  warnings.value.forEach(w => {
    if (counts[w.level as 'SP1'|'SP2'|'SP3'] !== undefined) counts[w.level as 'SP1'|'SP2'|'SP3']++
  })
  return [
    { level: 'ALL', label: 'Total SP', count: warnings.value.length, filterValue: '', borderClass: 'border-gray-200', iconClass: 'bg-gray-100 text-gray-700', textClass: 'text-gray-800', activeBg: 'ring-2 ring-gray-400' },
    { level: 'SP1', label: 'Peringatan 1', count: counts.SP1, filterValue: 'SP1', borderClass: 'border-yellow-200', iconClass: 'bg-yellow-100 text-yellow-700', textClass: 'text-yellow-700', activeBg: 'ring-2 ring-yellow-400 bg-yellow-50' },
    { level: 'SP2', label: 'Peringatan 2', count: counts.SP2, filterValue: 'SP2', borderClass: 'border-orange-200', iconClass: 'bg-orange-100 text-orange-700', textClass: 'text-orange-700', activeBg: 'ring-2 ring-orange-400 bg-orange-50' },
    { level: 'SP3', label: 'Peringatan 3', count: counts.SP3, filterValue: 'SP3', borderClass: 'border-red-200', iconClass: 'bg-red-100 text-red-700', textClass: 'text-red-700', activeBg: 'ring-2 ring-red-400 bg-red-50' },
  ]
})

// ---- Computed: Filtered Warnings ----
const filteredWarnings = computed(() => {
  let result = warnings.value

  if (selectedLevel.value) {
    result = result.filter(w => w.level === selectedLevel.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(w =>
      w.employee_name?.toLowerCase().includes(q) ||
      w.reason?.toLowerCase().includes(q) ||
      w.division_name?.toLowerCase().includes(q)
    )
  }

  return result
})

onMounted(async () => {
  await Promise.all([fetchWarnings(), fetchEmployees()])
})

async function fetchWarnings() {
  isLoading.value = true
  try {
    warnings.value = await warningService.getAll()
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data SP', life: 3000 })
  } finally {
    isLoading.value = false
  }
}

async function fetchEmployees() {
  try {
    employees.value = await employeeService.getAll()
  } catch (e) {
    console.error('Gagal memuat pegawai', e)
  }
}

function toggleLevelFilter(value: string) {
  selectedLevel.value = selectedLevel.value === value ? '' : value
}

function resetFilter() {
  searchQuery.value = ''
  selectedLevel.value = ''
}

function openCreateModal() {
  createForm.value = { employee_id: '', level: 'SP1', reason: '', description: '' }
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

async function submitCreateSP() {
  if (!createForm.value.employee_id || !createForm.value.level || !createForm.value.reason) return

  isSubmitting.value = true
  try {
    await warningService.create({
      employee_id: Number(createForm.value.employee_id),
      level: createForm.value.level,
      reason: createForm.value.reason,
      description: createForm.value.description
    })
    toast.add({ severity: 'success', summary: 'Berhasil', detail: `${createForm.value.level} berhasil diterbitkan`, life: 3000 })
    closeCreateModal()
    await fetchWarnings()
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: e.response?.data?.message || 'Gagal menerbitkan SP', life: 3000 })
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete(warning: any) {
  const result = await Swal.fire({
    title: `Hapus ${warning.level}?`,
    html: `Anda akan menghapus SP <b>${warning.level}</b> milik <b>${warning.employee_name}</b>.<br><small class="text-gray-500">Tindakan ini tidak dapat dibatalkan.</small>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await warningService.delete(warning.id)
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'SP berhasil dihapus', life: 3000 })
      await fetchWarnings()
    } catch (e: any) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus SP', life: 3000 })
    }
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getLevelBadge(level: string) {
  switch (level) {
    case 'SP1': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'SP2': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'SP3': return 'bg-red-100 text-red-800 border-red-300'
    default:    return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

function getLevelActive(level: string) {
  switch (level) {
    case 'SP1': return 'border-yellow-400 bg-yellow-50 text-yellow-700'
    case 'SP2': return 'border-orange-400 bg-orange-50 text-orange-700'
    case 'SP3': return 'border-red-500 bg-red-50 text-red-700'
    default:    return 'border-gray-300 bg-gray-50 text-gray-700'
  }
}
</script>
