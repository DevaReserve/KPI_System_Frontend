<template>
  <main class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-50 to-cyan-100 bg-[length:200%_200%] animate-bg-shift p-4 sm:p-8 lg:p-12 font-sans selection:bg-blue-100 selection:text-blue-900">
    <div class="w-full max-w-7xl flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-2xl overflow-hidden lg:min-h-[700px] border border-slate-200/50">
      
      <!-- ============================================= -->
      <!-- LEFT PANEL (Desktop Only - Branding)          -->
      <!-- ============================================= -->
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
            Reset <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
              Password Anda
            </span>
          </h1>
          <p class="text-slate-400 text-lg leading-relaxed animate-fade-in animation-delay-200 opacity-0">
            Pulihkan akses akun Anda dengan mudah menggunakan kode verifikasi OTP melalui email.
          </p>
        </div>

        <div class="relative z-10 text-slate-500 text-base font-medium animate-fade-in animation-delay-400 opacity-0">
          &copy; 2026 PT. Cakra Media Data.
        </div>
      </section>

      <!-- ============================================= -->
      <!-- RIGHT PANEL (Form Area)                       -->
      <!-- ============================================= -->
      <section class="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-white relative">
        <div class="w-full max-w-md mx-auto mt-8 lg:mt-0">

          <!-- Logo khusus Mobile -->
          <div class="mb-8 flex justify-center lg:hidden">
            <img 
              src="/images/logos/min_cmd.png" 
              alt="Logo PT. Cakra Media Data" 
              class="h-14 w-auto object-contain drop-shadow-sm"
            />
          </div>

          <!-- ============================================= -->
          <!-- STEP INDICATOR                                -->
          <!-- ============================================= -->
          <div class="mb-10">
            <div class="flex items-center justify-center gap-3">
              <template v-for="s in 3" :key="s">
                <div 
                  class="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-500"
                  :class="s < currentStep 
                    ? 'bg-emerald-500 text-white scale-90' 
                    : s === currentStep 
                      ? 'bg-slate-900 text-white ring-4 ring-slate-900/20 scale-110' 
                      : 'bg-slate-100 text-slate-400'"
                >
                  <svg v-if="s < currentStep" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span v-else>{{ s }}</span>
                </div>
                <div 
                  v-if="s < 3" 
                  class="w-12 h-0.5 rounded-full transition-all duration-500"
                  :class="s < currentStep ? 'bg-emerald-500' : 'bg-slate-200'"
                ></div>
              </template>
            </div>
          </div>

          <!-- ============================================= -->
          <!-- ALERT / STATUS MESSAGES                       -->
          <!-- ============================================= -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
          >
            <div v-if="errorMessage" class="mb-6 rounded-xl bg-red-50 p-4 border border-red-100 flex items-start shadow-sm">
              <svg class="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm font-medium text-red-800 leading-relaxed">{{ errorMessage }}</p>
            </div>
          </Transition>

          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
          >
            <div v-if="successMessage" class="mb-6 rounded-xl bg-emerald-50 p-4 border border-emerald-100 flex items-start shadow-sm">
              <svg class="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm font-medium text-emerald-800 leading-relaxed">{{ successMessage }}</p>
            </div>
          </Transition>

          <!-- ============================================= -->
          <!-- STEP 1: INPUT EMAIL                           -->
          <!-- ============================================= -->
          <Transition
            enter-active-class="transition duration-400 ease-out"
            enter-from-class="transform translate-x-8 opacity-0"
            enter-to-class="transform translate-x-0 opacity-100"
            leave-active-class="transition duration-300 ease-in absolute inset-0"
            leave-from-class="transform translate-x-0 opacity-100"
            leave-to-class="transform -translate-x-8 opacity-0"
          >
            <div v-if="currentStep === 1" key="step-1">
              <div class="mb-8 text-center lg:text-left">
                <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Lupa Password?</h2>
                <p class="mt-3 text-base text-slate-500">Masukkan alamat email yang terdaftar di akun Anda</p>
              </div>

              <form @submit.prevent="handleSendOTP" class="space-y-6" autocomplete="off">
                <div class="space-y-2.5">
                  <label for="email" class="block text-sm font-bold text-slate-700">Alamat Email</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <input 
                      id="email"
                      ref="emailInput"
                      v-model="email" 
                      type="email" 
                      required 
                      :disabled="isLoading"
                      class="block w-full rounded-xl border border-slate-300 bg-white pl-12 pr-5 py-4 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all duration-200 sm:text-base shadow-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                      placeholder="contoh@email.com"
                    >
                  </div>
                </div>

                <div class="pt-3">
                  <button 
                    type="submit"
                    :disabled="isLoading || !email"
                    class="relative w-full flex justify-center items-center py-4 px-4 rounded-xl text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="ml-2.5">Mengirim OTP...</span>
                    </div>
                    <span :class="{ 'opacity-0': isLoading }">Kirim Kode OTP</span>
                  </button>
                </div>
              </form>

              <div class="mt-8 text-center">
                <router-link to="/login" class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 group">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Kembali ke halaman Login
                </router-link>
              </div>
            </div>
          </Transition>

          <!-- ============================================= -->
          <!-- STEP 2: INPUT OTP                             -->
          <!-- ============================================= -->
          <Transition
            enter-active-class="transition duration-400 ease-out"
            enter-from-class="transform translate-x-8 opacity-0"
            enter-to-class="transform translate-x-0 opacity-100"
            leave-active-class="transition duration-300 ease-in absolute inset-0"
            leave-from-class="transform translate-x-0 opacity-100"
            leave-to-class="transform -translate-x-8 opacity-0"
          >
            <div v-if="currentStep === 2" key="step-2">
              <div class="mb-8 text-center lg:text-left">
                <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Verifikasi OTP</h2>
                <p class="mt-3 text-base text-slate-500">
                  Masukkan 6 digit kode yang dikirim ke
                  <span class="font-semibold text-slate-700 break-all">{{ email }}</span>
                </p>
              </div>

              <form @submit.prevent="handleVerifyOTP" class="space-y-6" autocomplete="off">
                <!-- OTP Input Boxes -->
                <div class="flex justify-center gap-3">
                  <input
                    v-for="(_, index) in 6"
                    :key="index"
                    :ref="el => { otpInputRefs[index] = el as HTMLInputElement }"
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    :disabled="isLoading"
                    class="w-13 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                    :class="otpDigits[index] 
                      ? 'border-blue-500 bg-blue-50/50 text-slate-900 ring-2 ring-blue-500/20' 
                      : 'border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'"
                    :value="otpDigits[index]"
                    @input="handleOTPInput($event, index)"
                    @keydown="handleOTPKeydown($event, index)"
                    @paste="handleOTPPaste"
                  >
                </div>

                <!-- Countdown Timer -->
                <div class="text-center">
                  <p v-if="countdown > 0" class="text-sm text-slate-500">
                    Kode berlaku dalam 
                    <span class="font-bold text-slate-900 tabular-nums">{{ formatCountdown }}</span>
                  </p>
                  <p v-else class="text-sm text-red-500 font-medium">
                    Kode OTP telah kedaluwarsa
                  </p>
                </div>

                <div class="pt-1">
                  <button 
                    type="submit"
                    :disabled="isLoading || otpDigits.join('').length !== 6"
                    class="relative w-full flex justify-center items-center py-4 px-4 rounded-xl text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="ml-2.5">Memverifikasi...</span>
                    </div>
                    <span :class="{ 'opacity-0': isLoading }">Verifikasi Kode</span>
                  </button>
                </div>

                <!-- Resend OTP -->
                <div class="text-center">
                  <button 
                    type="button"
                    :disabled="isLoading || resendCooldown > 0"
                    @click="handleResendOTP"
                    class="text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                    :class="resendCooldown > 0 ? 'text-slate-400' : 'text-blue-600 hover:text-blue-800'"
                  >
                    <span v-if="resendCooldown > 0">Kirim ulang dalam {{ resendCooldown }}s</span>
                    <span v-else>Kirim Ulang Kode OTP</span>
                  </button>
                </div>
              </form>

              <div class="mt-6 text-center">
                <button 
                  @click="goBackToStep1"
                  class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Ganti email
                </button>
              </div>
            </div>
          </Transition>

          <!-- ============================================= -->
          <!-- STEP 3: NEW PASSWORD                          -->
          <!-- ============================================= -->
          <Transition
            enter-active-class="transition duration-400 ease-out"
            enter-from-class="transform translate-x-8 opacity-0"
            enter-to-class="transform translate-x-0 opacity-100"
            leave-active-class="transition duration-300 ease-in absolute inset-0"
            leave-from-class="transform translate-x-0 opacity-100"
            leave-to-class="transform -translate-x-8 opacity-0"
          >
            <div v-if="currentStep === 3" key="step-3">
              <div class="mb-8 text-center lg:text-left">
                <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Buat Password Baru</h2>
                <p class="mt-3 text-base text-slate-500">Masukkan password baru untuk akun Anda</p>
              </div>

              <form @submit.prevent="handleResetPassword" class="space-y-6" autocomplete="off">
                <div class="space-y-2.5">
                  <label for="new-password" class="block text-sm font-bold text-slate-700">Password Baru</label>
                  <div class="relative group">
                    <input 
                      id="new-password"
                      ref="newPasswordInput"
                      v-model="newPassword"
                      :type="showNewPassword ? 'text' : 'password'" 
                      required
                      minlength="6"
                      :disabled="isLoading"
                      class="block w-full rounded-xl border border-slate-300 bg-white px-5 py-4 pr-14 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all duration-200 sm:text-base shadow-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                      placeholder="Minimal 6 karakter"
                    >
                    <button 
                      type="button" 
                      @click="showNewPassword = !showNewPassword"
                      :disabled="isLoading"
                      class="absolute inset-y-0 right-0 pr-3.5 pl-2 flex items-center z-10 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors disabled:cursor-not-allowed"
                    >
                      <div class="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </button>
                  </div>
                  <!-- Password Strength Indicator -->
                  <div v-if="newPassword" class="flex gap-1.5 mt-2">
                    <div 
                      v-for="i in 4" :key="i"
                      class="h-1.5 flex-1 rounded-full transition-all duration-300"
                      :class="i <= passwordStrength 
                        ? passwordStrengthColor 
                        : 'bg-slate-200'"
                    ></div>
                  </div>
                  <p v-if="newPassword" class="text-xs mt-1" :class="passwordStrengthTextColor">
                    {{ passwordStrengthLabel }}
                  </p>
                </div>

                <div class="space-y-2.5">
                  <label for="confirm-password" class="block text-sm font-bold text-slate-700">Konfirmasi Password</label>
                  <div class="relative group">
                    <input 
                      id="confirm-password"
                      v-model="confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'" 
                      required
                      minlength="6"
                      :disabled="isLoading"
                      class="block w-full rounded-xl border bg-white px-5 py-4 pr-14 text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-200 sm:text-base shadow-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                      :class="confirmPassword && confirmPassword !== newPassword 
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : confirmPassword && confirmPassword === newPassword 
                          ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20' 
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'"
                      placeholder="Masukkan ulang password baru"
                    >
                    <button 
                      type="button" 
                      @click="showConfirmPassword = !showConfirmPassword"
                      :disabled="isLoading"
                      class="absolute inset-y-0 right-0 pr-3.5 pl-2 flex items-center z-10 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors disabled:cursor-not-allowed"
                    >
                      <div class="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </button>
                  </div>
                  <p v-if="confirmPassword && confirmPassword !== newPassword" class="text-xs text-red-500 font-medium mt-1">
                    Password tidak cocok
                  </p>
                  <p v-else-if="confirmPassword && confirmPassword === newPassword" class="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Password cocok
                  </p>
                </div>

                <div class="pt-3">
                  <button 
                    type="submit"
                    :disabled="isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6"
                    class="relative w-full flex justify-center items-center py-4 px-4 rounded-xl text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-slate-900">
                      <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="ml-2.5">Menyimpan...</span>
                    </div>
                    <span :class="{ 'opacity-0': isLoading }">Simpan Password Baru</span>
                  </button>
                </div>
              </form>
            </div>
          </Transition>

          <!-- ============================================= -->
          <!-- STEP 4: SUCCESS                               -->
          <!-- ============================================= -->
          <Transition
            enter-active-class="transition duration-400 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
          >
            <div v-if="currentStep === 4" key="step-success" class="text-center py-8">
              <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce-once">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-slate-900 mb-3">Password Berhasil Direset!</h2>
              <p class="text-slate-500 mb-8">Silakan login dengan password baru Anda.</p>
              <router-link 
                to="/login"
                class="inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Masuk ke Akun
              </router-link>
            </div>
          </Transition>

          <p class="mt-8 text-center text-sm text-slate-400 lg:hidden">
            &copy; 2026 PT. Cakra Media Data
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { passwordResetService } from '../services/api'

// ===================================================================
// STATE
// ===================================================================
const currentStep = ref(1)
const email = ref('')
const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const countdown = ref(600) // 10 minutes in seconds
const resendCooldown = ref(0)

// Refs
const emailInput = ref<HTMLInputElement | null>(null)
const newPasswordInput = ref<HTMLInputElement | null>(null)
const otpInputRefs = ref<(HTMLInputElement | null)[]>([])

// Timers
let countdownTimer: number | null = null
let resendTimer: number | null = null

// ===================================================================
// COMPUTED
// ===================================================================
const formatCountdown = computed(() => {
  const mins = Math.floor(countdown.value / 60)
  const secs = countdown.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const passwordStrength = computed(() => {
  const pw = newPassword.value
  if (!pw) return 0
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++
  return score
})

const passwordStrengthColor = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'bg-red-400'
  if (s === 2) return 'bg-amber-400'
  if (s === 3) return 'bg-blue-400'
  return 'bg-emerald-500'
})

const passwordStrengthTextColor = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'text-red-500'
  if (s === 2) return 'text-amber-500'
  if (s === 3) return 'text-blue-500'
  return 'text-emerald-500'
})

const passwordStrengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'Lemah — tambahkan huruf besar, angka, atau simbol'
  if (s === 2) return 'Cukup — bisa lebih kuat lagi'
  if (s === 3) return 'Bagus — password cukup kuat'
  return 'Kuat — password sangat aman'
})

// ===================================================================
// OTP INPUT HANDLERS
// ===================================================================
function handleOTPInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '') // Only digits

  if (value) {
    otpDigits.value[index] = value[0]
    // Auto focus next
    if (index < 5) {
      nextTick(() => {
        otpInputRefs.value[index + 1]?.focus()
      })
    }
  } else {
    otpDigits.value[index] = ''
  }
}

function handleOTPKeydown(event: KeyboardEvent, index: number) {
  // Backspace: hapus digit saat ini, lalu pindah ke sebelumnya
  if (event.key === 'Backspace') {
    if (!otpDigits.value[index] && index > 0) {
      otpDigits.value[index - 1] = ''
      nextTick(() => {
        otpInputRefs.value[index - 1]?.focus()
      })
    } else {
      otpDigits.value[index] = ''
    }
  }
  // Arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    otpInputRefs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index < 5) {
    otpInputRefs.value[index + 1]?.focus()
  }
}

function handleOTPPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')?.replace(/\D/g, '')?.slice(0, 6)
  if (pastedData) {
    for (let i = 0; i < 6; i++) {
      otpDigits.value[i] = pastedData[i] || ''
    }
    // Focus the last filled or the next empty
    const lastIndex = Math.min(pastedData.length, 5)
    nextTick(() => {
      otpInputRefs.value[lastIndex]?.focus()
    })
  }
}

// ===================================================================
// TIMERS
// ===================================================================
function startCountdown() {
  countdown.value = 600 // 10 minutes
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      if (countdownTimer) clearInterval(countdownTimer)
    }
  }, 1000)
}

function startResendCooldown() {
  resendCooldown.value = 60 // 60 seconds cooldown
  if (resendTimer) clearInterval(resendTimer)
  resendTimer = window.setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--
    } else {
      if (resendTimer) clearInterval(resendTimer)
    }
  }, 1000)
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

// ===================================================================
// API HANDLERS
// ===================================================================
async function handleSendOTP() {
  if (!email.value) return
  clearMessages()
  isLoading.value = true

  try {
    const msg = await passwordResetService.forgotPassword(email.value)
    successMessage.value = msg
    currentStep.value = 2
    startCountdown()
    startResendCooldown()
    
    // Auto focus first OTP input
    nextTick(() => {
      otpInputRefs.value[0]?.focus()
    })
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

async function handleVerifyOTP() {
  const otp = otpDigits.value.join('')
  if (otp.length !== 6) return
  clearMessages()
  isLoading.value = true

  try {
    await passwordResetService.verifyOTP(email.value, otp)
    currentStep.value = 3
    
    // Auto focus new password input
    nextTick(() => {
      newPasswordInput.value?.focus()
    })
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Kode OTP tidak valid.'
  } finally {
    isLoading.value = false
  }
}

async function handleResetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Password baru dan konfirmasi password tidak cocok'
    return
  }
  if (newPassword.value.length < 6) {
    errorMessage.value = 'Password minimal 6 karakter'
    return
  }

  clearMessages()
  isLoading.value = true

  try {
    await passwordResetService.resetPassword({
      email: email.value,
      otp: otpDigits.value.join(''),
      new_password: newPassword.value,
      confirm_password: confirmPassword.value
    })
    
    // Clear timers
    if (countdownTimer) clearInterval(countdownTimer)
    
    currentStep.value = 4
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Gagal mereset password. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

async function handleResendOTP() {
  clearMessages()
  otpDigits.value = ['', '', '', '', '', '']
  isLoading.value = true

  try {
    const msg = await passwordResetService.forgotPassword(email.value)
    successMessage.value = 'Kode OTP baru telah dikirim ke email Anda'
    startCountdown()
    startResendCooldown()
    
    nextTick(() => {
      otpInputRefs.value[0]?.focus()
    })
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Gagal mengirim ulang OTP.'
  } finally {
    isLoading.value = false
  }
}

function goBackToStep1() {
  clearMessages()
  otpDigits.value = ['', '', '', '', '', '']
  if (countdownTimer) clearInterval(countdownTimer)
  currentStep.value = 1
}

// ===================================================================
// LIFECYCLE
// ===================================================================
onMounted(() => {
  emailInput.value?.focus()
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (resendTimer) clearInterval(resendTimer)
})
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

@keyframes bounce-once {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.1); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
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

.animate-bounce-once {
  animation: bounce-once 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}
</style>
