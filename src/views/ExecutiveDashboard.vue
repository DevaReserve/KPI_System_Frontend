<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Performa Perusahaan</h1>
      <p class="text-sm text-gray-500 mt-1">Ringkasan rata-rata skor evaluasi kinerja per divisi.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="errorMsg" class="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
      {{ errorMsg }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      
      <div 
        v-for="(divisi, index) in performanceData" 
        :key="index"
        :class="['group relative overflow-hidden rounded-[32px] border bg-white/95 shadow-sm transition duration-250 hover:shadow-xl', getAccent(index).card]"
      >
        <div :class="['absolute inset-x-0 top-0 h-1.5', getAccent(index).stripe]"></div>
        <div class="p-6 pt-8">
          <div class="flex items-start justify-between gap-3 mb-5">
            <div class="max-w-[68%]">
              <h2 :class="['text-lg font-semibold tracking-tight', getAccent(index).title]">{{ divisi.division_name }}</h2>
            </div>
            <div :class="['flex h-11 w-11 items-center justify-center rounded-2xl border', getAccent(index).ring]">
              <svg class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-[auto_1fr] items-start">
            <div class="rounded-3xl bg-slate-50 p-5 border border-slate-100 min-w-[120px]">
              <div class="flex items-end gap-2">
                <span class="text-5xl font-semibold text-slate-900 tracking-tight">{{ displayScore(divisi.average_score).toFixed(0) }}</span>
                <span class="text-sm text-slate-500">/ 100</span>
              </div>
              <p class="mt-3 text-xs text-slate-500">Skala 0 - 100</p>
            </div>

            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                  <span>Progress skor</span>
                  <span>{{ scorePercentage(divisi.average_score) }}</span>
                </div>
                <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div :style="{ width: scorePercentage(divisi.average_score) }" :class="['h-full rounded-full', getProgressTone(divisi.average_score)]"></div>
                </div>
                <div :class="['inline-flex items-center gap-2 mt-5 rounded-full px-3 py-1 text-xs font-semibold', getScoreTone(divisi.average_score)]">
                  <span class="h-2.5 w-2.5 rounded-full bg-current"></span>
                  {{ getScoreLabel(divisi.average_score) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { executiveService } from '../services/api';

const performanceData = ref<any[]>([]);
const isLoading = ref(true);
const errorMsg = ref<string | null>(null);

// Fungsi untuk memberi label warna yang halus dan informatif
const accentStyles = [
  {
    ring: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    stripe: 'bg-cyan-200',
    progress: 'bg-cyan-500',
    title: 'text-cyan-900',
    pill: 'bg-cyan-100 text-cyan-700',
    card: 'shadow-cyan-50'
  },
  {
    ring: 'border-violet-200 bg-violet-50 text-violet-700',
    stripe: 'bg-violet-200',
    progress: 'bg-violet-500',
    title: 'text-violet-900',
    pill: 'bg-violet-100 text-violet-700',
    card: 'shadow-violet-50'
  },
  {
    ring: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    stripe: 'bg-emerald-200',
    progress: 'bg-emerald-500',
    title: 'text-emerald-900',
    pill: 'bg-emerald-100 text-emerald-700',
    card: 'shadow-emerald-50'
  },
  {
    ring: 'border-amber-200 bg-amber-50 text-amber-700',
    stripe: 'bg-amber-200',
    progress: 'bg-amber-500',
    title: 'text-amber-900',
    pill: 'bg-amber-100 text-amber-700',
    card: 'shadow-amber-50'
  }
];

const getAccent = (index: number) => accentStyles[index % accentStyles.length];

const displayScore = (score: number) => {
  if (score <= 5) {
    return Math.min(Math.max(score * 20, 0), 100)
  }
  return Math.min(Math.max(score, 0), 100)
};

const scorePercentage = (score: number) => {
  const percent = displayScore(score)
  return `${percent.toFixed(0)}%`
};

const getProgressTone = (score: number) => {
  const value = displayScore(score)
  if (value >= 80) return 'bg-emerald-500'
  if (value >= 60) return 'bg-amber-500'
  return 'bg-rose-500'
};

const getScoreTone = (score: number) => {
  const value = displayScore(score)
  if (value >= 80) return 'bg-emerald-100 text-emerald-700';
  if (value >= 60) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
};

const getScoreLabel = (score: number) => {
  const value = displayScore(score)
  if (value >= 80) return 'Sangat Baik';
  if (value >= 60) return 'Baik';
  return 'Perlu Perbaikan';
};

onMounted(async () => {
  try {
    isLoading.value = true;
    performanceData.value = await executiveService.getCompanyPerformance();
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Gagal memuat data performa perusahaan.';
  } finally {
    isLoading.value = false;
  }
});
</script>
