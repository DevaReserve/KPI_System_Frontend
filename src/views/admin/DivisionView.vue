<template>
  <div>
    <Toast />
    
    <ConfirmDialog group="headless">
      <template #container="{ message, acceptCallback, rejectCallback }">
          <div class="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-full">
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
        <h1 class="text-2xl font-bold text-gray-800">Manajemen Divisi</h1>
        <p class="text-gray-500 text-sm">Daftar divisi dalam perusahaan.</p>
      </div>

      <div class="flex gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-search text-gray-400"></i>
            </div>
            <input 
                v-model="filters['global'].value" 
                type="text"
                placeholder="Cari Divisi..." 
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
        </div>

        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shrink-0 whitespace-nowrap">
          <i class="pi pi-plus mr-2"></i>
          Tambah Divisi
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable 
        v-model:filters="filters"
        :value="divisions" 
        :paginator="true" 
        :rows="10" 
        :rowsPerPageOptions="[5, 10, 20]" 
        :loading="isLoading"
        dataKey="id"
        :globalFilterFields="['name', 'description', 'manager_name']"
        stripedRows 
        responsiveLayout="scroll"
        removableSort
        stateStorage="session" 
        stateKey="dt-divisions-state"
      >
        <template #empty>
            <div class="text-center p-8 text-gray-500">
                <i class="pi pi-folder-open text-4xl mb-2"></i>
                <p>Belum ada data divisi.</p>
            </div>
        </template>

        <Column header="No" style="width: 60px">
          <template #body="{ index }">
            <span class="text-gray-500 text-sm">{{ index + 1 }}.</span>
          </template>
        </Column>

        <Column field="name" header="Nama Divisi" sortable style="width: 30%">
            <template #body="{ data }">
                <span class="font-bold text-gray-900">{{ data.name }}</span>
            </template>
        </Column>

        <Column field="manager_name" header="Kepala Divisi" sortable style="width: 25%">
          <template #body="{ data }">
              <div v-if="data.name === 'Board of Directors'" class="text-sm font-medium text-gray-400 italic">
                  Tidak Perlu Manajer
              </div>
              <div v-else-if="data.manager_id && data.manager_name" class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border border-gray-200">
                      <img 
                          v-if="data.manager_photo" 
                          :src="getProfilePictureUrl(data.manager_photo)" 
                          class="w-full h-full object-cover"
                      />
                      <span v-else>{{ data.manager_name.charAt(0) }}</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ data.manager_name }}</span>
              </div>

              <div v-else class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 shadow-sm animate-pulse">
                  <i class="pi pi-exclamation-triangle text-sm"></i>
                  <div class="flex flex-col">
                      <span class="text-xs font-extrabold uppercase tracking-wider">Perlu Tindakan</span>
                      <span class="text-[10px] opacity-80">Manajer Belum Ditunjuk</span>
                  </div>
              </div>
          </template>
      </Column>

        <Column field="description" header="Deskripsi" sortable style="width: 40%">
            <template #body="{ data }">
                <span class="text-gray-600">{{ data.description || '-' }}</span>
            </template>
        </Column>

        <Column header="Aksi" style="width: 10%">
            <template #body="{ data }">
                <div class="flex items-center gap-2">
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
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-5 border-b pb-4">{{ isEditing ? 'Edit Divisi' : 'Tambah Divisi Baru' }}</h3>
            <form @submit.prevent="saveDivision">
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Divisi</label>
                <input v-model="form.name" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea v-model="form.description" rows="3" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Kepala Divisi (Manager)</label>
                <select v-model="form.manager_id" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option :value="null">-- Belum Ada --</option>
                  <option v-for="emp in potentialManagers" :key="emp.id" :value="emp.id">
                    {{ emp.name }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">Hanya pegawai dengan jabatan 'Manager' yang muncul disini.</p>
              </div>

              <div class="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" @click="closeModal" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">Batal</button>
                <button type="submit" :disabled="isProcessing" class="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:text-sm disabled:opacity-50">{{ isProcessing ? 'Menyimpan...' : 'Simpan' }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { divisionService, employeeService } from '../../services/api'

// Import PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

// PrimeVue Logic
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm()

const divisions = ref<any[]>([])
const allEmployees = ref<any[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const isProcessing = ref(false)

const form = reactive({ id: 0, name: '', description: '', manager_id: null as number | null })

// Filter State
const filters = ref({
    global: { value: '', matchMode: 'contains' }, 
});

const potentialManagers = computed(() => {
  return allEmployees.value.filter(e => 
    e.role === 'manager' || (e.position && e.position.toLowerCase().includes('manager'))
  )
})

onMounted(async () => { await fetchData() })

async function fetchData() {
  try {
    isLoading.value = true
    const [divData, empData] = await Promise.all([
      divisionService.getAll(),
      employeeService.getAll()
    ])
    
    divisions.value = divData
    allEmployees.value = empData

    divisions.value = divisions.value.map(div => {
      const mgr = allEmployees.value.find(e => e.id === div.manager_id)
      return { 
        ...div, 
        manager_name: mgr ? mgr.name : null,
        manager_photo: mgr ? mgr.profile_picture_url : null
      }
    })

  } catch (error) { 
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data', life: 3000 })
  } finally { 
    isLoading.value = false 
  }
}

function getProfilePictureUrl(url: string) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080' 
    return `${baseUrl.replace('/api', '')}${url}`
}

function openModal(division?: any) {
  if (division) {
    isEditing.value = true
    form.id = division.id
    form.name = division.name
    form.description = division.description
    form.manager_id = division.manager_id || null
  } else {
    isEditing.value = false
    Object.assign(form, { id: 0, name: '', description: '', manager_id: null })
  }
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function saveDivision() {
  try {
    isProcessing.value = true
    const payload = { 
      name: form.name, 
      description: form.description,
      manager_id: form.manager_id ? Number(form.manager_id) : undefined 
    }
    
    if (isEditing.value) {
      await divisionService.update(form.id, payload as any)
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data divisi diperbarui', life: 3000 })
    } else {
      await divisionService.create(payload as any)
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Divisi baru ditambahkan', life: 3000 })
    }
    
    await fetchData()
    closeModal()
  } catch (error: any) { 
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal menyimpan data', life: 3000 })
  } finally { 
    isProcessing.value = false 
  }
}

function confirmDelete(item: any) {
  confirm.require({
    group: 'headless',
    header: 'Hapus Divisi?',
    message: `Apakah Anda yakin ingin menghapus divisi <strong>${item.name}</strong>? Data tidak dapat dikembalikan.`,
    icon: 'pi pi-trash',
    acceptLabel: 'Hapus',
    
    // Custom property untuk styling merah (butuh 'as any')
    acceptSeverity: 'danger', 
    
    accept: async () => {
      try { 
        await divisionService.delete(item.id)
        await fetchData() 
        toast.add({ severity: 'success', summary: 'Terhapus', detail: 'Divisi berhasil dihapus', life: 3000 })
      } 
      catch (error: any) { 
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus. Pastikan divisi kosong.', life: 3000 })
      }
    }
  } as any)
}
</script>
