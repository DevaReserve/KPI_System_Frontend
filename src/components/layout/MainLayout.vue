<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden relative">
    
    <Sidebar :is-open="isSidebarOpen" @closeSidebar="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden relative w-full">
      <Navbar @toggleSidebar="isSidebarOpen = !isSidebarOpen" />

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 scroll-smooth">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
      @click="isSidebarOpen = false"
    ></div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const isSidebarOpen = ref(false)
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
main::-webkit-scrollbar { width: 8px; }
main::-webkit-scrollbar-track { background: #f1f1f1; }
main::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
main::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>
