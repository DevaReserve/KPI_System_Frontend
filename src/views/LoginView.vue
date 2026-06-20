<template>
  <main class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-50 to-cyan-100 bg-[length:200%_200%] animate-bg-shift p-4 sm:p-8 lg:p-12 font-sans selection:bg-blue-100 selection:text-blue-900">
    <div class="w-full max-w-7xl flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-2xl overflow-hidden lg:min-h-[700px] border border-slate-200/50">
      
      <section class="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-16">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] bg-repeat opacity-40"></div>
        
        <div class="relative z-10 animate-fade-in">
          <div class="inline-flex items-center gap-4">
            <img 
              src="/images/logos/min_cmd.png" 
              alt="Logo PT. Cakra Media Data" 
              class="w-16 h-auto object-contain drop-shadow-md"
            />
          </div>
        </div>

        <div class="relative z-10 max-w-xl mb-12">
          <h1 class="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-8 leading-tight animate-slide-fade-right">
            Sistem <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
              Key Performance Indicator
            </span>
          </h1>
        </div>

        <div class="relative z-10 text-slate-500 text-base font-medium animate-fade-in animation-delay-400 opacity-0">
          &copy; 2026 PT. Cakra Media Data.
        </div>
      </section>

      <section class="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-white relative">

        <div class="w-full max-w-md mx-auto mt-8 lg:mt-0">
          
          <!-- Logo khusus Mobile (Hanya tampil di layar kecil) -->
          <div class="mb-8 flex justify-center lg:hidden">
            <img 
              src="/images/logos/min_cmd.png" 
              alt="Logo PT. Cakra Media Data" 
              class="h-14 w-auto object-contain drop-shadow-sm"
            />
          </div>

          <div class="mb-12 text-center lg:text-left">
            <h2 class="text-4xl font-bold text-slate-900 tracking-tight">Selamat Datang</h2>
            <p class="mt-3 text-base text-slate-500">Silakan masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form class="space-y-7" @submit.prevent="handleLogin" autocomplete="off">
            
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform -translate-y-2 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="transform translate-y-0 opacity-100"
              leave-to-class="transform -translate-y-2 opacity-0"
            >
              <div v-if="errorMessage" class="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start shadow-sm">
                <svg class="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm font-medium text-red-800 leading-relaxed">{{ errorMessage }}</p>
              </div>
            </Transition>

            <div class="space-y-2.5">
              <label for="username" class="block text-sm font-bold text-slate-700">Username</label>
              <input 
                id="username" 
                ref="usernameInput"
                v-model="username" 
                type="text" 
                name="username"
                required 
                autocomplete="username"
                :disabled="isLoading"
                class="block w-full rounded-xl border border-slate-300 bg-white px-5 py-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all duration-200 sm:text-base shadow-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed" 
                placeholder="Masukkan username"
              >
            </div>

            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <label for="password" class="block text-sm font-bold text-slate-700">Password</label>
              </div>
              
              <div class="relative group">
                <input 
                  id="password" 
                  v-model="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  name="password"
                  required 
                  autocomplete="current-password"
                  :disabled="isLoading"
                  class="block w-full rounded-xl border border-slate-300 bg-white px-5 py-4 pr-14 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all duration-200 sm:text-base shadow-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed" 
                  placeholder="••••••••"
                >
                <button 
                  type="button" 
                  @click="togglePasswordVisibility"
                  :disabled="isLoading"
                  class="absolute inset-y-0 right-0 pr-3.5 pl-2 flex items-center z-10 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors disabled:cursor-not-allowed group-focus-within:text-blue-600"
                  aria-label="Toggle password visibility"
                >
                  <div class="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <div class="pt-5">
              <button 
                type="submit" 
                :disabled="isLoading"
                class="relative w-full flex justify-center items-center py-4 px-4 rounded-xl text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="ml-2.5">Memproses...</span>
                </div>
                <span :class="{ 'opacity-0': isLoading }">Masuk ke Dashboard</span>
              </button>
            </div>

          </form>

          <p class="mt-8 text-center text-sm text-slate-400 lg:hidden">
            &copy; 2026 PT. Cakra Media Data
          </p>
        </div>
        
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const usernameInput = ref<HTMLInputElement | null>(null)
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

onMounted(() => {
  if (usernameInput.value) {
    usernameInput.value.focus()
  }
})

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

async function handleLogin() {
  if (!username.value || !password.value) return

  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await authStore.login({ 
      username: username.value, 
      password: password.value 
    })
    
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Kredensial tidak valid. Silakan periksa kembali.'
    
    password.value = ''
    setTimeout(() => {
      const pwdElement = document.getElementById('password')
      if (pwdElement) pwdElement.focus()
    }, 100)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes slide-fade-right {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes bg-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-bg-shift {
  animation: bg-shift 12s ease-in-out infinite;
}

.animate-slide-fade-right {
  animation: slide-fade-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}
</style>
