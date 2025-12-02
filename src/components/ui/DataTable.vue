<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="!data || data.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500">
      <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-sm font-medium">Belum ada data tersedia.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="col in columns" 
              :key="col.key"
              scope="col" 
              class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              :class="col.class"
            >
              {{ col.label }}
            </th>
            <th v-if="$slots.actions" scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in data" :key="index" class="hover:bg-gray-50 transition-colors">
            
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
  </div>
</template>

<script setup lang="ts">
// Definisi Props
defineProps<{
  columns: Array<{ key: string; label: string; class?: string }>;
  data: any[];
  loading?: boolean;
}>()
</script>
