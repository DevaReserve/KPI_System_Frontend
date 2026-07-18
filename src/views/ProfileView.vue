<template>
  <div>
    <Toast />

    <div v-if="showCropModal" class="fixed inset-0 z-[60] overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 text-center">
            <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity" @click="cancelCrop"></div>
            
            <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg w-full">
                <div class="bg-white px-6 pt-6 pb-4">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Sesuaikan Foto Profil</h3>
                    
                    <div class="h-80 w-full bg-gray-900 rounded-lg overflow-hidden mb-4 relative flex items-center justify-center">
                        <cropper
                            ref="cropperRef"
                            class="cropper"
                            :src="cropImgSrc"
                            :stencil-component="CircleStencil"
                            :stencil-props="{ aspectRatio: 1/1 }"
                            image-restriction="stencil"
                        />
                    </div>
                    
                    <p class="text-xs text-gray-500 mb-4 text-center">Geser dan perbesar (scroll) untuk menyesuaikan area foto.</p>

                    <div class="flex justify-end gap-3">
                        <button 
                            @click="cancelCrop" 
                            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button 
                            @click="performCropAndUpload" 
                            :disabled="isProcessing"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm disabled:opacity-50 flex items-center"
                        >
                            <i v-if="isProcessing" class="pi pi-spin pi-spinner mr-2"></i>
                            {{ isProcessing ? 'Menyimpan...' : 'Simpan Foto' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showAchModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeAchModal"></div>
            <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div class="bg-white px-6 pt-6 pb-4">
                    <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6 border-b pb-4">
                        {{ isEditing ? 'Edit Prestasi' : 'Tambah Prestasi Baru' }}
                    </h3>
                    
                    <form @submit.prevent="submitAchievement">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Judul Sertifikat</label>
                            <input v-model="achForm.title" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Pegawai Terbaik Q1">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Perolehan</label>
                            <input v-model="achForm.date" type="date" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                            <textarea v-model="achForm.description" rows="2" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                {{ isEditing ? 'File Bukti' : 'Upload Bukti (PDF/JPG)' }}
                            </label>

                            <div v-if="isEditing && currentFileUrl" class="mb-2 flex items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <i class="pi pi-file text-blue-500 mr-3 text-xl"></i>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-blue-900 truncate">File saat ini tersimpan</p>
                                    <a :href="getProfilePictureUrl(currentFileUrl)" target="_blank" class="text-xs text-blue-600 hover:underline font-bold">
                                        Lihat File Lama
                                    </a>
                                </div>
                            </div>

                            <div class="relative">
                                <label class="block text-xs text-gray-500 mb-1" v-if="isEditing">
                                    Upload file baru di bawah jika ingin mengganti file lama:
                                </label>
                                <input 
                                    ref="achFile" 
                                    type="file" 
                                    :required="!isEditing" 
                                    accept=".pdf,.jpg,.jpeg,.png" 
                                    @change="handleAchFileChange" 
                                    class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                >
                            </div>
                            <p class="text-xs text-gray-600 mt-1">Jika lebih dari 1 foto, silakan upload file PDF yang berisi semua foto.</p>
                            <p class="text-xs text-gray-600 mt-1">Maksimal 5MB.</p>

                        </div>
                        <div class="mt-6 flex justify-end gap-3">
                            <button type="button" @click="closeAchModal" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Batal</button>
                            <button type="submit" :disabled="isProcessing" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
                                {{ isProcessing ? 'Menyimpan...' : 'Simpan' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL EDIT BIODATA & NO TELEPON -->
    <div v-if="showBioModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Glassmorphism backdrop -->
            <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" @click="showBioModal = false"></div>
            
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <!-- Modern rounded-3xl container -->
            <div class="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-slate-100">
                <!-- Clean white header with badge icon -->
                <div class="px-6 py-5 flex items-center justify-between border-b border-slate-100">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                            <i class="pi pi-user-edit text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-800">Biodata & Kontak</h3>
                            <p class="text-xs text-slate-400 mt-0.5">Perbarui profil dan detail kontak Anda</p>
                        </div>
                    </div>
                    <button @click="showBioModal = false" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
                        <i class="pi pi-times text-sm"></i>
                    </button>
                </div>
                
                <form @submit.prevent="saveBiodata" class="p-6 space-y-5">
                    <!-- WhatsApp/Phone -->
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                            <span>No. Telepon / WhatsApp <span class="text-red-500">*</span></span>
                            <span class="text-[10px] text-slate-400 normal-case font-normal">Contoh: 081234567890</span>
                        </label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <i class="pi pi-phone text-sm"></i>
                            </span>
                            <input v-model="bioForm.phone" type="text" required placeholder="08xxxxxxxxxx" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium transition-all duration-200">
                        </div>
                    </div>

                    <!-- Social Media -->
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                            <span>Media Sosial / Profesional</span>
                            <span class="text-[10px] text-slate-400 normal-case font-normal">Platform & username</span>
                        </label>
                        <div class="flex gap-2">
                            <select v-model="bioForm.social_type" class="w-32 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-semibold text-slate-700 transition-all duration-200">
                                <option value="instagram">Instagram</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="telegram">Telegram</option>
                                <option value="other">Website</option>
                            </select>
                            <div class="relative flex-1">
                                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <i :class="bioForm.social_type === 'instagram' ? 'pi pi-instagram text-pink-500' : bioForm.social_type === 'linkedin' ? 'pi pi-linkedin text-blue-600' : bioForm.social_type === 'telegram' ? 'pi pi-telegram text-sky-500' : 'pi pi-globe text-slate-400'" class="text-sm"></i>
                                </span>
                                <input 
                                    v-model="bioForm.social_username" 
                                    type="text" 
                                    :placeholder="bioForm.social_type === 'instagram' ? 'Username' : bioForm.social_type === 'linkedin' ? 'Username atau URL' : bioForm.social_type === 'telegram' ? 'Username' : 'https://website.com'" 
                                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium transition-all duration-200"
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Bio -->
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                            <span>Tentang Saya / Bio Singkat</span>
                            <span class="text-[10px] text-slate-400 normal-case font-normal">Kutipan / Keahlian</span>
                        </label>
                        <textarea v-model="bioForm.bio" rows="2" placeholder="Tuliskan keahlian, dedikasi, atau prinsip kerja Anda..." class="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium transition-all duration-200"></textarea>
                    </div>

                    <!-- Address -->
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                            <span>Alamat Domisili <span class="text-red-500">*</span></span>
                            <span class="text-[10px] text-slate-400 normal-case font-normal">Tempat tinggal saat ini</span>
                        </label>
                        <textarea v-model="bioForm.address" required rows="2" placeholder="Contoh: Jl. Raya Mambal Ubud No. 12, Badung, Bali" class="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium transition-all duration-200"></textarea>
                    </div>

                    <!-- Birthplace & Birthday -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tempat Lahir <span class="text-red-500">*</span></label>
                            <input v-model="bioForm.birth_place" type="text" required placeholder="Denpasar" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium transition-all duration-200">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal Lahir <span class="text-red-500">*</span></label>
                            <input v-model="bioForm.birth_date" type="date" required class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium transition-all duration-200">
                        </div>
                    </div>

                    <!-- Gender & Last Education -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Jenis Kelamin</label>
                            <select v-model="bioForm.gender" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium text-slate-700 transition-all duration-200">
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Pendidikan Terakhir</label>
                            <input v-model="bioForm.education" type="text" placeholder="S1 Teknik Informatika" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium transition-all duration-200">
                        </div>
                    </div>

                    <!-- Emergency Contact -->
                    <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                        <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <i class="pi pi-phone text-slate-500"></i> Kontak Darurat (Emergency Contact)
                        </label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input v-model="bioForm.emergency_contact_name" type="text" placeholder="Nama Kerabat" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 text-xs font-medium bg-white transition-all duration-200">
                            <input v-model="bioForm.emergency_contact_phone" type="text" placeholder="No. Telepon" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 text-xs font-medium bg-white transition-all duration-200">
                        </div>
                    </div>

                    <!-- Footer Action Buttons -->
                    <div class="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                        <button type="button" @click="showBioModal = false" class="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm font-semibold transition">Batal</button>
                        <button type="submit" :disabled="isProcessing" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-bold shadow-md shadow-blue-500/10 disabled:opacity-50 transition-all flex items-center">
                            <i v-if="isProcessing" class="pi pi-spin pi-spinner mr-2"></i>
                            {{ isProcessing ? 'Menyimpan...' : 'Simpan Perubahan' }}
                         </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL VERIFIKASI NO TELEPON (OTP WHATSAPP) -->
    <div v-if="showOTPModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity" @click="showOTPModal = false"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-gray-100">
                <div class="bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-5 text-white">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold flex items-center gap-2">
                            <i class="pi pi-shield text-xl"></i> Verifikasi Nomor Telepon
                        </h3>
                        <button @click="showOTPModal = false" class="text-white/80 hover:text-white transition">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                    <p class="text-xs text-amber-50 mt-1">Gunakan kode verifikasi OTP yang dikirimkan ke WhatsApp Anda.</p>
                </div>
                
                <form @submit.prevent="verifyOTP" class="p-6 space-y-4">
                    <div class="text-center py-2">
                        <p class="text-sm text-gray-600 leading-relaxed">
                            Kami telah mengirimkan 6 digit kode OTP ke nomor WhatsApp 
                            <b class="text-gray-900">{{ userProfile?.employee?.phone }}</b>
                            untuk memvalidasi kepemilikan nomor tersebut.
                        </p>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider text-center mb-3">
                            Masukkan 6 Digit Kode OTP
                        </label>
                        <div class="flex justify-center">
                            <input 
                                v-model="otpInput" 
                                type="text" 
                                maxlength="6" 
                                required 
                                placeholder="######" 
                                class="w-48 text-center text-2xl font-black py-2.5 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-amber-500 tracking-[0.4em] uppercase"
                            >
                        </div>
                    </div>

                    <div class="text-center pt-2">
                        <span v-if="otpCountdown > 0" class="text-xs text-gray-400">
                            Kirim ulang kode dalam <b class="text-gray-600">{{ otpCountdown }} detik</b>
                        </span>
                        <button 
                            v-else 
                            type="button" 
                            @click="resendOTP" 
                            class="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline transition"
                        >
                            Kirim Ulang Kode OTP
                        </button>
                    </div>

                    <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" @click="showOTPModal = false" class="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-semibold transition">Batal</button>
                        <button type="submit" :disabled="isVerifying || otpInput.length !== 6" class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:from-amber-600 hover:to-yellow-700 text-sm font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 transition flex items-center">
                            <i v-if="isVerifying" class="pi pi-spin pi-spinner mr-2"></i>
                            {{ isVerifying ? 'Memverifikasi...' : 'Verifikasi Kontak' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Profil Saya</h1>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
      
      <div class="flex border-b border-gray-200 overflow-x-auto">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap focus:outline-none"
          :class="activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="p-6">
        
        <div v-if="activeTab === 'biodata'" class="space-y-8">
            <!-- Premium Achievements & Top 1 Banner -->
            <div v-if="isTopOne" class="relative p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden">
                
                <div class="flex items-center gap-5 z-10 w-full">
                    <!-- Ikon piala simpel tanpa warna mencolok -->
                    <div class="w-14 h-14 rounded-2xl bg-slate-50 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                        <i class="pi pi-trophy text-2xl"></i>
                    </div>
                    
                    <div>
                        <!-- Badge minimalis -->
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <span class="inline-flex items-center gap-1 px-3 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-full uppercase tracking-wider">
                                <i class="pi pi-star-fill text-[9px]"></i> Top Performer Kinerja
                            </span>
                            <span class="inline-flex items-center px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded-full uppercase tracking-wider">
                                Periode Aktif
                            </span>
                        </div>
                        
                        <!-- Judul dan teks berwarna hitam (slate-900) -->
                        <h3 class="text-lg font-bold text-slate-900 tracking-tight">
                            Anugerah Karyawan Terbaik #1
                        </h3>
                        <p class="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                            Apresiasi setinggi-tingginya untuk <span class="font-bold text-slate-900">{{ userProfile?.employee?.name || authStore.user?.username }}</span> atas dedikasi luar biasa dan performa kerja gemilang yang menjadi inspirasi bagi seluruh tim di PT. Cakra Media Data.
                        </p>
                    </div>
                </div>
                
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 shrink-0 w-full lg:w-auto">
                    <!-- Tombol dicat hitam untuk kontras yang elegan -->
                    <button @click="showCertificateModal = true" class="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs transition-colors duration-200">
                        <i class="pi pi-print text-sm"></i> Cetak E-Sertifikat
                    </button>
                    
                    <!-- Kotak statistik dengan gaya terang -->
                    <div class="bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl text-center flex flex-col justify-center min-w-[100px]">
                        <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Prestasi</p>
                        <p class="text-base font-black text-slate-900 mt-0.5">{{ achievements.length }} <span class="text-[10px] font-medium text-slate-500">Berkas</span></p>
                    </div>
                </div>
            </div>
            <!-- [ALERT WARNING JIKA NO TELEPON KOSONG ATAU BELUM DIVERIFIKASI] -->
            <div v-if="!userProfile?.employee?.phone" class="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
                <div class="flex items-start gap-3.5">
                    <div class="p-2 bg-red-100 rounded-lg text-red-600 mt-0.5">
                        <i class="pi pi-exclamation-triangle text-xl"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-red-900">Nomor Telepon / WhatsApp Belum Dilengkapi!</h4>
                        <p class="text-xs text-red-700 mt-0.5 leading-relaxed">
                            Atasan dan Admin membutuhkan nomor kontak Anda untuk keperluan koordinasi resmi & kedaruratan kerja. Harap lengkapi sekarang juga.
                        </p>
                    </div>
                </div>
                <button @click="openBioModal" class="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition shrink-0 flex items-center">
                    <i class="pi pi-user-edit mr-2 text-sm"></i> Lengkapi Sekarang
                </button>
            </div>

            <div v-else-if="!userProfile?.employee?.is_phone_verified" class="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 rounded-r-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-start gap-3.5">
                    <div class="p-2 bg-amber-100 rounded-lg text-amber-600 mt-0.5">
                        <i class="pi pi-shield text-xl"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-amber-900">Nomor Telepon Belum Diverifikasi!</h4>
                        <p class="text-xs text-amber-700 mt-0.5 leading-relaxed">
                            Nomor kontak Anda <b>{{ userProfile?.employee?.phone }}</b> belum diverifikasi secara resmi. Harap lakukan verifikasi OTP sekarang juga.
                        </p>
                    </div>
                </div>
                <button @click="startPhoneVerification" class="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition shrink-0 flex items-center">
                    <i class="pi pi-shield mr-2 text-sm"></i> Verifikasi Sekarang
                </button>
            </div>

            <!-- [BIODATA GRID] -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                <!-- Left Sidebar: Avatar & Basic Title -->
                <div class="col-span-1 text-center lg:border-r lg:border-gray-100 lg:pr-8 flex flex-col items-center">
                    <div class="relative group mx-auto w-36 h-36 mb-4">
                        <div class="h-36 w-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center relative group">
                            <img 
                                v-if="userProfile?.employee?.profile_picture_url || authStore.user?.employee?.profile_picture_url" 
                                :src="getProfilePictureUrl(userProfile?.employee?.profile_picture_url || authStore.user?.employee?.profile_picture_url)" 
                                alt="Profile" 
                                class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                @error="handleImageError" 
                            />
                            <span v-else class="text-blue-600 font-extrabold text-5xl">
                                {{ userProfile?.employee?.name?.charAt(0) || authStore.user?.employee?.name?.charAt(0) || 'U' }}
                            </span>
                            
                            <label class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 backdrop-blur-[2px]">
                                <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onSelectFile">
                                <div class="text-white text-xs font-bold flex flex-col items-center">
                                    <i class="pi pi-camera text-2xl mb-1"></i>
                                    <span>Ubah Foto</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <h2 class="text-2xl font-extrabold text-gray-900 mb-1">{{ userProfile?.employee?.name || authStore.user?.username }}</h2>
                    <p class="text-sm font-medium text-gray-500 mb-4">{{ userProfile?.email }}</p>
                    <span class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/60 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                        <i class="pi pi-check-circle text-blue-500"></i> {{ userProfile?.role }}
                    </span>

                    <div class="mt-8 w-full pt-6 border-t border-gray-100 text-left space-y-3">
                        <button @click="openBioModal" class="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm">
                            <i class="pi pi-pencil text-blue-600"></i> Lengkapi / Edit Biodata
                        </button>
                    </div>
                </div>

                <!-- Right Content: Data Diri & Pekerjaan -->
                <div class="col-span-1 lg:col-span-2 space-y-8">
                    <!-- Data Diri & Kontak -->
                    <div>
                        <div class="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <i class="pi pi-id-card text-blue-600 text-base"></i> Data Diri & Kontak
                            </h3>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">Nomor NIP</label>
                                <p class="font-bold text-gray-900 text-sm">{{ userProfile?.employee?.nip || '-' }}</p>
                            </div>
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">Status Kepegawaian</label>
                                <span class="inline-flex items-center gap-1.5 text-green-700 text-xs font-bold bg-green-100 px-2.5 py-0.5 rounded-full mt-0.5">
                                    <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Aktif
                                </span>
                            </div>
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">No. Telepon / WhatsApp</label>
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="font-bold text-sm" :class="userProfile?.employee?.phone ? 'text-gray-900' : 'text-red-500 italic'">
                                            {{ userProfile?.employee?.phone || 'Belum Dilengkapi' }}
                                        </p>
                                        <span v-if="userProfile?.employee?.phone" class="inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full select-none" :class="userProfile?.employee?.is_phone_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 cursor-pointer hover:bg-amber-200'" @click="!userProfile?.employee?.is_phone_verified && startPhoneVerification()">
                                            <i :class="userProfile?.employee?.is_phone_verified ? 'pi pi-check-circle' : 'pi pi-exclamation-circle'"></i>
                                            {{ userProfile?.employee?.is_phone_verified ? 'Terverifikasi' : 'Belum Terverifikasi' }}
                                        </span>
                                    </div>
                                    <a v-if="userProfile?.employee?.phone" :href="'https://wa.me/' + userProfile?.employee?.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')" target="_blank" class="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 transition" title="Chat WhatsApp">
                                        <i class="pi pi-whatsapp text-lg"></i>
                                    </a>
                                </div>
                            </div>
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">Media Sosial / Profesional</label>
                                <div v-if="getSocialInfo(userProfile?.employee?.social_media)" class="flex items-center justify-between">
                                    <div class="flex items-center gap-2.5 truncate pr-2">
                                        <span class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="getSocialInfo(userProfile?.employee?.social_media)?.badgeBg">
                                            <i :class="getSocialInfo(userProfile?.employee?.social_media)?.icon" class="text-base"></i>
                                        </span>
                                        <div class="truncate">
                                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{{ getSocialInfo(userProfile?.employee?.social_media)?.type }}</p>
                                            <a :href="getSocialInfo(userProfile?.employee?.social_media)?.url" target="_blank" class="font-bold text-sm truncate block hover:underline" :class="getSocialInfo(userProfile?.employee?.social_media)?.colorClass">
                                                {{ getSocialInfo(userProfile?.employee?.social_media)?.label }}
                                            </a>
                                        </div>
                                    </div>
                                    <a :href="getSocialInfo(userProfile?.employee?.social_media)?.url" target="_blank" class="p-2 rounded-lg transition shrink-0 hover:scale-105" :class="getSocialInfo(userProfile?.employee?.social_media)?.badgeBg" title="Kunjungi Profil">
                                        <i class="pi pi-external-link text-sm font-bold"></i>
                                    </a>
                                </div>
                                <p v-else class="font-bold text-gray-400 text-sm italic">Belum Dilengkapi</p>
                            </div>
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200 sm:col-span-2">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">Alamat Domisili</label>
                                <p class="font-bold text-sm" :class="userProfile?.employee?.address ? 'text-gray-900' : 'text-gray-400 italic'">
                                    <i v-if="userProfile?.employee?.address" class="pi pi-map-marker text-red-500 mr-1.5"></i>
                                    {{ userProfile?.employee?.address || 'Belum Dilengkapi' }}
                                </p>
                            </div>
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">Tempat & Tanggal Lahir</label>
                                <p class="font-bold text-sm" :class="userProfile?.employee?.birth_place ? 'text-gray-900' : 'text-gray-400 italic'">
                                    {{ userProfile?.employee?.birth_place && userProfile?.employee?.birth_date ? userProfile?.employee?.birth_place + ', ' + formatDate(userProfile?.employee?.birth_date) : (userProfile?.employee?.birth_place || 'Belum Dilengkapi') }}
                                </p>
                            </div>
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">Jenis Kelamin</label>
                                <p class="font-bold text-gray-900 text-sm">{{ userProfile?.employee?.gender || 'Laki-laki' }}</p>
                            </div>
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">Pendidikan Terakhir</label>
                                <p class="font-bold text-sm" :class="userProfile?.employee?.education ? 'text-gray-900' : 'text-gray-400 italic'">
                                    {{ userProfile?.employee?.education || 'Belum Dilengkapi' }}
                                </p>
                            </div>
                            <div class="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 transition hover:border-amber-300">
                                <label class="text-xs text-amber-700 font-semibold block mb-1 flex items-center gap-1">
                                    <i class="pi pi-phone text-amber-600"></i> Kontak Darurat (Emergency Contact)
                                </label>
                                <div v-if="userProfile?.employee?.emergency_contact_name" class="flex items-center justify-between">
                                    <div>
                                        <p class="font-bold text-gray-900 text-sm">{{ userProfile?.employee?.emergency_contact_name }}</p>
                                        <p class="text-xs font-semibold text-amber-800">{{ userProfile?.employee?.emergency_contact_phone }}</p>
                                    </div>
                                    <a :href="'tel:' + userProfile?.employee?.emergency_contact_phone" class="p-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition" title="Telepon Kontak Darurat">
                                        <i class="pi pi-phone text-sm font-bold"></i>
                                    </a>
                                </div>
                                <p v-else class="font-bold text-gray-400 text-sm italic">Belum Dilengkapi</p>
                            </div>
                        </div>
                    </div>

                    <!-- Informasi Pekerjaan -->
                    <div>
                        <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <i class="pi pi-briefcase text-blue-600 text-base"></i> Informasi Pekerjaan
                        </h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">Divisi / Departemen</label>
                                <p class="font-bold text-gray-900 text-sm">{{ userProfile?.employee?.division?.name || '-' }}</p>
                            </div>
                            <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100 transition hover:border-gray-200">
                                <label class="text-xs text-gray-400 font-semibold block mb-1">Jabatan Posisi</label>
                                <p class="font-bold text-gray-900 text-sm">{{ userProfile?.employee?.position || '-' }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Tentang Saya / Bio -->
                    <div>
                        <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                            <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <i class="pi pi-comment text-blue-600 text-base"></i> Tentang Saya & Deskripsi
                            </h3>
                        </div>
                        <div class="p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200/70 relative">
                            <i class="pi pi-quote-left text-blue-200 text-3xl absolute top-3 left-3 pointer-events-none opacity-50"></i>
                            <p class="text-sm text-gray-700 leading-relaxed relative z-10 pl-4 font-medium italic">
                                "{{ userProfile?.employee?.bio || 'Berkomitmen memberikan kinerja optimal, menjaga etika profesionalisme, serta terus berinovasi dalam mendukung setiap pencapaian target strategis PT. Cakra Media Data.' }}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'achievements'">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">File Prestasi</h3>
                    <p class="text-sm text-gray-500">Kumpulan sertifikat dan dokumen pendukung.</p>
                </div>
                <button 
                    @click="openCreateModal" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-all"
                >
                    <i class="pi pi-plus mr-2"></i> Upload
                </button>
            </div>

            <div v-if="achievements.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div 
                    v-for="ach in achievements" 
                    :key="ach.id" 
                    class="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col"
                >
                    <a 
                        :href="getProfilePictureUrl(ach.file_url)" 
                        target="_blank"
                        class="h-36 bg-gray-100 flex items-center justify-center relative overflow-hidden cursor-pointer"
                        title="Klik untuk melihat file"
                    >
                        <div v-if="ach.file_url.endsWith('.pdf')" class="flex flex-col items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-300">
                            <i class="pi pi-file-pdf text-red-500 text-5xl mb-2"></i>
                            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">PDF DOC</span>
                        </div>
                        <img 
                            v-else 
                            :src="getProfilePictureUrl(ach.file_url)" 
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt="Preview"
                        >
                        <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </a>

                    <div class="p-3 bg-white flex items-start justify-between border-t border-gray-100 relative">
                        <div class="flex-1 min-w-0 pr-2">
                            <h4 class="text-sm font-bold text-gray-800 truncate" :title="ach.title">{{ ach.title }}</h4>
                            <p class="text-[10px] text-gray-500">{{ formatDate(ach.date) }}</p>
                        </div>

                        <button 
                            @click.stop="toggleMenu(ach.id)"
                            class="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none"
                        >
                            <i class="pi pi-ellipsis-v text-sm"></i>
                        </button>

                        <div 
                            v-if="activeMenu === ach.id" 
                            v-click-outside="closeMenu"
                            class="absolute bottom-8 right-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden text-sm animate-fade-in"
                        >
                            <button 
                                @click="openEditModal(ach)"
                                class="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 flex items-center gap-2"
                            >
                                <i class="pi pi-pencil text-xs"></i> Edit
                            </button>
                            <button 
                                @click="deleteAchievement(ach.id)"
                                class="w-full text-left px-4 py-2 hover:bg-red-50 text-gray-700 hover:text-red-600 flex items-center gap-2 border-t border-gray-50"
                            >
                                <i class="pi pi-trash text-xs"></i> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div class="bg-white p-4 rounded-full shadow-sm mb-4">
                    <i class="pi pi-folder-open text-4xl text-blue-200"></i>
                </div>
                <h4 class="text-gray-900 font-medium mb-1">Belum ada file</h4>
                <button @click="openCreateModal" class="text-blue-600 font-medium text-sm hover:underline">
                    Upload File Sekarang
                </button>
            </div>
        </div>

        <div v-if="activeTab === 'warnings'">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </span>
                Riwayat Surat Peringatan
              </h3>
              <p class="text-sm text-gray-500 mt-1 ml-10">Anda memiliki <span class="font-semibold text-red-600">{{ myWarnings.length }}</span> surat peringatan.</p>
            </div>
          </div>

          <!-- SP Cards -->
          <div class="space-y-3"
            @click="$router.push('/employee/warnings')">
            <div 
              v-for="(w, idx) in myWarnings" 
              :key="w.id"
              class="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-200 overflow-hidden"
            >
              <!-- Colored left bar -->
              <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                :class="w.level === 'SP3' ? 'bg-red-600' : w.level === 'SP2' ? 'bg-orange-500' : 'bg-yellow-400'"
              ></div>

              <div class="flex items-center gap-4 p-5 pl-6">
                <!-- Number badge -->
                <div class="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner"
                  :class="w.level === 'SP3' ? 'bg-red-100 text-red-700' : w.level === 'SP2' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-800'"
                >
                  {{ idx + 1 }}
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                      :class="w.level === 'SP3' ? 'bg-red-600 text-white' : w.level === 'SP2' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-yellow-900'"
                    >{{ w.level || 'SP' }}</span>
                    <span class="text-xs text-gray-400 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      {{ formatDate(w.issued_date || w.created_at) }}
                    </span>
                    <span v-if="w.period_name" class="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{{ w.period_name }}</span>
                  </div>
                  <p class="text-sm font-medium text-gray-800 truncate">{{ w.reason || w.description || 'Pelanggaran Kinerja' }}</p>
                </div>

                <!-- Arrow icon -->
                <button class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="$router.push('/employee/warnings')">
                    <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>


        <div v-if="activeTab === 'security'">
             <div class="max-w-xl mx-auto py-4">
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <p class="text-sm text-yellow-700">Gunakan password yang kuat untuk menjaga keamanan akun Anda.</p>
                </div>
                <form @submit.prevent="updatePassword" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                        <input v-model="passForm.old_password" type="password" required class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input v-model="passForm.new_password" type="password" required minlength="6" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                        <input v-model="passForm.confirm_password" type="password" required class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    </div>
                    <button type="submit" :disabled="isLoading" class="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-bold transition disabled:opacity-50">
                        {{ isLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}
                    </button>
                </form>
             </div>
        </div>

      </div>
    </div>

    <!-- [MODAL E-SERTIFIKAT PENGHARGAAN TOP PERFORMER] -->
    <Dialog v-model:visible="showCertificateModal" modal header="E-Sertifikat Penghargaan Resmi" :style="{ width: '850px' }" class="no-print">
      <div class="p-6">
         <!-- PREVIEW SERTIFIKAT DI LAYAR -->
         <div id="printable-certificate" class="border-[12px] border-double border-amber-500 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/60 p-10 text-center relative overflow-hidden shadow-xl rounded-2xl">
            <!-- Background Watermark / Decoration -->
            <div class="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>
            <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

            <div class="inline-block p-3.5 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 rounded-full mb-3 shadow-inner border border-amber-200">
               <i class="pi pi-trophy text-4xl"></i>
            </div>
            <p class="text-[11px] font-extrabold uppercase tracking-[0.35em] text-amber-800 mb-2">PT. CAKRA MEDIA DATA • KPI MANAGEMENT SYSTEM</p>
            <h1 class="text-3xl sm:text-4xl font-black text-gray-900 tracking-wide uppercase font-serif mb-6">Piagam Penghargaan</h1>
            <p class="text-sm text-gray-600 mb-6 italic">Diberikan sebagai bentuk apresiasi dan penghargaan setinggi-tingginya kepada:</p>
            
            <h2 class="text-2xl sm:text-3xl font-extrabold text-blue-950 underline decoration-amber-500 decoration-4 underline-offset-8 mb-4">{{ userProfile?.employee?.name || authStore.user?.username }}</h2>
            <p class="text-xs font-bold text-gray-600 uppercase tracking-wide mb-6">NIP: {{ userProfile?.employee?.nip || '-' }} • Divisi: {{ userProfile?.employee?.division_name || '-' }} • Posisi: {{ userProfile?.employee?.position || '-' }}</p>

            <div class="max-w-xl mx-auto bg-white/90 p-6 rounded-2xl border border-amber-200/80 shadow-sm mb-8">
               <p class="text-sm sm:text-base font-medium text-gray-800 leading-relaxed">
                  Atas kontribusi luar biasa, dedikasi, serta pencapaian kinerja prima sehingga berhasil meraih predikat sebagai <br>
                  <span class="font-extrabold text-amber-600 text-lg sm:text-xl uppercase tracking-wider block mt-2.5">🌟 Top 1 Performer & Pegawai Terbaik 🌟</span>
                  pada evaluasi kinerja periode aktif ini.
               </p>
            </div>

            <div class="grid grid-cols-2 gap-8 items-end max-w-lg mx-auto pt-4 border-t border-amber-200/80 text-xs text-gray-600">
               <div class="text-center">
                  <p class="mb-12 font-medium">Diterbitkan pada tanggal:</p>
                  <p class="font-bold text-gray-900 border-t border-gray-400 inline-block px-5 pt-1.5">{{ new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) }}</p>
               </div>
               <div class="text-center">
                  <p class="mb-12 font-medium">Disahkan Oleh:</p>
                  <p class="font-bold text-gray-900 border-t border-gray-400 inline-block px-5 pt-1.5">Manajemen PT. Cakra Media Data</p>
               </div>
            </div>
         </div>

         <div class="mt-6 flex justify-end gap-3 no-print">
            <button @click="showCertificateModal = false" class="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-sm text-gray-700">Tutup</button>
            <button @click="printCertificate" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-md hover:from-amber-600 hover:to-orange-700 flex items-center gap-2 text-sm transition">
               <i class="pi pi-print"></i> Cetak PDF E-Sertifikat
            </button>
         </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, reactive, ref } from 'vue'
import { authService, employeeService, myPerformanceService, warningService } from '../services/api'
import { useAuthStore } from '../stores/auth'

// --- CROPPER ---
import { CircleStencil, Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

// --- CLICK OUTSIDE DIRECTIVE (Untuk Dropdown Menu) ---
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = function(event: Event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};

const authStore = useAuthStore()
const toast = useToast()

const tabs = computed(() => {
  const baseTabs = [
    { id: 'biodata', name: 'Biodata' },
    { id: 'achievements', name: 'Prestasi' },
    { id: 'security', name: 'Keamanan' }
  ]
  if (myWarnings.value.length > 0) {
    baseTabs.splice(2, 0, { id: 'warnings', name: 'Riwayat SP' })
  }
  return baseTabs
})

const activeTab = ref('biodata')
const userProfile = ref<any>(null)
const achievements = ref<any[]>([])
const myWarnings = ref<any[]>([])
const isTopOne = ref(false)
const isLoading = ref(false)
const isProcessing = ref(false)

// State Chart & Password
const passForm = reactive({ old_password: '', new_password: '', confirm_password: '' })

// State Cropper
const showCropModal = ref(false)
const cropImgSrc = ref('')
const cropperRef = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// State Achievements (CRUD & Menu)
const showAchModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const achForm = reactive({ title: '', date: '', description: '', file: null as File | null })
const activeMenu = ref<number | null>(null)
const currentFileUrl = ref('') 
const achFile = ref<HTMLInputElement | null>(null)

// State Biodata & Kontak (Baru)
const showBioModal = ref(false)
const showCertificateModal = ref(false)
const showOTPModal = ref(false)
const otpInput = ref('')
const isVerifying = ref(false)
const otpCountdown = ref(0)
let countdownTimer: any = null

const bioForm = reactive({ 
    phone: '', 
    bio: '', 
    social_type: 'instagram', 
    social_username: '',
    address: '',
    birth_place: '',
    birth_date: '',
    gender: 'Laki-laki',
    education: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
})

function getSocialInfo(sm: string | null | undefined) {
    if (!sm) return null
    let type = 'other'
    let username = sm
    if (sm.startsWith('instagram:')) {
        type = 'instagram'
        username = sm.replace('instagram:', '')
    } else if (sm.startsWith('linkedin:')) {
        type = 'linkedin'
        username = sm.replace('linkedin:', '')
    } else if (sm.startsWith('telegram:')) {
        type = 'telegram'
        username = sm.replace('telegram:', '')
    } else if (sm.startsWith('other:')) {
        type = 'other'
        username = sm.replace('other:', '')
    } else {
        if (sm.includes('instagram') || sm.startsWith('@')) {
            type = 'instagram'
            username = sm.replace(/^@/, '').replace(/.*instagram\.com\//, '').replace(/\/.*/, '')
        } else if (sm.includes('linkedin')) {
            type = 'linkedin'
            username = sm.replace(/.*linkedin\.com\/in\//, '').replace(/\/.*/, '')
        } else if (sm.includes('t.me') || sm.includes('telegram')) {
            type = 'telegram'
            username = sm.replace(/.*t\.me\//, '').replace(/\/.*/, '')
        }
    }

    if (!username.trim()) return null

    let url = username
    let label = username
    let icon = 'pi pi-globe'
    let colorClass = 'text-gray-700 hover:text-gray-900'
    let badgeBg = 'bg-gray-100 text-gray-700'

    if (type === 'instagram') {
        url = `https://instagram.com/${username}`
        label = `@${username}`
        icon = 'pi pi-instagram'
        colorClass = 'text-pink-600 hover:text-pink-800'
        badgeBg = 'bg-pink-50 text-pink-700'
    } else if (type === 'linkedin') {
        url = username.startsWith('http') ? username : `https://linkedin.com/in/${username}`
        label = username.startsWith('http') ? 'Profil LinkedIn' : username
        icon = 'pi pi-linkedin'
        colorClass = 'text-blue-700 hover:text-blue-900'
        badgeBg = 'bg-blue-50 text-blue-800'
    } else if (type === 'telegram') {
        url = `https://t.me/${username}`
        label = `@${username}`
        icon = 'pi pi-telegram'
        colorClass = 'text-sky-600 hover:text-sky-800'
        badgeBg = 'bg-sky-50 text-sky-700'
    } else {
        if (!url.startsWith('http')) url = 'https://' + url
    }

    return { type, username, url, label, icon, colorClass, badgeBg }
}

function printCertificate() {
    window.print()
}

async function startPhoneVerification() {
    isProcessing.value = true
    try {
        await authService.sendPhoneOTP()
        toast.add({ severity: 'success', summary: 'OTP Terkirim', detail: 'Kode OTP verifikasi telah dikirim ke WhatsApp Anda!', life: 3000 })
        otpInput.value = ''
        showOTPModal.value = true
        startCountdown()
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal mengirim kode OTP', life: 3000 })
    } finally {
        isProcessing.value = false
    }
}

async function resendOTP() {
    try {
        await authService.sendPhoneOTP()
        toast.add({ severity: 'success', summary: 'OTP Dikirim Ulang', detail: 'Kode verifikasi baru telah dikirim!', life: 3000 })
        startCountdown()
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal mengirim ulang OTP', life: 3000 })
    }
}

function startCountdown() {
    otpCountdown.value = 60
    if (countdownTimer) clearInterval(countdownTimer)
    countdownTimer = setInterval(() => {
        if (otpCountdown.value > 0) {
            otpCountdown.value--
        } else {
            clearInterval(countdownTimer)
        }
    }, 1000)
}

async function verifyOTP() {
    if (otpInput.value.length !== 6) return
    isVerifying.value = true
    try {
        await authService.verifyPhoneOTP(otpInput.value)
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Nomor telepon/WhatsApp Anda berhasil diverifikasi!', life: 3000 })
        showOTPModal.value = false
        await loadData()
        await authStore.fetchProfile() // Update global auth store
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Verifikasi Gagal', detail: err.response?.data?.message || 'Kode OTP salah atau kedaluwarsa', life: 3000 })
    } finally {
        isVerifying.value = false
    }
}

function openBioModal() {
    bioForm.phone = userProfile.value?.employee?.phone || ''
    bioForm.bio = userProfile.value?.employee?.bio || ''
    bioForm.address = userProfile.value?.employee?.address || ''
    bioForm.birth_place = userProfile.value?.employee?.birth_place || ''
    bioForm.birth_date = userProfile.value?.employee?.birth_date || ''
    bioForm.gender = userProfile.value?.employee?.gender || 'Laki-laki'
    bioForm.education = userProfile.value?.employee?.education || ''
    bioForm.emergency_contact_name = userProfile.value?.employee?.emergency_contact_name || ''
    bioForm.emergency_contact_phone = userProfile.value?.employee?.emergency_contact_phone || ''

    const sm = userProfile.value?.employee?.social_media || ''
    if (sm.startsWith('instagram:')) {
        bioForm.social_type = 'instagram'
        bioForm.social_username = sm.replace('instagram:', '')
    } else if (sm.startsWith('linkedin:')) {
        bioForm.social_type = 'linkedin'
        bioForm.social_username = sm.replace('linkedin:', '')
    } else if (sm.startsWith('telegram:')) {
        bioForm.social_type = 'telegram'
        bioForm.social_username = sm.replace('telegram:', '')
    } else if (sm.startsWith('other:')) {
        bioForm.social_type = 'other'
        bioForm.social_username = sm.replace('other:', '')
    } else if (sm) {
        if (sm.includes('instagram') || sm.startsWith('@')) {
            bioForm.social_type = 'instagram'
            bioForm.social_username = sm.replace(/^@/, '').replace(/.*instagram\.com\//, '').replace(/\/.*/, '')
        } else if (sm.includes('linkedin')) {
            bioForm.social_type = 'linkedin'
            bioForm.social_username = sm.replace(/.*linkedin\.com\/in\//, '').replace(/\/.*/, '')
        } else if (sm.includes('t.me') || sm.includes('telegram')) {
            bioForm.social_type = 'telegram'
            bioForm.social_username = sm.replace(/.*t\.me\//, '').replace(/\/.*/, '')
        } else {
            bioForm.social_type = 'other'
            bioForm.social_username = sm
        }
    } else {
        bioForm.social_type = 'instagram'
        bioForm.social_username = ''
    }
    showBioModal.value = true
}

async function saveBiodata() {
    isProcessing.value = true
    try {
        const formattedSocial = bioForm.social_username ? `${bioForm.social_type}:${bioForm.social_username.trim().replace(/^@/, '')}` : ''
        await authService.updateBiodata({
            phone: bioForm.phone,
            bio: bioForm.bio,
            social_media: formattedSocial,
            address: bioForm.address,
            birth_place: bioForm.birth_place,
            birth_date: bioForm.birth_date,
            gender: bioForm.gender,
            education: bioForm.education,
            emergency_contact_name: bioForm.emergency_contact_name,
            emergency_contact_phone: bioForm.emergency_contact_phone
        })
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Biodata & Kontak berhasil disimpan!', life: 3000 })
        showBioModal.value = false
        await loadData()
        await authStore.fetchProfile() // Update global auth store
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal menyimpan biodata', life: 3000 })
    } finally {
        isProcessing.value = false
    }
}

// --- LIFECYCLE ---
onMounted(async () => {
  await loadData()
})

async function loadData() {
    try { 
        userProfile.value = await authService.getProfile() 
        try { achievements.value = await employeeService.getAchievements() } catch(e){}
        try { myWarnings.value = await warningService.getMyWarnings() } catch(e){}
        try {
            const topOneRes = await myPerformanceService.checkTopOne()
            isTopOne.value = topOneRes.is_top_one
        } catch(e) {
            isTopOne.value = false
        }
    } catch (e) { console.error(e) }
}

function getProfilePictureUrl(url: string) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080' 
    return `${baseUrl.replace('/api', '')}${url}`
}

// --- FUNGSI CROP & UPLOAD FOTO ---
function onSelectFile(e: Event) {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    if (!file.type.includes('image/')) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Mohon pilih file gambar', life: 3000 })
        return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
        cropImgSrc.value = event.target?.result as string
        showCropModal.value = true
    }
    reader.readAsDataURL(file)
    target.value = ''
}

function cancelCrop() {
    showCropModal.value = false; cropImgSrc.value = ''
}

function performCropAndUpload() {
    if (!cropperRef.value) return
    isProcessing.value = true
    const { canvas } = cropperRef.value.getResult();
    if (canvas) {
        canvas.toBlob((blob: Blob) => {
            if (!blob) { isProcessing.value = false; return }
            const croppedFile = new File([blob], "avatar_cropped.jpg", { type: "image/jpeg" })
            uploadProfilePic(croppedFile)
            showCropModal.value = false
            isProcessing.value = false
        }, 'image/jpeg', 0.9)
    } else { isProcessing.value = false }
}

async function uploadProfilePic(file: File) {
    if (file.size > 2 * 1024 * 1024) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Maksimal 2MB', life: 3000 })
        return
    }
    try {
        const newUrl = await employeeService.uploadProfilePicture(file)
        if (userProfile.value?.employee) { userProfile.value.employee.profile_picture_url = newUrl }
        if (authStore.user && authStore.user.employee) {
            const updatedUser = JSON.parse(JSON.stringify(authStore.user))
            if (updatedUser.employee) { updatedUser.employee.profile_picture_url = newUrl }
            authStore.user = updatedUser
            localStorage.setItem('user', JSON.stringify(updatedUser))
        }
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Foto profil diperbarui', life: 3000 })
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal upload foto', life: 3000 })
    }
}

function handleImageError(e: Event) { (e.target as HTMLImageElement).style.display = 'none'; }

// --- FUNGSI PRESTASI (CRUD & MENU) ---
function toggleMenu(id: number) {
    activeMenu.value = activeMenu.value === id ? null : id
}
function closeMenu() {
    activeMenu.value = null
}

function openCreateModal() {
    isEditing.value = false
    editingId.value = null
    currentFileUrl.value = '' // Reset URL lama
    achForm.title = ''; achForm.date = ''; achForm.description = ''; achForm.file = null
    
    // Reset element input file (gunakan achFile sesuai ref di template)
    if (achFile.value) achFile.value.value = ''
    
    showAchModal.value = true
}

function openEditModal(ach: any) {
    isEditing.value = true
    editingId.value = ach.id
    
    // Isi data form
    achForm.title = ach.title
    achForm.date = ach.date ? new Date(ach.date).toISOString().split('T')[0] : ''
    achForm.description = ach.description
    
    // Set URL file lama agar muncul di UI
    currentFileUrl.value = ach.file_url 
    
    // Kosongkan file input (user belum memilih file baru)
    achForm.file = null 
    if (achFile.value) achFile.value.value = '' 

    showAchModal.value = true
    closeMenu()
}

function closeAchModal() { showAchModal.value = false; closeMenu(); }
function handleAchFileChange(event: any) { achForm.file = event.target.files[0]; }

async function submitAchievement() {
    // Validasi Wajib File HANYA SAAT CREATE (Bukan Edit)
    if (!isEditing.value && !achForm.file) {
        toast.add({ severity: 'warn', summary: 'Wajib', detail: 'File bukti harus diupload', life: 3000 })
        return
    }
    
    // Validasi Ukuran (Hanya jika ada file baru)
    if (achForm.file && achForm.file.size > 5 * 1024 * 1024) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Maksimal 5MB', life: 3000 })
        return
    }

    isProcessing.value = true
    try {
        const formData = new FormData()
        formData.append('title', achForm.title)
        formData.append('date', achForm.date)
        formData.append('description', achForm.description)
        
        // LOGIKA KUNCI: Hanya append file jika user memilih file baru
        if (achForm.file) {
            formData.append('file', achForm.file)
        }

        if (isEditing.value && editingId.value) {
            // MODE UPDATE
            await employeeService.updateAchievement(editingId.value, formData)
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Prestasi diperbarui', life: 3000 })
        } else {
            // MODE CREATE
            await employeeService.addAchievement(formData)
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Prestasi ditambahkan', life: 3000 })
        }

        // Refresh Data
        achievements.value = await employeeService.getAchievements()
        closeAchModal()
    } catch (e) {
        console.error(e) // Debugging
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan saat menyimpan', life: 3000 })
    } finally {
        isProcessing.value = false
    }
}
async function deleteAchievement(id: number) {
    if(!confirm('Hapus file prestasi ini?')) return
    try { 
        await employeeService.deleteAchievement(id)
        achievements.value = achievements.value.filter(a => a.id !== id)
        toast.add({ severity: 'success', summary: 'Terhapus', detail: 'File dihapus', life: 3000 })
    } catch(e) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus', life: 3000 })
    }
}

function formatDate(d: string) { if(!d) return '-'; return new Date(d).toLocaleDateString('id-ID'); }

async function updatePassword() {
    if (passForm.new_password !== passForm.confirm_password) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Konfirmasi password tidak cocok', life: 3000 })
        return
    }
    isLoading.value = true
    try {
        await authService.changePassword({ old_password: passForm.old_password, new_password: passForm.new_password })
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Password berhasil diubah', life: 5000 })
        passForm.old_password = ''; passForm.new_password = ''; passForm.confirm_password = ''
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal mengubah password', life: 3000 })
    } finally {
        isLoading.value = false
    }
}
</script>

<style>
/* Styling khusus untuk cropper area */
.cropper {
    height: 100%;
    width: 100%;
}
/* Animasi Dropdown */
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95) translateY(-5px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.1s ease-out forwards;
}

@media print {
    body * {
        visibility: hidden;
    }
    #printable-certificate,
    #printable-certificate * {
        visibility: visible;
    }
    #printable-certificate {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100% !important;
        max-width: 980px !important;
        border: 10px double #f59e0b !important;
        box-shadow: none !important;
        margin: 0 !important;
        background: #fff !important;
    }
    .no-print, [class*="Navbar"], [class*="Sidebar"], [class*="Dialog"] > div > div:first-child {
        display: none !important;
    }
}
</style>
