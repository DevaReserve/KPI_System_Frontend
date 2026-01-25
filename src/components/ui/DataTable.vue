<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
    
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="!data || data.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500">
      <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-sm font-medium">Belum ada data tersedia.</p>
    </div>

    <div v-else class="flex-1 overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="col in columns" 
              :key="col.key"
              scope="col" 
              class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none group"
              :class="col.class"
              @click="handleSort(col.key)"
            >
              <div class="flex items-center gap-2">
                {{ col.label }}
                <span class="flex flex-col text-[8px] leading-[8px] text-gray-400 group-hover:text-gray-600">
                  <i class="pi pi-chevron-up" :class="{ 'text-blue-600 font-bold': sortKey === col.key && sortOrder === 'asc' }"></i>
                  <i class="pi pi-chevron-down" :class="{ 'text-blue-600 font-bold': sortKey === col.key && sortOrder === 'desc' }"></i>
                </span>
              </div>
            </th>
            <th v-if="$slots.actions" scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in paginatedData" :key="index" class="hover:bg-gray-50 transition-colors">
            
            <td 
              v-for="col in columns" 
              :key="col.key" 
              class="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-700"
            >
              <slot :name="col.key" :item="item" :value="item[col.key]">
                {{ item[col.key] || '-' }}
              </slot>
            </td>

            <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
              <div class="flex items-center gap-4">
                <slot name="actions" :item="item"></slot>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="data && data.length > 0 && enablePagination" class="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-500">
            Menampilkan <span class="font-medium text-gray-800">{{ startItem }}</span> - <span class="font-medium text-gray-800">{{ endItem }}</span> dari <span class="font-medium text-gray-800">{{ filteredData.length }}</span> data
        </div>
        
        <div class="flex items-center gap-2">
            <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            >
                <i class="pi pi-chevron-left text-xs"></i>
            </button>
            
            <div class="flex gap-1">
                <button 
                    v-for="page in visiblePages" 
                    :key="page"
                    @click="currentPage = page"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors"
                    :class="currentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'"
                >
                    {{ page }}
                </button>
            </div>

            <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
                class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
            >
                <i class="pi pi-chevron-right text-xs"></i>
            </button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Definisi Props
const props = withDefaults(defineProps<{
  columns: Array<{ key: string; label: string; class?: string }>;
  data: any[];
  loading?: boolean;
  enablePagination?: boolean; // Opsi untuk mematikan paging jika tidak perlu
  rowsPerPage?: number;
}>(), {
  enablePagination: true,
  rowsPerPage: 10
})

// --- SORTING LOGIC ---
const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

function handleSort(key: string) {
  if (sortKey.value === key) {
    // Toggle order
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Set new key, default asc
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Data setelah di-sort
const filteredData = computed(() => {
  if (!props.data) return []
  
  let sorted = [...props.data]
  
  if (sortKey.value) {
    sorted.sort((a, b) => {
      let valA = a[sortKey.value]
      let valB = b[sortKey.value]

      // Handle null/undefined
      if (valA == null) valA = ''
      if (valB == null) valB = ''

      // Cek tipe data (number vs string)
      if (!isNaN(Number(valA)) && !isNaN(Number(valB)) && valA !== '' && valB !== '') {
          valA = Number(valA)
          valB = Number(valB)
      } else {
          valA = String(valA).toLowerCase()
          valB = String(valB).toLowerCase()
      }

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  
  return sorted
})

// --- PAGINATION LOGIC ---
const currentPage = ref(1)

// Reset halaman ke 1 jika data berubah (misal habis search)
watch(() => props.data, () => {
    currentPage.value = 1
})

const totalPages = computed(() => {
    return Math.ceil(filteredData.value.length / props.rowsPerPage)
})

const paginatedData = computed(() => {
    if (!props.enablePagination) return filteredData.value
    
    const start = (currentPage.value - 1) * props.rowsPerPage
    const end = start + props.rowsPerPage
    return filteredData.value.slice(start, end)
})

const startItem = computed(() => {
    if (filteredData.value.length === 0) return 0
    return (currentPage.value - 1) * props.rowsPerPage + 1
})

const endItem = computed(() => {
    return Math.min(currentPage.value * props.rowsPerPage, filteredData.value.length)
})

// Logic Tombol Halaman (Biar tidak terlalu panjang misal ada 100 halaman)
const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    const total = totalPages.value
    
    if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) pages.push(i)
    } else {
        // Logic simple: selalu tampilkan current page di tengah jika memungkinkan
        let start = Math.max(1, currentPage.value - 2)
        let end = Math.min(total, start + maxVisible - 1)
        
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1)
        }

        for (let i = start; i <= end; i++) pages.push(i)
    }
    return pages
})

function nextPage() {
    if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
    if (currentPage.value > 1) currentPage.value--
}
</script>
