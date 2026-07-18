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
        <h1 class="text-2xl font-bold text-gray-800">Manajemen Jabatan</h1>
        <p class="text-gray-500 text-sm">Daftar posisi dan jabatan dalam perusahaan.</p>
      </div>

      <div class="flex gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-search text-gray-400"></i>
            </div>
            <input 
                v-model="filters['global'].value" 
                type="text"
                placeholder="Cari Jabatan / Divisi..." 
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
        </div>

        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shrink-0 whitespace-nowrap">
          <i class="pi pi-plus mr-2"></i>
          Tambah Jabatan
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable 
        v-model:filters="filters"
        :value="positions" 
        :paginator="true" 
        :rows="10" 
        :rowsPerPageOptions="[5, 10, 20, 50]" 
        :loading="isLoading"
        dataKey="id"
        :globalFilterFields="['name', 'description', 'division_name']"
        stripedRows 
        responsiveLayout="scroll"
        removableSort
        stateStorage="session" 
        stateKey="dt-positions-state"
      >
        <template #empty>
            <div class="text-center p-8 text-gray-500">
                <i class="pi pi-briefcase text-4xl mb-2"></i>
                <p>Belum ada data jabatan.</p>
            </div>
        </template>
        
        <Column header="No" style="width: 60px">
          <template #body="{ index }">
            <span class="text-gray-500 text-sm">{{ index + 1 }}.</span>
          </template>
        </Column>

        <Column field="division_name" header="Divisi" sortable style="width: 25%">
            <template #body="{ data }">
                <span class="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-100 uppercase tracking-wider">
                    {{ data.division_name }}
                </span>
            </template>
        </Column>

        <Column field="name" header="Nama Jabatan" sortable style="width: 30%">
            <template #body="{ data }">
                <span class="font-bold text-gray-900">{{ data.name }}</span>
            </template>
        </Column>

        <Column field="description" header="Deskripsi" sortable style="width: 30%">
            <template #body="{ data }">
                <span class="text-gray-600 text-sm">{{ data.description || '-' }}</span>
            </template>
        </Column>

        <Column header="Aksi" style="width: 15%">
            <template #body="{ data }">
                <div class="flex items-center gap-2">
                    <button @click="openModal(data)" class="p-1 text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">
                        <i class="pi pi-pencil"></i>
                    </button>
                    <button @click="deletePos(data)" class="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus">
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
                    <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4">
                        {{ isEditing ? 'Edit Jabatan' : 'Tambah Jabatan' }}
                    </h3>
                    <form @submit.prevent="savePos">
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                            <select v-model="form.division_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>Pilih Divisi</option>
                                <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.name }}</option>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Jabatan</label>
                            <input v-model="form.name" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Senior Developer">
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                            <textarea v-model="form.description" rows="3" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>

                        <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
                            <button type="button" @click="closeModal" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm">
                                Batal
                            </button>
                            <button type="submit" :disabled="isProcessing" class="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm disabled:opacity-50">
                                {{ isProcessing ? 'Menyimpan...' : 'Simpan' }}
                            </button>
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
import { positionService, divisionService } from '../../services/api'

// PrimeVue Imports
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const toast = useToast()
const confirm = useConfirm()

const positions = ref<any[]>([]) 
const divisions = ref<any[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const isProcessing = ref(false)

// Filter State (Inisialisasi string kosong agar reaktif)
const filters = ref({
    global: { value: '', matchMode: 'contains' }, 
});

const form = reactive({ id: 0, name: '', description: '', division_id: '' as string | number })

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  isLoading.value = true
  try {
    const [posData, divData] = await Promise.all([
      positionService.getAll(),
      divisionService.getAll()
    ])
    
    // Flatten Data: Tarik 'division.name' ke root object agar Search & Sort bekerja mudah
    positions.value = posData.map((p: any) => ({
        ...p,
        division_name: p.division ? p.division.name : '-' 
    }))

    divisions.value = divData
  } catch (e) { 
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data', life: 3000 })
  } 
  finally { isLoading.value = false }
}

function openModal(item?: any) {
  isEditing.value = !!item
  showModal.value = true
  if (item) {
    form.id = item.id
    form.name = item.name
    form.description = item.description
    form.division_id = item.division_id || (item.division ? item.division.id : '')
  } else {
    Object.assign(form, { id: 0, name: '', description: '', division_id: '' })
  }
}

function closeModal() {
  showModal.value = false
}

async function savePos() {
  try {
    isProcessing.value = true
    const payload = { ...form, division_id: Number(form.division_id) }
    
    if (isEditing.value) {
      await positionService.update(form.id, payload)
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Jabatan berhasil diperbarui', life: 3000 })
    } else {
      await positionService.create(payload)
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Jabatan baru ditambahkan', life: 3000 })
    }
    
    await fetchData() // Refresh data
    closeModal()
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: e.response?.data?.message || 'Gagal menyimpan jabatan', life: 3000 })
  } finally {
    isProcessing.value = false
  }
}

function deletePos(item: any) {
  confirm.require({
    group: 'headless',
    header: 'Hapus Jabatan?',
    message: `Hapus jabatan <strong>${item.name}</strong>? <br> <span class="text-red-500 text-sm">Data yang dihapus tidak dapat dikembalikan.</span>`,
    icon: 'pi pi-trash',
    acceptLabel: 'Hapus',
    acceptSeverity: 'danger',
    accept: async () => {
      try {
        await positionService.delete(item.id)
        await fetchData()
        toast.add({ severity: 'success', summary: 'Terhapus', detail: 'Jabatan berhasil dihapus', life: 3000 })
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus jabatan. Pastikan tidak ada pegawai yang menjabat.', life: 3000 })
      }
    }
  } as any)
}
</script>
