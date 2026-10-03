<template>
  <div>
    <Toast />
    
    <ConfirmDialog group="headless">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm">
                <div class="rounded-full inline-flex justify-center items-center h-20 w-20 -mt-16 border-4 border-white shadow-lg"
                    :class="message.acceptSeverity === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
                    <i :class="[message.icon, 'text-4xl']"></i>
                </div>
                
                <span class="font-bold text-xl block mb-2 mt-6 text-gray-800">{{ message.header }}</span>
                <p class="mb-6 text-gray-500 text-center leading-relaxed" v-html="message.message"></p>
                
                <div class="flex items-center gap-3 w-full">
                    <button 
                        @click="rejectCallback"
                        class="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        @click="acceptCallback"
                        class="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors shadow-md"
                        :class="message.acceptSeverity === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
                    >
                        {{ message.acceptLabel || 'Ya, Lanjutkan' }}
                    </button>
                </div>
            </div>
        </template>
    </ConfirmDialog>

    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Periode Evaluasi</h1>
        <p class="text-gray-500 text-sm">Atur jadwal penilaian kinerja pegawai.</p>
      </div>

      <div class="flex gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-search text-gray-400"></i>
            </div>
            <input 
                v-model="filters['global'].value" 
                type="text"
                placeholder="Cari Periode..." 
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
        </div>

        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shrink-0 whitespace-nowrap">
          <i class="pi pi-plus mr-2"></i>
          Buat Periode Baru
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable 
        v-model:filters="filters"
        :value="periods" 
        :paginator="true" 
        :rows="10" 
        :rowsPerPageOptions="[5, 10, 20]" 
        :loading="isLoading"
        dataKey="id"
        :globalFilterFields="['name']"
        stripedRows 
        responsiveLayout="scroll"
        removableSort
        stateStorage="session" 
        stateKey="dt-periods-state"
      >
        <template #empty>
            <div class="text-center p-8 text-gray-500">
                <i class="pi pi-calendar-times text-4xl mb-2"></i>
                <p>Belum ada data periode.</p>
            </div>
        </template>

        <Column header="No" style="width: 50px">
          <template #body="{ index }">
            <span class="text-gray-500 text-sm">{{ index + 1 }}.</span>
          </template>
        </Column>
        
        <Column field="name" header="Nama Periode" sortable style="width: 30%">
            <template #body="{ data }">
                <span class="font-bold text-gray-900">{{ data.name }}</span>
            </template>
        </Column>

        <Column field="start_date" header="Mulai" sortable style="width: 20%">
            <template #body="{ data }">
                <span class="text-gray-700">{{ formatDate(data.start_date) }}</span>
            </template>
        </Column>

        <Column field="end_date" header="Selesai" sortable style="width: 20%">
            <template #body="{ data }">
                <span class="text-gray-700">{{ formatDate(data.end_date) }}</span>
            </template>
        </Column>

        <Column field="is_active" header="Status" sortable style="width: 15%">
            <template #body="{ data }">
                <span v-if="data.is_active" class="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800 border border-green-200">
                    SEDANG AKTIF
                </span>
                <span v-else class="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                    Tidak Aktif
                </span>
            </template>
        </Column>

        <Column header="Aksi" style="width: 15%">
            <template #body="{ data }">
                <div class="flex items-center gap-2">
                    <button 
                        v-if="!data.is_active" 
                        @click="confirmActivate(data)" 
                        class="text-green-600 hover:text-green-900 font-bold transition-colors text-xs uppercase tracking-wide border border-green-200 px-2 py-1 rounded bg-green-50 hover:bg-green-100 mr-2"
                        title="Aktifkan Periode Ini">
                        Set Aktif
                    </button>
                    
                    <button @click="openModal(data)" class="p-1 text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">
                        <i class="pi pi-pencil"></i>
                    </button>
                    
                    <button @click="confirmDelete(data)" class="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                        <i class="pi pi-trash"></i>
                    </button>
                </div>
            </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
            <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div class="bg-white px-6 pt-6 pb-4">
                    <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4">{{ isEditing ? 'Edit Periode' : 'Buat Periode Baru' }}</h3>
                    <form @submit.prevent="savePeriod">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Periode</label>
                            <input v-model="form.name" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Penilaian Q1 2025">
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div><label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label><input v-model="form.start_date" type="date" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
                            <div><label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label><input v-model="form.end_date" type="date" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
                        </div>
                        <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4"><p class="text-xs text-blue-700"><span class="font-bold">Catatan:</span> Periode baru secara default berstatus "Tidak Aktif".</p></div>
                        <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
                            <button type="button" @click="closeModal" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm">Batal</button>
                            <button type="submit" :disabled="isProcessing" class="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm disabled:opacity-50">{{ isProcessing ? 'Menyimpan...' : 'Simpan' }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { periodService } from '../../services/api'
import type { EvaluationPeriod } from '../../types'

// PrimeVue Imports
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const toast = useToast()
const confirm = useConfirm()

const periods = ref<EvaluationPeriod[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const isProcessing = ref(false)
const form = reactive({ id: 0, name: '', start_date: '', end_date: '' })

// Filter State
const filters = ref({
    global: { value: '', matchMode: 'contains' }, 
});

onMounted(async () => { await fetchPeriods() })

async function fetchPeriods() {
  isLoading.value = true
  try { periods.value = await periodService.getAll() } 
  catch (error) { toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data periode', life: 3000 }) } 
  finally { isLoading.value = false }
}

function formatDate(dateString: string) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function openModal(item?: any) {
  if (item) {
    isEditing.value = true
    form.id = item.id; form.name = item.name
    form.start_date = item.start_date ? item.start_date.split('T')[0] : ''
    form.end_date = item.end_date ? item.end_date.split('T')[0] : ''
  } else { isEditing.value = false; Object.assign(form, { id: 0, name: '', start_date: '', end_date: '' }) }
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function savePeriod() {
  try {
    isProcessing.value = true
    const payload = { name: form.name, start_date: new Date(form.start_date).toISOString(), end_date: new Date(form.end_date).toISOString() }
    if (isEditing.value) { await periodService.update(form.id, payload); toast.add({ severity: 'success', summary: 'Sukses', detail: 'Periode berhasil diperbarui', life: 3000 }) } 
    else { await periodService.create(payload); toast.add({ severity: 'success', summary: 'Sukses', detail: 'Periode baru berhasil dibuat', life: 3000 }) }
    await fetchPeriods(); closeModal()
  } catch (error: any) { toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal menyimpan periode', life: 3000 }) } 
  finally { isProcessing.value = false }
}

function confirmActivate(item: any) {
  confirm.require({
    group: 'headless', // Konsisten dengan view lain
    header: 'Aktifkan Periode?',
    message: `Aktifkan periode <strong>${item.name}</strong>? <br><br> <span class="text-red-500 text-sm">Peringatan: Periode lain yang sedang aktif akan otomatis dinonaktifkan.</span>`,
    icon: 'pi pi-calendar-plus',
    acceptLabel: 'Ya, Aktifkan',
    accept: async () => {
      try { await periodService.activate(item.id); await fetchPeriods(); toast.add({ severity: 'success', summary: 'Sukses', detail: `Periode ${item.name} kini aktif`, life: 3000 }) } 
      catch (error: any) { toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal mengaktifkan periode', life: 3000 }) }
    }
  } as any)
}

function confirmDelete(item: any) {
  confirm.require({
    group: 'headless',
    header: 'Hapus Periode?',
    message: `Hapus periode <strong>${item.name}</strong>? <br> Data penilaian di dalamnya mungkin akan hilang.`,
    icon: 'pi pi-trash',
    acceptLabel: 'Hapus',
    acceptSeverity: 'danger',
    accept: async () => {
      try { await periodService.delete(item.id); await fetchPeriods(); toast.add({ severity: 'success', summary: 'Terhapus', detail: 'Periode berhasil dihapus', life: 3000 }) } 
      catch (error: any) { toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal menghapus periode', life: 3000 }) }
    }
  } as any)
}
</script>
