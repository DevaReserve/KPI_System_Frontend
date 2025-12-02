<template>
  <div 
    class="min-h-screen flex items-center justify-center p-4"
    style="background: linear-gradient(0deg, rgba(16, 70, 97, 1) 0%, rgba(26, 130, 186, 1) 50%, rgba(181, 220, 245, 1) 100%);"
  >
    
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-10">
      
      <div class="mb-8">
        <!-- <img src="/images/logos/cakra.png" alt="Cakra logo" class="h-12 mb-4"> -->
        
        <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
          Sign in
        </h2>
      </div>

      <form class="space-y-6" @submit.prevent="handleLogin" autocomplete="off">
        
        <div v-if="errorMsg" class="rounded-lg bg-red-50 p-4 border border-red-100 flex items-start">
          <svg class="h-5 w-5 text-red-500 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm font-medium text-red-800">{{ errorMsg }}</p>
        </div>

        <div>
          <label for="username" class="block text-base font-semibold text-gray-700 mb-3">Username</label>
          <input 
            id="username" 
            v-model="form.username" 
            type="text" 
            name="username_input_no_suggest"
            required 
            autocomplete="off"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            class="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-all sm:text-sm" 
          >
        </div>

        <div>
          <label for="password" class="block text-base font-semibold text-gray-700 mb-3">Password</label>
          <div class="relative">
            <input 
              id="password" 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              autocomplete="new-password"
              class="block w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-all sm:text-sm" 
            >
            <button 
              type="button" 
              @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 focus:outline-none"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="authStore.isLoading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="authStore.isLoading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const errorMsg = ref('')
const showPassword = ref(false)

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

async function handleLogin() {
  try {
    errorMsg.value = ''
    await authStore.login(form)
    router.push('/')
  } catch (err: any) {
    errorMsg.value = authStore.error || 'Login failed. Please check your credentials.'
  }
}
</script>

<style scoped>
/* Target saat browser melakukan autofill */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active{
    /* Ganti warna background kuning dengan BIRU MUDA (#eff6ff) */
    /* Gunakan box-shadow inset untuk menimpa warna default browser */
    -webkit-box-shadow: 0 0 0 30px #eff6ff inset !important;
    
    /* Pastikan warna teks tetap gelap agar terbaca */
    -webkit-text-fill-color: #1f2937 !important;
    
    /* Opsional: Jika ingin transisi halus */
    transition: background-color 5000s ease-in-out 0s;
}
</style>
