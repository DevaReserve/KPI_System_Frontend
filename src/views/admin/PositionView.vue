<template>
  <div>
    <Toast />
    
    <ConfirmDialog group="headless">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-full">
                <div 
                  class="rounded-full inline-flex justify-center items-center h-24 w-24 -mt-20 border-4 border-white shadow-sm"
                  :class="message.acceptSeverity === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'"
                >
                    <i :class="[message.icon, 'text-5xl']"></i>
                </div>
                
                <span class="font-bold text-2xl block mb-2 mt-6 text-gray-800">{{ message.header }}</span>
                <p class="mb-6 text-gray-500 text-center leading-relaxed" v-html="message.message"></p>
                
                <div class="flex items-center gap-3 w-full">
                    <button 
                        @click="rejectCallback"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
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

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Jabatan</h1>
      <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Tambah Jabatan
      </button>
    </div>

    <DataTable :columns="columns" :data="positions" :loading="isLoading">
      
      <template #name="{ value }">
        <span class="font-bold text-gray-900">{{ value }}</span>
      </template>
      
      <template #division_name="{ item }">
        <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold border border-gray-200">
          {{ item.division?.name || '-' }}
        </span>
      </template>
      
      <template #actions="{ item }">
        <div class="flex items-center gap-3 text-sm">
          <button @click="openModal(item)" class="text-indigo-600 hover:text-indigo-900 font-medium transition-colors">Edit</button>
          <button @click="deletePos(item)" class="text-red-600 hover:text-red-900 font-medium transition-colors">Hapus</button>
        </div>
      </template>
    </DataTable>

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
import DataTable from '../../components/ui/DataTable.vue'

// PrimeVue Logic
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

const form = reactive({ id: 0, name: '', description: '', division_id: '' as string | number })

const columns = [
  { key: 'name', label: 'Nama Jabatan' },
  { key: 'division_name', label: 'Divisi' },
  { key: 'description', label: 'Deskripsi' }
]

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
    positions.value = posData
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
    message: `Hapus jabatan <strong>${item.name}</strong>? <br> Data yang dihapus tidak dapat dikembalikan.`,
    icon: 'pi pi-trash',
    acceptLabel: 'Hapus',
    acceptSeverity: 'danger', // Logic custom untuk warna merah
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
