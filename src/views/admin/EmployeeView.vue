<template>
  <div>
    <Toast />
    
    <ConfirmDialog group="headless">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm">
                <div class="rounded-full bg-red-100 text-red-600 inline-flex justify-center items-center h-20 w-20 -mt-16 border-4 border-white shadow-lg">
                    <i class="pi pi-question text-4xl"></i>
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
                        class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md"
                    >
                        Ya, Lanjutkan
                    </button>
                </div>
            </div>
        </template>
    </ConfirmDialog>

    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manajemen Pegawai</h1>
        <p class="text-gray-500 text-sm">Kelola data karyawan dan hak akses.</p>
      </div>

      <div class="flex gap-3 w-full sm:w-auto">
        
        <div class="relative w-full sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-search text-gray-400"></i>
            </div>
            <input 
                v-model="filters['global'].value" 
                type="text"
                placeholder="Cari Nama / NIP..." 
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
        </div>

        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shrink-0 whitespace-nowrap">
          <i class="pi pi-plus mr-2"></i>
          Tambah Pegawai
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <DataTable 
        v-model:filters="filters"
        :value="employees" 
        :paginator="true" 
        :rows="10" 
        :rowsPerPageOptions="[5, 10, 20, 50]" 
        :loading="isLoading"
        dataKey="id"
        :globalFilterFields="['name', 'nip', 'email', 'username', 'position', 'division_name']"
        stripedRows 
        responsiveLayout="scroll"
        removableSort
        stateStorage="session" 
        stateKey="dt-employees-state"
      >
        <template #empty>
            <div class="text-center p-8 text-gray-500">
                <i class="pi pi-users text-4xl mb-2"></i>
                <p>Belum ada data pegawai.</p>
            </div>
        </template>

        <Column field="name" header="Pegawai" sortable style="width: 30%">
            <template #body="{ data }">
                <div class="flex items-center cursor-pointer group" @click="$router.push(`/admin/employees/${data.id}`)" title="Klik untuk lihat Detail">
                    <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-3 overflow-hidden border border-gray-200"
                        :class="data.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'">
                        <img 
                            v-if="data.profile_picture_url" 
                            :src="getProfilePictureUrl(data.profile_picture_url)" 
                            class="w-full h-full object-cover"
                        >
                        <span v-else>{{ data.name.charAt(0) }}</span>
                    </div>
                    <div>
                        <div class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ data.name }}</div>
                        <div class="text-xs text-gray-500">NIP: {{ data.nip }}</div>
                    </div>
                </div>
            </template>
        </Column>

        <Column field="position" header="Posisi" sortable style="width: 25%">
            <template #body="{ data }">
                <div class="text-sm font-medium text-gray-900">{{ data.position }}</div>
                <div class="text-xs text-gray-500">{{ data.division_name }}</div>
            </template>
        </Column>

        <Column field="username" header="Akun User" sortable style="width: 20%">
            <template #body="{ data }">
                <div class="text-sm text-gray-900 mb-1 font-mono">@{{ data.username }}</div>
                <span class="px-2 py-0.5 inline-flex text-[10px] uppercase font-bold rounded-full tracking-wider" 
                    :class="{
                    'bg-purple-100 text-purple-800': data.role === 'admin',
                    'bg-green-100 text-green-800': data.role === 'manager',
                    'bg-gray-100 text-gray-800': data.role === 'employee'
                    }">
                    {{ data.role }}
                </span>
            </template>
        </Column>

        <Column field="is_active" header="Status" sortable style="width: 10%">
            <template #body="{ data }">
                <span v-if="data.is_active" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>
                <span v-else class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Non-Aktif</span>
            </template>
        </Column>

        <Column header="Aksi" style="width: 15%">
            <template #body="{ data }">
                <div class="flex items-center gap-2">
                    <button @click="openModal(data)" class="p-1 text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">
                        <i class="pi pi-pencil"></i>
                    </button>
                    
                    <button 
                        v-if="data.is_active" @click="confirmStatusChange(data)" 
                        class="p-1 text-red-600 hover:bg-red-50 rounded" title="Non-Aktifkan">
                        <i class="pi pi-ban"></i>
                    </button>
                    <button 
                        v-else @click="confirmStatusChange(data)" 
                        class="p-1 text-green-600 hover:bg-green-50 rounded" title="Aktifkan">
                        <i class="pi pi-check-circle"></i>
                    </button>
                    
                    <button 
                        @click="confirmResetPassword(data)" 
                        class="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                        title="Reset Password Default">
                        <i class="pi pi-key"></i>
                    </button>
                </div>
            </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
            <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                <div class="bg-white px-6 pt-6 pb-4">
                    <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4">{{ isEditing ? 'Edit Pegawai' : 'Tambah Pegawai' }}</h3>
                    
                    <form @submit.prevent="saveEmployee" class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <div class="sm:col-span-2 pb-1 border-b border-gray-100"><span class="text-xs font-bold text-gray-500 uppercase">Data Pribadi</span></div>
                        <div><label class="block text-sm font-medium mb-1">NIP</label><input v-model="form.nip" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 outline-none" required></div>
                        <div><label class="block text-sm font-medium mb-1">Nama Lengkap</label><input v-model="form.name" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 outline-none" required></div>
                        <div><label class="block text-sm font-medium mb-1">Email</label><input v-model="form.email" type="email" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 outline-none" required></div>
                        <div><label class="block text-sm font-medium mb-1">Tanggal Gabung</label><input v-model="form.join_date" type="date" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 outline-none" required></div>
                        
                        <div class="sm:col-span-2 pb-1 border-b border-gray-100 mt-2"><span class="text-xs font-bold text-gray-500 uppercase">Posisi & Jabatan</span></div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Divisi</label>
                            <select v-model="form.division_id" required class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-blue-500 outline-none">
                                <option value="" disabled>Pilih Divisi</option>
                                <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.name }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Jabatan</label>
                            <select v-model="form.position" required :disabled="!form.division_id" class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed focus:ring-blue-500 outline-none">
                                <option value="" disabled>{{ form.division_id ? 'Pilih Jabatan' : 'Pilih Divisi Dulu' }}</option>
                                <option v-for="pos in filteredPositions" :key="pos.id" :value="pos.name">{{ pos.name }}</option>
                            </select>
                        </div>

                        <div class="sm:col-span-2 mt-2 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <label class="block text-sm font-bold text-blue-800 mb-2"><i class="pi pi-sitemap mr-1"></i> Dinilai Oleh (Atasan Langsung)</label>
                            <select v-model="form.direct_supervisor_id" class="w-full rounded-lg border border-blue-200 px-3 py-2 bg-white focus:ring-blue-500 outline-none">
                                <option :value="null">Tidak Ada</option>
                                <option v-for="boss in potentialSupervisors" :key="boss.id" :value="boss.id">{{ boss.name }} ({{ boss.position }})</option>
                            </select>
                        </div>
                                                
                        <div class="sm:col-span-2 pb-1 border-b border-gray-100 mt-2"><span class="text-xs font-bold text-gray-500 uppercase">Akun Pengguna</span></div>
                        <div><label class="block text-sm font-medium mb-1">Username</label><input v-model="form.username" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 outline-none" required></div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Role Sistem</label>
                            <select v-model="form.role" class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:ring-blue-500 outline-none" required>
                                <option value="employee">Employee</option>
                                <option value="manager" :disabled="isInternPosition">Manager</option>
                                <option value="admin" :disabled="isInternPosition">Admin</option>
                            </select>
                        </div>
                        <div class="sm:col-span-2 mt-2" v-if="form.role === 'manager' || form.role === 'admin'">
                            <label class="flex items-center gap-3 cursor-pointer p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                                <input type="checkbox" v-model="form.is_executive" class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                                <div>
                                    <span class="block text-sm font-bold text-blue-900">Berikan Hak Akses Eksekutif (CEO)</span>
                                    <span class="block text-xs text-blue-700">Centang kotak ini agar akun tersebut dapat melihat halaman khusus Performa Keseluruhan Perusahaan.</span>
                                </div>
                            </label>
                        </div>
                        <div v-if="!isEditing" class="sm:col-span-2">
                            <label class="block text-sm font-medium mb-1">Password</label>
                            <input v-model="form.password" type="password" class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-blue-500 outline-none" required>
                        </div>

                        <div class="sm:col-span-2 flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">Batal</button>
                            <button type="submit" :disabled="isProcessing" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-sm disabled:opacity-50">{{ isProcessing ? 'Menyimpan...' : 'Simpan Data' }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { employeeService, divisionService, positionService } from '../../services/api'
import type { Division } from '../../types'

// PrimeVue Imports
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const toast = useToast()
const confirm = useConfirm()

// State Data
const employees = ref<any[]>([])
const divisions = ref<Division[]>([])
const positions = ref<any[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const isProcessing = ref(false)

// Filter State untuk PrimeVue DataTable
const filters = ref({
    global: { value: '', matchMode: 'contains' }, 
});

const form = reactive({
  id: 0, nip: '', name: '', email: '', join_date: '', 
  division_id: '' as string | number, position: '', 
  username: '', password: '', role: 'employee', is_active: true,
  direct_supervisor_id: null as number | null,
  is_executive: false
})

// --- COMPUTED PROPERTIES ---

const potentialSupervisors = computed(() => {
  return employees.value.filter(e => 
    e.id !== form.id && (e.role === 'manager' || e.role === 'admin') 
  );
});

const filteredPositions = computed(() => {
  if (!form.division_id) return []
  return positions.value.filter(pos => pos.division_id === Number(form.division_id))
})

const isInternPosition = computed(() => {
  if (!form.position) return false
  const posLower = form.position.toLowerCase()
  return posLower.includes('intern') || posLower.includes('magang')
})

// --- WATCHERS ---

watch(() => form.position, () => {
  if (isInternPosition.value) {
    form.role = 'employee'
  }
})

watch(() => [form.division_id, form.position], ([newDivId, newPos]) => {
  if (!showModal.value) return; 
  if (!newDivId || !newPos) return;

  const posName = String(newPos).toLowerCase();
  
  if (posName.includes('ceo') || form.is_executive || posName.includes('direktur')) {
      form.direct_supervisor_id = null;
      return;
  }

  if (posName.includes('manager') || posName.includes('head') || posName.includes('lead')) {
      const ceo = employees.value.find(e => e.role === 'admin' && (e.position && e.position.toLowerCase().includes('ceo')));
      form.direct_supervisor_id = ceo ? ceo.id : 1; 
      return;
  } 
  
  const selectedDivision = divisions.value.find(d => d.id === Number(newDivId));

  if (selectedDivision && selectedDivision.manager_id) {
      form.direct_supervisor_id = selectedDivision.manager_id;
  } else {
      const managerInSameDiv = employees.value.find(e => 
        e.division_id === Number(newDivId) && e.role === 'manager'
      );
      form.direct_supervisor_id = managerInSameDiv ? managerInSameDiv.id : null;
  }
});

// --- LIFECYCLE ---

onMounted(async () => { await fetchData() })

async function fetchData() {
  isLoading.value = true
  try {
    const [emps, divs, pos] = await Promise.all([
      employeeService.getAll(),
      divisionService.getAll(),
      positionService.getAll()
    ])
    
    // Flattening Data: Agar search bar bisa membaca 'division_name'
    employees.value = emps.map((e: any) => ({
        ...e,
        division_name: e.division ? e.division.name : '-', // Tarik nama divisi ke root object
        role: e.user ? e.user.role : e.role 
    }))

    divisions.value = divs
    positions.value = pos
  } catch (error) { 
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 3000 })
  } 
  finally { isLoading.value = false }
}

// --- ACTIONS ---

function openModal(emp?: any) {
  if (emp) {
    isEditing.value = true;
    form.id = emp.id;
    form.nip = emp.nip;
    form.name = emp.name;
    form.email = emp.email;
    form.join_date = emp.join_date ? emp.join_date.split('T')[0] : '';
    
    // Handle nested objects safely
    form.username = emp.username || (emp.user ? emp.user.username : '');
    form.role = emp.role || (emp.user ? emp.user.role : 'employee');
    // Gunakan pengecekan yang lebih kuat. Jika nilainya 1 atau true, maka true.
form.is_executive = emp.is_executive === true || emp.is_executive === 1 || (emp.user && (emp.user.is_executive === true || emp.user.is_executive === 1));
    
    form.is_active = emp.is_active;
    form.password = '';
    
    form.division_id = emp.division_id;
    form.position = emp.position;

    nextTick(() => {
         form.direct_supervisor_id = emp.direct_supervisor_id || null;
    });
    
  } else {
    isEditing.value = false;
    Object.assign(form, { 
        id: 0, nip: '', name: '', email: '', join_date: '', 
        division_id: '', position: '', username: '', password: '', 
        role: 'employee', is_active: true,
        direct_supervisor_id: null,
        is_executive: false
    });
  }
  showModal.value = true;
}

function closeModal() { showModal.value = false }

async function saveEmployee() {
  try {
    isProcessing.value = true
    const payload = { 
        ...form, 
        division_id: Number(form.division_id), 
        join_date: new Date(form.join_date).toISOString(),
        direct_supervisor_id: form.direct_supervisor_id ? Number(form.direct_supervisor_id) : null 
    }
    
    if (isEditing.value) {
      await employeeService.update(form.id, payload)
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data pegawai diperbarui', life: 3000 })
    } else {
      await employeeService.create(payload)
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Pegawai berhasil ditambahkan', life: 3000 })
    }
    
    await fetchData()
    closeModal()
  } catch (error: any) { 
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal menyimpan data', life: 3000 })
  } finally { 
    isProcessing.value = false 
  }
}

function confirmStatusChange(emp: any) {
  const isDeactivating = emp.is_active
  const actionLabel = isDeactivating ? 'Non-Aktifkan' : 'Aktifkan'
  
  confirm.require({
    group: 'headless',
    header: 'Konfirmasi Status',
    message: `Ubah status <strong>${emp.name}</strong> menjadi ${actionLabel}?`,
    accept: async () => {
      try {
        if (isDeactivating) { 
          await employeeService.delete(emp.id) 
        } else { 
          const payload = { ...emp, is_active: true } 
          await employeeService.update(emp.id, payload) 
        }
        await fetchData()
        toast.add({ severity: 'success', summary: 'Sukses', detail: `Status ${emp.name} berhasil diubah`, life: 3000 })
      } catch (error: any) { 
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengubah status', life: 3000 })
      }
    }
  })
}

function confirmResetPassword(emp: any) {
  confirm.require({
    group: 'headless',
    header: 'Reset Password',
    message: `Reset password untuk <strong>${emp.name}</strong> menjadi "cakra123"?`,
    accept: async () => {
      try {
        await employeeService.resetPassword(emp.id)
        toast.add({ severity: 'success', summary: 'Sukses', detail: `Password ${emp.name} berhasil direset`, life: 3000 })
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mereset password', life: 3000 })
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
</script>
