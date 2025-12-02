<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Pegawai</h1>
      <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Tambah Pegawai
      </button>
    </div>

    <DataTable :columns="tableColumns" :data="employees" :loading="isLoading">
      
      <template #name="{ item }">
        <div class="flex items-center">
          <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-4"
            :class="item.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'">
            {{ item.name.charAt(0) }}
          </div>
          <div>
            <div class="text-sm font-medium" :class="item.is_active ? 'text-gray-900' : 'text-gray-400'">{{ item.name }}</div>
            <div class="text-sm text-gray-500">{{ item.email }}</div>
            <div class="text-xs text-gray-400">NIP: {{ item.nip }}</div>
          </div>
        </div>
      </template>

      <template #position="{ item }">
        <div class="text-sm font-medium text-gray-900">{{ item.position }}</div>
        <div class="text-sm text-gray-500">{{ item.division_name }}</div>
      </template>

      <template #username="{ item }">
        <div class="text-sm text-gray-900 mb-1">@{{ item.username }}</div>
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
          :class="{
            'bg-purple-100 text-purple-800': item.role === 'admin',
            'bg-green-100 text-green-800': item.role === 'manager',
            'bg-gray-100 text-gray-800': item.role === 'employee'
          }">
          {{ item.role ? item.role.toUpperCase() : '-' }}
        </span>
      </template>

      <template #is_active="{ value }">
        <span v-if="value" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Aktif
        </span>
        <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Non-Aktif
        </span>
      </template>

      <template #actions="{ item }">
        <button @click="openModal(item)" class="text-indigo-600 hover:text-indigo-900 font-medium transition-colors">Edit</button>
        <button 
          v-if="item.is_active" @click="toggleStatus(item)" 
          class="text-red-600 hover:text-red-900 font-medium transition-colors">Non-Aktifkan</button>
        <button 
          v-else @click="toggleStatus(item)" 
          class="text-green-600 hover:text-green-900 font-bold transition-colors">Aktifkan</button>
      </template>

    </DataTable>

    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <div class="bg-white px-6 pt-6 pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4">{{ isEditing ? 'Edit Pegawai' : 'Tambah Pegawai' }}</h3>
            <form @submit.prevent="saveEmployee" class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div class="sm:col-span-2 pb-1 border-b border-gray-100"><span class="text-xs font-bold text-gray-500 uppercase">Data Pribadi</span></div>
               <div><label class="block text-sm font-medium mb-1">NIP</label><input v-model="form.nip" class="w-full rounded-lg border border-gray-300 px-3 py-2" required></div>
               <div><label class="block text-sm font-medium mb-1">Nama</label><input v-model="form.name" class="w-full rounded-lg border border-gray-300 px-3 py-2" required></div>
               <div><label class="block text-sm font-medium mb-1">Email</label><input v-model="form.email" type="email" class="w-full rounded-lg border border-gray-300 px-3 py-2" required></div>
               <div><label class="block text-sm font-medium mb-1">Tanggal Gabung</label><input v-model="form.join_date" type="date" class="w-full rounded-lg border border-gray-300 px-3 py-2" required></div>
               
               <div class="sm:col-span-2 pb-1 border-b border-gray-100 mt-2"><span class="text-xs font-bold text-gray-500 uppercase">Posisi</span></div>
               <div><label class="block text-sm font-medium mb-1">Divisi</label><select v-model="form.division_id" class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white" required><option v-for="d in divisions" :key="d.id" :value="d.id">{{d.name}}</option></select></div>
               <div><label class="block text-sm font-medium mb-1">Jabatan</label><input v-model="form.position" class="w-full rounded-lg border border-gray-300 px-3 py-2" required></div>
               
               <div class="sm:col-span-2 pb-1 border-b border-gray-100 mt-2"><span class="text-xs font-bold text-gray-500 uppercase">Akun</span></div>
               <div><label class="block text-sm font-medium mb-1">Username</label><input v-model="form.username" class="w-full rounded-lg border border-gray-300 px-3 py-2" required></div>
               <div><label class="block text-sm font-medium mb-1">Role</label><select v-model="form.role" class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white" required><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option></select></div>
               <div v-if="!isEditing" class="sm:col-span-2"><label class="block text-sm font-medium mb-1">Password</label><input v-model="form.password" type="password" class="w-full rounded-lg border border-gray-300 px-3 py-2" required></div>

               <div class="sm:col-span-2 flex justify-end gap-3 mt-6">
                  <button type="button" @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                  <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{{ isProcessing ? 'Menyimpan...' : 'Simpan' }}</button>
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
import { employeeService, divisionService } from '../../services/api'
import type { Division } from '../../types'
import DataTable from '../../components/ui/DataTable.vue'

// Definisi Kolom Tabel (Kunci utama untuk Datatable)
const tableColumns = [
  { key: 'name', label: 'Pegawai' },
  { key: 'position', label: 'Divisi & Jabatan' },
  { key: 'username', label: 'Akun User' },
  { key: 'is_active', label: 'Status' },
]

const employees = ref<any[]>([])
const divisions = ref<Division[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const isProcessing = ref(false)

const form = reactive({
  id: 0, nip: '', name: '', email: '', join_date: '', 
  division_id: '', position: '', username: '', password: '', 
  role: 'employee', is_active: true
})

onMounted(async () => { await fetchData() })

async function fetchData() {
  isLoading.value = true
  try {
    const [emps, divs] = await Promise.all([employeeService.getAll(), divisionService.getAll()])
    employees.value = emps
    divisions.value = divs
  } catch (error) { console.error(error) } 
  finally { isLoading.value = false }
}

function openModal(emp?: any) {
  if (emp) {
    isEditing.value = true
    form.id = emp.id; form.nip = emp.nip; form.name = emp.name; form.email = emp.email;
    form.join_date = emp.join_date ? emp.join_date.split('T')[0] : '';
    form.division_id = emp.division_id; form.position = emp.position;
    form.username = emp.username || ''; form.role = emp.role || 'employee';
    form.is_active = emp.is_active; form.password = ''
  } else {
    isEditing.value = false
    Object.assign(form, { id: 0, nip: '', name: '', email: '', join_date: '', division_id: '', position: '', username: '', password: '', role: 'employee', is_active: true })
  }
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function saveEmployee() {
  try {
    isProcessing.value = true
    const payload = { ...form, division_id: Number(form.division_id), join_date: new Date(form.join_date).toISOString() }
    isEditing.value ? await employeeService.update(form.id, payload) : await employeeService.create(payload)
    await fetchData()
    closeModal()
  } catch (error: any) { alert(error.response?.data?.message || 'Gagal menyimpan data') } 
  finally { isProcessing.value = false }
}

async function toggleStatus(emp: any) {
  if (confirm(`Ubah status ${emp.name}?`)) {
    try {
      if (emp.is_active) { await employeeService.delete(emp.id) } 
      else { 
        // Payload lengkap untuk update
        const payload = { ...emp, is_active: true } 
        await employeeService.update(emp.id, payload) 
      }
      await fetchData()
    } catch (error: any) { alert('Gagal mengubah status') }
  }
}
</script>
