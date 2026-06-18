<template>
  <div>
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-gray-600 mt-1">
          Selamat datang kembali, <span class="font-semibold text-blue-600">{{ authStore.user?.employee?.name || authStore.user?.username || 'User' }}</span>.
        </p>
      </div>
      <div class="text-right">
        <span class="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm inline-flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span>{{ currentDate }}</span>
          <span class="border-l border-gray-300 h-4 mx-1"></span>
          <svg class="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="font-bold text-gray-800 tracking-wider tabular-nums">{{ currentTime }}</span>
        </span>
        <div class="mt-3 flex justify-end">
          <Button
            v-if="myWarnings.length > 0"
            icon="pi pi-exclamation-circle"
            severity="danger"
            class="p-button-rounded p-button-text p-button-lg"
            @click="toggleWarningPopover"
            aria-label="Tampilkan status perhatian"
          />
          <OverlayPanel ref="warningPopover" :dismissable="true" showCloseIcon>
            <div class="max-w-xs rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <div class="flex items-start gap-3">
                <span class="pi pi-exclamation-triangle text-red-600 text-xl"></span>
                <div>
                  <div class="text-sm font-semibold">Status Perhatian</div>
                  <p class="text-sm mt-1">Anda memiliki <span class="font-semibold">{{ myWarnings.length }}</span> peringatan/SP yang perlu diperhatikan.</p>
                </div>
              </div>
              <button
                type="button"
                class="mt-4 w-full rounded-lg border border-red-200 bg-red-100 text-sm font-semibold px-3 py-2 hover:bg-red-200"
                @click="goToWarnings"
              >
                Lihat Detail SP
              </button>
            </div>
          </OverlayPanel>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <div class="h-32 bg-gray-200 rounded-xl"></div>
        <div class="h-32 bg-gray-200 rounded-xl"></div>
        <div class="h-32 bg-gray-200 rounded-xl"></div>
    </div>

    <div v-else-if="authStore.userRole === 'admin'" class="space-y-6">
      
      <!-- MODAL PEGAWAI BELUM DIEVALUASI -->
      <div v-if="showUnevaluatedModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" @click="showUnevaluatedModal = false"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
            <div class="bg-white px-6 pt-6 pb-4">
              <div class="flex justify-between items-center mb-4 border-b pb-3">
                <h3 class="text-lg font-bold text-gray-900 flex items-center">
                  <i class="pi pi-users text-orange-500 mr-2"></i> Pegawai Belum Dievaluasi
                </h3>
                <button @click="showUnevaluatedModal = false" class="text-gray-400 hover:text-gray-600 focus:outline-none">
                  <i class="pi pi-times"></i>
                </button>
              </div>
              
              <div class="max-h-[60vh] overflow-y-auto pr-2">
                <table class="min-w-full divide-y divide-gray-200" v-if="dashboardStats.unevaluated_employees?.length > 0">
                  <thead class="bg-gray-50 sticky top-0">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama Pegawai</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Divisi</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Atasan (Menilai)</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="(emp, idx) in dashboardStats.unevaluated_employees" :key="idx" class="hover:bg-orange-50">
                      <td class="px-4 py-3 text-sm text-gray-800 font-medium">{{ emp.employee_name }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ emp.division_name || '-' }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {{ emp.manager_name || 'Tidak ada atasan' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="text-center py-8 text-gray-500">
                  Semua pegawai di periode aktif ini sudah dievaluasi.
                </div>
              </div>
              
              <div class="mt-5 sm:mt-6 flex justify-end">
                <button @click="showUnevaluatedModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 1: Summary Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500 relative overflow-hidden transition hover:shadow-md">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Pegawai Aktif</p>
            <p class="text-3xl font-bold text-gray-800 mt-1">{{ dashboardStats.total_active_employees || adminStats.totalEmployees }}</p>
          </div>
          <div class="absolute right-4 top-5 p-2.5 bg-blue-50 rounded-full text-blue-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 relative overflow-hidden transition hover:shadow-md">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Evaluasi Selesai</p>
            <p class="text-3xl font-bold mt-1">{{ dashboardStats.total_evaluations_done ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ dashboardStats.active_period?.name || adminStats.activePeriod || 'Tidak Ada Periode' }}</p>
          </div>
          <div class="absolute right-4 top-5 p-2.5 bg-green-50 rounded-full text-green-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500 relative overflow-hidden transition hover:shadow-md cursor-pointer group" @click="showUnevaluatedModal = true">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Belum Dievaluasi</p>
            <p class="text-3xl font-bold mt-1">{{ dashboardStats.not_evaluated_count ?? 0 }}</p>
            <p class="text-xs text-orange-500 font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Lihat Daftar Pegawai →</p>
          </div>
          <div class="absolute right-4 top-5 p-2.5 bg-orange-50 rounded-full text-orange-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500 relative overflow-hidden transition hover:shadow-md cursor-pointer" @click="$router.push('/admin/warnings')">
          <div>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Total SP Diterbitkan</p>
            <p class="text-3xl font-bold mt-1">{{ dashboardStats.total_warnings ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-0.5 hover:underline">Kelola SP →</p>
          </div>
          <div class="absolute right-4 top-5 p-2.5 bg-red-50 rounded-full text-red-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        </div>
      </div>

      <!-- Row 2: Rata2 + Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Rata2 Skor Perusahaan -->
        <div class="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <p class="text-xs font-bold opacity-80 uppercase tracking-wide">Rata-rata Skor Perusahaan</p>
            <p class="text-5xl font-bold mt-2 tracking-tight">{{ (dashboardStats.company_avg_score ?? 0).toFixed(1) }}</p>
            <div class="mt-2 inline-block px-2 py-0.5 bg-white/20 rounded text-xs font-semibold">Grade {{ getGradeFromScore(dashboardStats.company_avg_score) }}</div>
          </div>
          <p class="text-xs opacity-70 mt-4">Periode: {{ dashboardStats.active_period?.name || 'Semua Periode' }}</p>
        </div>

        <!-- Distribusi Grade -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 col-span-2">
          <h3 class="text-sm font-bold text-gray-700 mb-3">Distribusi Grade Pegawai</h3>
          <div v-if="dashboardStats.grade_distribution?.length" class="flex items-end gap-2 h-28">
            <div
              v-for="g in dashboardStats.grade_distribution"
              :key="g.grade"
              class="flex-1 flex flex-col items-center group"
            >
              <div class="text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity" :class="getGradeTextColor(g.grade)">
                {{ g.count }}
              </div>
              <div
                class="w-full rounded-t-md transition-all duration-500 relative"
                :class="getGradeBarColor(g.grade)"
                :style="{ height: maxGradeCount > 0 ? Math.max((g.count / maxGradeCount) * 80, g.count > 0 ? 12 : 0) + 'px' : '0px' }"
              >
                <span v-if="g.count > 0" class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold" :class="getGradeTextColor(g.grade)">{{ g.count }}</span>
              </div>
              <div class="text-xs font-bold mt-1" :class="getGradeTextColor(g.grade)">{{ g.grade }}</div>
            </div>
          </div>
          <div v-else class="h-28 flex items-center justify-center text-gray-400 text-sm">Belum ada data grade untuk periode ini.</div>
        </div>
      </div>

      <!-- Row 3: Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
         <button @click="$router.push('/admin/employees')" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 text-left transition-all group">
            <div class="text-blue-600 mb-2"><i class="pi pi-user-plus text-lg"></i></div>
            <div class="font-bold text-gray-700 text-sm">+ Pegawai Baru</div>
            <div class="text-xs text-gray-500 mt-0.5">Kelola data karyawan</div>
         </button>
         <button @click="$router.push('/admin/periods')" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-green-200 text-left transition-all group">
            <div class="text-green-600 mb-2"><i class="pi pi-calendar-plus text-lg"></i></div>
            <div class="font-bold text-gray-700 text-sm">+ Periode Baru</div>
            <div class="text-xs text-gray-500 mt-0.5">Buka evaluasi baru</div>
         </button>
         <button @click="$router.push('/admin/reports')" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 text-left transition-all group">
            <div class="text-purple-600 mb-2"><i class="pi pi-file-pdf text-lg"></i></div>
            <div class="font-bold text-gray-700 text-sm">Lihat Laporan</div>
            <div class="text-xs text-gray-500 mt-0.5">Rekapitulasi nilai</div>
         </button>
         <button @click="$router.push('/admin/warnings')" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 text-left transition-all group">
            <div class="text-red-600 mb-2"><i class="pi pi-shield text-lg"></i></div>
            <div class="font-bold text-gray-700 text-sm">Manajemen SP</div>
            <div class="text-xs text-gray-500 mt-0.5">Kelola peringatan</div>
         </button>
      </div>

      <!-- Row 4: Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Distribusi Pegawai per Divisi</h3>
          <div v-if="adminCharts.divisionSeries.length > 0">
            <apexchart type="bar" height="300" :options="adminCharts.divisionOptions" :series="adminCharts.divisionSeries"></apexchart>
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-400">Memuat grafik...</div>
        </div>

        <!-- [BARU] Chart Kinerja per Divisi -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">Kinerja per Divisi</h3>
            <span class="text-xs text-gray-400">{{ dashboardStats.active_period?.name || 'Semua Periode' }}</span>
          </div>
          <div v-if="adminCharts.divisionPerfSeries.length > 0 && adminCharts.divisionPerfSeries[0].data.some((v: number) => v > 0)">
            <apexchart type="bar" height="300" :options="adminCharts.divisionPerfOptions" :series="adminCharts.divisionPerfSeries"></apexchart>
          </div>
          <div v-else class="h-64 flex items-center justify-center text-gray-400">
            <div class="text-center">
              <i class="pi pi-chart-bar text-3xl mb-2 block"></i>
              <p class="text-sm">Belum ada data kinerja divisi.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 5: Charts row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Status Akun Pegawai</h3>
          <div v-if="adminCharts.statusSeries.length > 0">
            <apexchart type="pie" height="300" :options="adminCharts.statusOptions" :series="adminCharts.statusSeries"></apexchart>
          </div>
        </div>

        <!-- Top & Low Performers -->
        <div class="space-y-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-5 py-3 border-b border-gray-100 bg-green-50 flex items-center">
              <i class="pi pi-star-fill text-green-600 mr-2"></i>
              <h3 class="font-bold text-green-800 text-sm">Top Performers (≥80)</h3>
            </div>
            <table class="min-w-full">
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(p, idx) in adminStats.topPerformers" :key="idx" class="hover:bg-gray-50 transition">
                  <td class="px-5 py-2.5 text-sm text-gray-700 font-medium flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">{{ idx + 1 }}</span>
                    {{ p.employee_name }}
                  </td>
                  <td class="px-5 py-2.5 text-sm text-right font-bold text-green-600">{{ p.total_score.toFixed(2) }}</td>
                </tr>
                <tr v-if="adminStats.topPerformers.length === 0">
                  <td colspan="2" class="px-5 py-6 text-center text-sm text-gray-400">Belum ada pegawai dengan nilai ≥ 80.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-5 py-3 border-b border-gray-100 bg-red-50 flex items-center">
              <i class="pi pi-arrow-down text-red-600 mr-2"></i>
              <h3 class="font-bold text-red-800 text-sm">Perlu Pembinaan (&lt;60)</h3>
            </div>
            <table class="min-w-full">
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(p, idx) in adminStats.lowPerformers" :key="idx" class="hover:bg-gray-50 transition">
                  <td class="px-5 py-2.5 text-sm text-gray-700 font-medium flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">{{ idx + 1 }}</span>
                    {{ p.employee_name }}
                  </td>
                  <td class="px-5 py-2.5 text-sm text-right font-bold text-red-600">{{ p.total_score.toFixed(2) }}</td>
                </tr>
                <tr v-if="adminStats.lowPerformers.length === 0">
                  <td colspan="2" class="px-5 py-6 text-center text-sm text-gray-400">Tidak ada pegawai di bawah standar.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="authStore.userRole === 'manager'" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div class="flex justify-between items-end mb-4">
              <div>
                <h2 class="text-xl font-bold text-gray-800">Progress Penilaian Tim</h2>
                <p class="text-sm text-gray-500 mt-1">Periode Aktif saat ini.</p>
              </div>
              <div class="text-right">
                <span class="text-4xl font-bold text-blue-600">{{ managerStats.done }}</span>
                <span class="text-gray-400 text-xl font-medium"> / {{ managerStats.total }}</span>
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
              <div class="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out" :style="`width: ${managerStats.percentage}%`"></div>
            </div>
            <div class="text-right text-xs font-bold text-blue-600">{{ managerStats.percentage.toFixed(0) }}% Tuntas</div>
          </div>

          <div v-if="managerStats.pending > 0" class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex justify-between items-center shadow-sm">
            <div>
              <p class="font-bold text-orange-800 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Tugas Menunggu!
              </p>
              <p class="text-sm text-orange-700 mt-1">Anda memiliki <span class="font-bold">{{ managerStats.pending }}</span> pegawai yang belum selesai dinilai.</p>
            </div>
            <button @click="$router.push('/manager/team')" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition transform hover:scale-105">
              Lanjut Menilai
            </button>
          </div>
          
          <div v-else class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm">
            <p class="font-bold text-green-800 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Semua Selesai!
            </p>
            <p class="text-sm text-green-700 mt-1">Terima kasih telah menyelesaikan penilaian periode ini.</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Statistik Status Penilaian</h3>
          <div class="flex items-center justify-center">
            <apexchart type="donut" width="100%" :options="managerCharts.options" :series="managerCharts.series"></apexchart>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="authStore.userRole === 'employee'" class="space-y-6">
      
      <!-- [BARU] Notifikasi / Info Target KPI -->
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-4">
          <div class="bg-blue-100 p-3 rounded-xl text-blue-600">
            <i class="pi pi-target text-2xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-blue-900">Target KPI Periode Ini</h3>
            <p class="text-sm text-blue-700 mt-1">Pastikan Anda mengetahui target pencapaian yang telah ditentukan oleh atasan Anda.</p>
          </div>
        </div>
        <button @click="$router.push('/employee/targets')" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition whitespace-nowrap">
          Lihat Target Saya
        </button>
      </div>

      <div v-if="employeeStats.hasData" class="bg-slate-950 text-white rounded-3xl shadow-xl p-8 relative overflow-hidden transition-all hover:shadow-2xl border border-white/10">
        <div class="absolute -right-10 -top-10 h-64 w-64 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute left-10 bottom-10 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
        <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-lg font-medium opacity-90 mb-1 flex items-center">
              <svg class="w-5 h-5 mr-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Nilai Kinerja Terakhir
            </h2>
            <p class="text-sm opacity-75 mb-6 pl-7">{{ employeeStats.periodName }}</p>
            
            <div class="flex items-end gap-4 pl-2">
              <div class="text-7xl font-bold tracking-tighter">{{ employeeStats.score.toFixed(1) }}</div>
              <div class="mb-4 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-lg font-bold text-lg border border-white/30 shadow-lg">
                Grade {{ employeeStats.grade }}
              </div>
            </div>
            
            <div class="mt-8 pl-2">
              <button @click="$router.push('/employee/history')" class="bg-white/10 border border-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-white/20 transition transform hover:-translate-y-0.5">
                Lihat Rapor Lengkap
              </button>
            </div>
          </div>
          <div class="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10 shadow-inner">
            <h4 class="text-sm font-semibold mb-2 opacity-90">Tren Kinerja Saya</h4>
            <apexchart type="area" height="150" :options="employeeCharts.options" :series="employeeCharts.series"></apexchart>
          </div>
        </div>
      </div>
      

      <div v-else class="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-200">
        <div class="bg-gray-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Belum Ada Data Penilaian</h3>
        <p class="text-gray-500 mt-2 max-w-sm mx-auto">
          Hasil penilaian kinerja Anda untuk periode ini belum tersedia. Silakan cek kembali nanti atau hubungi atasan Anda.
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  adminService,
  divisionService,
  employeeService,
  managerService,
  myPerformanceService,
  periodService,
  reportService,
  warningService
} from '../services/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const isLoading = ref(true)

// [BARU] Modal State
const showUnevaluatedModal = ref(false)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const currentTime = ref(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
let timerInterval: any = null

// --- STATE ADMIN ---
const dashboardStats = reactive<any>({})
const adminStats = reactive({ totalEmployees: 0, totalDivisions: 0, activePeriod: '', topPerformers: [] as any[], lowPerformers: [] as any[] })
const adminCharts = reactive({
  divisionSeries: [] as any[],
  divisionOptions: {
    chart: { 
        id: 'division-bar', 
        fontFamily: 'inherit',
        toolbar: { show: true } 
    },
    title: {
        text: 'Distribusi Pegawai per Divisi',
        align: 'center',
        style: { fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit' }
    },
    xaxis: { categories: [] as string[] },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '50%' } },
    colors: ['#3b82f6'],
    grid: { borderColor: '#f3f4f6' }
  },
  statusSeries: [] as number[],
  statusOptions: {
    chart: { 
        type: 'pie', 
        toolbar: { show: true } 
    },
    title: {
        text: 'Status Keaktifan Akun',
        align: 'center',
        style: { fontSize: '14px', fontWeight: 'bold', fontFamily: 'inherit' }
    },
    labels: ['Aktif', 'Non-Aktif'],
    colors: ['#10b981', '#ef4444'],
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '55%' } } }
  },
  // [BARU] Chart kinerja rata-rata per divisi
  divisionPerfSeries: [] as any[],
  divisionPerfOptions: {
    chart: { id: 'div-perf-bar', fontFamily: 'inherit', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '55%', distributed: true } },
    dataLabels: { enabled: true, formatter: (val: number) => val > 0 ? val.toFixed(1) : '-', style: { fontSize: '11px', fontWeight: 'bold' } },
    xaxis: { categories: [] as string[], labels: { style: { fontSize: '11px' } } },
    yaxis: { max: 100, labels: { formatter: (val: number) => val.toFixed(0) } },
    colors: ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6'],
    legend: { show: false },
    grid: { borderColor: '#f3f4f6' },
    tooltip: { y: { formatter: (val: number) => val.toFixed(2) + ' pts' } }
  }
})  

// --- STATE MANAGER ---
const managerStats = reactive({ total: 0, done: 0, pending: 0, percentage: 0 })
const managerCharts = reactive({
  series: [] as number[],
  options: {
    labels: ['Selesai', 'Draft', 'Belum Dinilai'],
    colors: ['#10b981', '#f59e0b', '#e5e7eb'],
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total Tim', color: '#374151' } } } } },
    dataLabels: { enabled: false }
  }
})

// --- STATE EMPLOYEE ---
const employeeStats = reactive({ hasData: false, score: 0, grade: '', periodName: '' })
const myWarnings = ref<any[]>([]) // <--- 2. STATE BARU UNTUK WARNING
const warningPopover = ref<any>(null)
const employeeCharts = reactive({
  series: [] as any[],
  options: {
    chart: { toolbar: { show: false }, sparkline: { enabled: true } }, 
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#ffffff'], 
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 90, 100] } },
    tooltip: { theme: 'dark', fixed: { enabled: false }, x: { show: false }, marker: { show: false } },
    markers: { size: 0 }
  }
})

onMounted(async () => {
  // Start clock
  timerInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, 1000)

  isLoading.value = true
  try {
    if (authStore.userRole === 'admin') await loadAdminData()
    else if (authStore.userRole === 'manager') await loadManagerData()
    else if (authStore.userRole === 'employee') await loadEmployeeData()
  } catch (error) { console.error(error) } 
  finally { isLoading.value = false }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

// --- LOAD DATA ADMIN ---
async function loadAdminData() {
  const [emps, divs, periods, stats] = await Promise.all([
    employeeService.getAll(),
    divisionService.getAll(),
    periodService.getAll(),
    adminService.getDashboardStats().catch(() => ({}))
  ])
  
  // Simpan stats ke reactive
  Object.assign(dashboardStats, stats)

  adminStats.totalEmployees = emps.length
  adminStats.totalDivisions = divs.length
  
  const active = periods.find((p: any) => p.is_active)
  adminStats.activePeriod = active ? active.name : 'Tidak Ada'

  // Chart 1: Distribusi Pegawai
  const divCounts = divs.map((d: any) => {
    return emps.filter((e: any) => e.division_id === d.id).length
  })
  
  adminCharts.divisionOptions = {
    ...adminCharts.divisionOptions,
    xaxis: { categories: divs.map((d: any) => d.name) }
  }
  adminCharts.divisionSeries = [{ name: 'Jumlah Pegawai', data: divCounts }]

  // Chart 2: Status Aktif
  const activeCount = emps.filter((e: any) => e.is_active).length
  const inactiveCount = emps.length - activeCount
  adminCharts.statusSeries = [activeCount, inactiveCount]

  // [BARU] Chart 3: Kinerja per Divisi dari endpoint baru
  try {
    const activePeriodId = active?.id
    const divStats = await adminService.getDivisionStats(activePeriodId)
    
    const divNames = divStats.map((d: any) => d.division_name)
    const divAvgs = divStats.map((d: any) => parseFloat(d.average_score.toFixed(2)))
    
    adminCharts.divisionPerfOptions = {
      ...adminCharts.divisionPerfOptions,
      xaxis: { ...adminCharts.divisionPerfOptions.xaxis, categories: divNames }
    }
    adminCharts.divisionPerfSeries = [{ name: 'Rata-rata Skor', data: divAvgs }]
  } catch (e) {
    console.warn('Gagal load division stats', e)
  }

  // LOGIC TOP 5 & LOW 5
  if (active) {
    try {
      const reports = await reportService.getEvaluationReport(active.id)
      
      adminStats.topPerformers = reports
        .filter((r: any) => r.total_score >= 80) 
        .sort((a: any, b: any) => b.total_score - a.total_score)
        .slice(0, 5)

      adminStats.lowPerformers = reports
        .filter((r: any) => r.total_score < 60)
        .sort((a: any, b: any) => a.total_score - b.total_score)
        .slice(0, 5)

    } catch (e) {
      console.warn("Gagal load top performers", e)
    }
  } else {
    adminStats.topPerformers = []
    adminStats.lowPerformers = []
  }
}

// --- LOAD DATA MANAGER ---
async function loadManagerData() {
  const team = await managerService.getTeamStatus()
  const total = team.length
  const done = team.filter((t: any) => t.evaluation_status === 'submitted').length
  const draft = team.filter((t: any) => t.evaluation_status === 'draft').length
  const pending = total - done - draft
  
  managerStats.total = total
  managerStats.done = done
  managerStats.pending = total - done
  managerStats.percentage = total > 0 ? (done / total) * 100 : 0

  managerCharts.series = [done, draft, pending]
}

// --- LOAD DATA EMPLOYEE (UPDATED) ---
async function loadEmployeeData() {
  try {
    // 3. LOAD HISTORY & WARNINGS SECARA PARALEL
    const [history, warnings] = await Promise.all([
        myPerformanceService.getHistory(),
        warningService.getMyWarnings()
    ])
    
    // Simpan warnings ke state agar muncul di dashboard
    myWarnings.value = warnings

    // Logic History Kinerja
    if (history && history.length > 0) {
      const latest = history[0]
      
      employeeStats.hasData = true
      employeeStats.score = latest.total_score
      employeeStats.periodName = latest.period_name || 'Periode Terakhir'
      employeeStats.grade = getGrade(latest.total_score)

      const trendData = [...history].reverse().map((h: any) => h.total_score)
      employeeCharts.series = [{ name: 'Skor Kinerja', data: trendData }]
    } else {
        employeeStats.hasData = false
    }
  } catch (e) {
      console.warn("Failed to load employee data", e)
      employeeStats.hasData = false
  }
}

function goToWarnings() {
  router.push('/employee/warnings')
}

function toggleWarningPopover(event: Event) {
  warningPopover.value?.toggle(event)
}

function getGrade(score: number) {
  if (score >= 86) return 'A'; if (score >= 71) return 'B';
  if (score >= 56) return 'C'; if (score >= 41) return 'D'; return 'E';
}

// [BARU] Computed untuk distribusi grade
const maxGradeCount = computed(() => {
  const grades = dashboardStats.grade_distribution ?? []
  return grades.reduce((max: number, g: any) => Math.max(max, g.count), 0)
})

function getGradeFromScore(score: number) {
  if (!score) return '-'
  if (score >= 86) return 'A'; if (score >= 71) return 'B';
  if (score >= 56) return 'C'; if (score >= 41) return 'D'; return 'E';
}

function getGradeBarColor(grade: string) {
  switch(grade) {
    case 'A': return 'bg-green-500'
    case 'B': return 'bg-blue-500'
    case 'C': return 'bg-yellow-400'
    case 'D': return 'bg-orange-500'
    case 'E': return 'bg-red-500'
    default: return 'bg-gray-300'
  }
}

function getGradeTextColor(grade: string) {
  switch(grade) {
    case 'A': return 'text-green-600'
    case 'B': return 'text-blue-600'
    case 'C': return 'text-yellow-600'
    case 'D': return 'text-orange-600'
    case 'E': return 'text-red-600'
    default: return 'text-gray-500'
  }
}
</script>
