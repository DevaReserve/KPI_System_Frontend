<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="mb-6">
      <button @click="$router.push('/')" class="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium mb-4">
        <i class="pi pi-arrow-left"></i> Kembali ke Dashboard
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Catatan Pelanggaran & Peringatan</h1>
      <p class="text-gray-500 text-sm">Berikut adalah riwayat surat peringatan yang diterbitkan untuk Anda.</p>
    </div>

    <div v-if="isLoading" class="text-center py-20">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
    </div>

    <div v-else-if="warnings.length > 0" class="space-y-4">
        <div v-for="warn in warnings" :key="warn.id" class="bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
            <div class="flex flex-col items-center justify-center min-w-[100px]">
                <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl border-4 border-white shadow-md">
                    {{ warn.level }}
                </div>
                <span class="text-xs text-gray-400 mt-2 font-medium">{{ formatDate(warn.issued_at) }}</span>
            </div>

            <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ warn.reason }}</h3>
                <p class="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                    "{{ warn.description || 'Tidak ada deskripsi detail.' }}"
                </p>
                <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div class="flex items-center gap-2 text-xs text-gray-400">
                        <i class="pi pi-user-edit"></i>
                        <span>Diterbitkan oleh: <span class="font-bold text-gray-600">{{ warn.issuer?.name || 'Management' }}</span></span>
                    </div>
                    
                    <button 
                        @click="downloadSuratSP(warn)"
                        class="text-xs bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded transition-colors font-medium border border-red-200 hover:border-red-600 flex items-center gap-2"
                    >
                        <i class="pi pi-download"></i> Unduh PDF
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-check text-3xl text-green-600"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-800">Bersih!</h3>
        <p class="text-gray-500">Anda tidak memiliki catatan pelanggaran aktif.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import jsPDF from 'jspdf'
import { onMounted, ref } from 'vue'
import { warningService } from '../../services/api'

const warnings = ref<any[]>([])
const isLoading = ref(true)

const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(savedUser) : null
const employeeName = ref(parsedUser?.employee?.name || parsedUser?.username || 'Karyawan')

onMounted(async () => {
    try {
        warnings.value = await warningService.getMyWarnings()
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
})

function formatDate(d: string) {
    if(!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function downloadSuratSP(warn: any) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    
    // --- KONFIGURASI WARNA TEMA ---
    const textDark = '#333333'
    const textLight = '#666666'
    const accentColor = '#3c77b8' 
    
    const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAwEAAAD1CAYAAAAI9PmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAANyNJREFUeNrsnU1uG0nShtNC70d9ApdP0PR+AFO7xrexdAJRJ5C0GsxK0mrQK0knEHUC05vB7EQDszd9ArNP0OwTzFcpJdtlmkVWVWZG/j0PUJAtm6yq/I03MyJSKQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASJq//+M/h/V1TEkAAAAAgASvKILwAqD+8VRfo/o6++9vv04pFYi+3f7z31X9Q1/j+vqbab/K/Dzc8dFVfS3Mnz81/r7477/+byX07Nf1jyvz16P6vvMC6+6rKfs3UuUOAJDwuPlk5ruTesyc5fJeP1G10QgAzUP9O4UQgAgHwJEZAN+Z9loN/KpD8z2q8XN9j2X9Y27EwbweaJeeXueXwqvzvFEXegeS8QYAYP/8pzmtL0QAOBcACiEAEQ58p8ZQrARuqe8xMddaFOjB9pPjlZdx4VU72RAE04zb8O2WMTY56vZ/5Kl/30b6yo/1O09zrc8W9I7on42/L831/GePiyKwn/PGn4/1bmou9YEIiEsAIAQgtNG0NsRPhQz/faLgQl/1c62MILivB9+FxftpQXNYcP1ONt5/VP9unLFL1AjR18phxGXzqcD6HO/pu/rH2n1SG6C/q5edUwSC3zHzUH2/cLIWBZeIAPAhABACEGKgG5uBLdYA9fVAPDE7BPf1NR3gz35eeFVve/9TY0wAQFrC7cqM30v1zZVyRpyPUy62/G6SiwggMDhOAdCEYGHwbfxfqXRX13Tf+NjFXah+Vz2Yb7o/FBMYbOr6qeWff87RcDAuL9t2fnRZvDaiN6adobUx93tTmPloo2aFcz0XVerbzt867keyXPT7Lcx7P690b1vd3lKf6+d+bZ55pEAzM+MitoN9P/mqtu+Kn+VQvoiAuAUAQgAw/rsbT3rie9x0FzLGjn7XbSs6JYmAB/Xjtvaay7oc7grtCxPTPqrARtuNjaubpzHCpw9+ZwHfU9jofn6uCnb72xgXbxADVmPDQ8s/64x2bxEB4FsAIATA5aBWmYndt9uPnny0cf1FvazsrbYZOI3VyPXPdw6Eyapx71/M97UZBEWIgEZa0Nb6qsvhTcH94tD0i0mA20e7omjK5cHxeDE377z0/Ny2c25uYuAyp9SWQu3/ac989DYm4Y4IyFcAIATAxYCmV8iulL8VMj3RaF/9me0EbwJ43yv/7hqliIBr9e1shDZOSjcS9uyW+CD6HRhjUH9W9jslWpzfSL2voBDQRmAf//D1oscvpkwlhcrMCDBiBva3n5Fp97vQcWlniACQEAAIARg6mOmJ5kH5c/2Zm8l97uHZ17nsfblrlCIC/uggprR4Oym8r7gyeDv1Gx+pPz0uINikE10Y43Mh/Ny6Hr/GXI+mzY2FFj00SyP4FwpcLAgkHU91QFUnJQA0OmvQhBKGjgPZxBg1PgTA3BjR3gxpPbhqVwnjqqJXXFjBGtYGuhgWx8ZoKhYzmd8L3e4+oaKxMRinZpxYBKjPpYr8HAwzxmkBrkXSz2acW3q8pe7jT2a3FdqFWVc7K2l7DBGQlgBACECfgUyvZDwo9ytL2lA68Wn8t0yWejLXYuCO2u3Fuaf/mysLofackuvV0DHk0hi3IcX7p8SEqMSih67PD2aBAOwM+6THTERAegIAIQD7jP/D+vqs/KxQaMPlTSgDxqyaaf9bvf2+pLb3toW+aRMZU2REQGquGO8GLBQcRRLvkOQ4YRY93npuKw8mCxQMN+yrlHdVEAFpCgCEAOwy+j57aoN6Ve8kBv9HswPx1ogScDOZaQ5LXx0Uat/JuLX1dI1YC5yYYm0WCbdFLWCOPL/DBzNvgPorKUXV82OniAAEQKiUZAgBaAqAJ+U+qDGmVb3vjDUTyIp7kBvjbahwgLzpk1FspgL5/wcWdb6f36cQeE4Da8YLGDb+JRtPhQhIWwAgBGBTAPjw/486g45xDzqjFfzAxcDPjVgZVL7bexJ+6sZVpGs7msayU5gbpkxPlL8dpJHan0K4hHlUG/JjQfGACEAAIAQgegEQ/Xa68Z9FCHyPzRY1uwGMK9og+tDxv59Fni89eWFiXINufC4aEB9gJYSStL8QAXkIAIQAAqBYAbAhBC5pFX+lBa1sJjTcA4puP4dGABx2HCemkb9SFjnxjUvm0qcNUXibtwnwTTKeChGQjwBACDBRu+QyxcNkzCQ5pXU4CVRjHCl3XOkyty1VIYftRYbP3YCq4MQAEwdzaXIBwoiAvAQAQqC8ibry8PV3Cazs7RQwKpOVv4FtQ49LYwdfhUsQAqAN3b/ecuqsPGZs9uneVGpsgIvxbpxaPBUiID8BgBAog1tPbXBhAm1TniT1BFny6cKujPeKU0WLEgBVx7lNG6FHBAAHZerxu6vSYgMGpgX1Pf4iAhAACAHYOmDpOvVVr1kE15oVypsC28ah47ZxSo8rot10PV/kJoITgEGpj56/v7R+79JwP04pngoRkK8AQAjkO1nfevr6u5y29018QGnuCheOvy/Z/NfQa1GhS3IBbfxfU2JRjG1zz7c4Lqj96/Ft7PArXS/EIAIQAAgB+FaXyk8gsF7Zy3HlvLRsQT5W8IgNyNcAuugwpuix4W3icUI54lMIHBbkEnSeyHciAhAACIHCJ+xrj+3wPsctfrNiNi2kfbj0a23CuJFne9HG/75dRb2TdkQAcJT4rpNxAX3A16p9MnEViIAyBABCIP3BSht3vrI2aOP/LuPiKyU2wNfq02HBaQOzNHzq63MH42eOAIiaPz1//7sCylAvnPjy309iNwARUI4AQAgkXm8ev3uac6CfOWlzVoBIHHu8BQHCebSTUcd5TY8JZACKm7nn768KKEOf6VCTiKdCBJQlABACaU7cx54NvPsCijH3d/Sd2zu5/NcwWADogwLPKLHiqTLvD2OBd4zezkIElCcAEALpcevxuxdmpTxrTGxAlu/p4Lj7rhAgnG4b0WO9dgHaFwB8YrJqQfywSxP/eBb9mIkIKFMAIATSmrwrj7e4L6g4c33XifLn19okqfzX8NcYohcR9rkTaoNSu//MKLE0kIjVyDVDkHHTkVg4iT6eChFQrgBACMQ/UOk2eev5NiVN+rm+q9RqU1L5rxk/ngOAtfG/7+wIbUy+IQAYCkJyhT7qeCpEQNkCACEQNxPld4V3XlLgn3F7mmdm6PlKCxrD5Al2CwhPHUSbFsYEAENpfUPS3ok6nqp4EYAAQAhEjG+D62OBZfqRNmJFVdAhQqkaOXou+9phTtMnhJ8gAKAwfKYFjWWcRgQgABACiU/kuh4qz7cp0f93llEb0e0jhEHObkC8beLYzGn7jJyz2vi/pMSS7/++ydFFLMT4FW08VbEiAAGAEIgc336EyxKyAm1i3jmX9w5ljCeR/7rQhYMPan8GIO3+M6XEksd7H8xtl8jsYoaw+aKNpypSBCAAEAKRD1S6XY4932ZecBHPM2gjoScVxoe42oMOAN6XAWhpBMCcEoMO5OgmFjJIN8od1OJEAAIAIcBA9cyngsv3sb5uzLVM9B12+bVKuHngEhSJGKyvLgHA2q3jLRmAsmLs+fsXmfWVakc/kZgLooyn+gkBAHuEgPrvb79OKQpRJMRXscaAWQmdJ/4abScE64xPd/Vko430yuP9n/Nf41YS3Kj50GE+m3ICcJa8Zo5wNq9O94yrrjiPbe4pZicAAWAlBCYUg9jELpK5gBXBpNvIeIeB/2h+3gg8yim1EawN6Hnsc4f57AYBkC2+bZncdovPd4jkZUMI+CS6eKoiRAACACGQEO8F7jGnmLOczJaNlXmdBcm3T2/U+a8zFgATtT8DkK57nQHomhLLsg0cCtgz88z6TFt/eV44MUJAIntcVLZU9iIAAYAQSIyxwD2WFHOyk1ml2o+7X+8CrLN6SExoxAbI1r826h8UGYBK59jz988yywy0a+GkKXbuBZ4lqh3UrEUAAgAhkNgEr9tpJXCr3ynt7CYzzabRJzGhRZv/OsPxQRv/+3yWCQAuA987xh8z6jfjHTbgd26TRhAsPT9SZXYmEAEIAIQAfMdY6D5zijrJyWxXWtDp5rkPxhD0bQxGm/86p3qvr88dy/mkxPM/CmsPlfK7E7DMbBepbeW9bbe0qN2ALEUAAgAhkCjvKALYwa6g8ceW30tMaLgE+TP4ugYAr7ml1LLHdwabm4z6T6V2L5xsc3mSEEDjWAKEsxMBCACEQMKItFkOC8pu8l+01alZ0fPt2xtl/usMDJixmcv6GAvaPeuC0su2Tewyal2Q2y7ArrK6bxkzV0JC4CqGAspKBCAAEAKJD+4VJQE7DMKqz2TWQGJCYzfAbX1P1P4MQG3ckrUp3znX8/dfZlZebW43sz1uc48CzxZFPFVuOwEIAIRAqkgJgCVFndVktuqwcicVIIyIdSMAbh0Yex8I2M6uXVwrv3Fj2j1mllF5TdTAhROzsyoRT3UcupxyEwFkRJBnRbk7YSx0H0RAepOZnsgmQw18s+I1F3hUFgPs6lkHAOsTgF2481TK/6oxyBq0Pt1H9Bxeyi7AsqNLrMTiSXCXoKxEwH9/+1WfjDhlyBAVAEd1uSMC7PkbRQADjOuu411x+a9TEwDqZSfb5cog8QH5CACfgm59sNwqozLTHiHjln/uGvgsceBi8Hiq7AKDEQIIgETBjQ3a2Hfc/f5x8WWbf+n5OaPKf52YwfLV0xhAfEDCwtCcDeFbABxleK7E+Y737eTyJHjgYtDFk2RFgA4Crq/P2/zREQLhBEBdHyNiBAaB/y5sMwQmqn9aUOXo/yc3oSVYv3rl/8lz/yc+IM1+3/VsCATAhnhS/dOCtiGRLnUSMp4qSRGwkQXoASEQjwAw9UKwcH9GgvUH6dC2orUYkOpVYjwcEyDc2VjRrjofBBYAdH0QHxB/exjpoPD6+sPUl89+tFB57gBodrnA9XKLLCGeKjkR0JIGFCEQjwA43FUnEJwvFEEyRsF4hzjs7eNvJjSJ8fCK2usk7iQP9iI+IC5jX4tlvQJ8XV9P9fU/9bLyfyEgCu8yFgCatt3I+cDTtLPeQf0pAwHQFALa8J9uCgH9e0XmCkkBsLNOAMBqYrDxVX0UGAu1wXmZU6ChB0K45+hV5gWHBTpHG/VPe+o6hrgMbQCf5Vz/NmlB29ApmE3aXp999jmeKsRBbcnsBHQ8CIwdgXgEwM46gWC8pgiSmMwq5c6vtTmhzZX/AOEo8l/DVogP8NPexzuu0AJgbfy/KUAA7koLahPkm212tSREQM+TgBEC8QgAhEA3g09ykqgo8SSYeJyQish/Da0G6weKoQjmDeM/e9vHLJyMPY15EuUXJJ4qehHQUwAgBOITAAiBbhMzQJO2gODZQL9W6QkteP5r2GlsXFMMWaLHBu3zrw3/oxKM/w4LDyvbMc+MubOA71CmCBgoABAC8QkAhMD+sgZ46V+704Jar+IbVyKJMZB0od37v/QYcIVIy4qpMfz1delgoSC1MXOXC+LMUXySRIDwsbS7XrQiwFIAIATiEwAIgXajjAPXoIvxvHTo0yvhEjQhXehedN9/U18nAe5NfEA+jFXZi0mTHTaJk1z/QgcuisdTRSkCHAkAhEB8AgAhALBr7HNz3H1X4SkhPunn7czUS6rGlRF3l8L3Jz7AnZA7armkFni02C45DqfNfXLueFfkMeC7lCECHAsAhEB8AgAhEJaKIkhyMvNxhH22GS9SEAC1cXLSdFOo/3ynZPyOmxAf4GDe1CJu26VednikVugvSnTxMqduV0Jj3J3AK40k6zEqEeBJACAE4hMACAFEAPw4mbk87r6TISpgoFQmxgG+p+3QPj0fLYWfhfgAT5hV6BvBWz4U6OLVtnBimxZ0W31mF08VjQjwLAAQAvEJAITA9xAXAM6Ouy91QsvAaNR1QnxAXnWqV4/nQrerlOxJ1GHtxt1pQX257ki4BE2k+mMUIkBIACAE4hMACIHv60Fy4IT4cH3cfRckXILGtLleRqMei4kPyIszwTF+YlxkSmBXHMSdp/6pBd1S4N0uihABwgIAIRCfAEAIvCC5E4BBFhk+jrvvOKHpyWweeLKGH+uF+IC86lP3M9yC3I6ZuzLp+HCfbCJRlyI7qEFFQCABgBCITwAgBJT6U/BebPvHh6/j7ruQZf7rDCA+ID9hNxe6ne5rD5kX6UR5PE9lD1LxVN53dIKJgMACoHQhEKMAKF0IzAXvNVIQDXvSgnp31zGnivo2NsXzX2dgNBIfkKewk3ILOs7cLWhXWtCFQN+cBXzHtEVAJAKgVCEQswAoWQgsBe/1mrk4iclMKnBXk13+60yEAPEBedWnHudxC7K1IV92q6qAY5kmi3gqcREQmQAoTQikIACKFAJmcpASApWCWCYziePuuyAxzo1wNRk0NoSKD7il9L3V51xQ0OXoFrQrLehUqB6lDlz0ungiKgIiFQClCIGUBECRQkDJBQfjDhQPE+X5uPseIlTC0CRd6DBCxAdcFJRlJkR94hY0xI58WRlve59H4ceR2A3wmi5UTARELgByFwIpCoAShcAnofsckrIxGqSOu+9CVvmvcyJgfMADY4U30Y1bkNsxU3MnXI9TATHnNZ7qJwTAVqNTG/7TTSGgf6/aT/REAAjXSYbMBe+lJ/algmDsOe5eu2P8L9NX1/mvr2kBvQ2ORd0mdHyApJvOOj7gLTXgvD7v6vp8r9qTAriux4dAQtLlmHm4xwb7o/4/OTYXLXy82D/edwISEwBNo/OHhpbgjkAOAmBnneQ2yQsa5mMFMQzsJYJLkIXhqOTjA0bEB3jjROEW1OsdVJkprr3FU3kVAYkKgFyEQE4CoBghIDjBv2P+Dcee4+5zp8LX3AriA/IRdStTn3JzaNpuQSUfOuhl8cSbCEhcAKQuBHIUAKUIAam4AIKDmcxCQrpQO8NRcgW5aUBW1IDz+tQLP1KLP8lmC9qTFrQEvMRTeREBmQiAVIVAzgIgeyFgJoSlxGRgDqkC+cmMg7ME8l9nbjhyfkBeSGcLumDhIEmc15tzEZCZAEhNCJQgALIXAkpuVWjMmBqEiSrTr5VJ3a0QmAaYf4gP8FOX0m5BVymJ8D1pQUvCuUuQ0+xAmQqAptEZc9agkgTAzjrJgHsfin8LOi7gTkEsxq9OC3oUyaSrxzPfbgN6e/tG8EC0HLk0863knKvjAz6ZXUtwJwRmdbnOhIzdtVvQUSLFs2vB4E2AdMptQuWr59s8x1O57HvOdgIyFwBNo/MHYz+CHYESBcDOOkl8MtAD2lzgVqysyE8Uu9KCPkb0qDOVeP7rQgzH9Qoy8QF5IFmX44Tcgtrm+GkMAqAxb0vYgU53A5yIgEIEQKxCoGQBkK0QUDInESoyfojTNoCLHXffw7iUWOnFJci+rogPyE/USRG9W5DZlWyzYR4je1yJ5zl2WWfWIqAwARCbEEAAZCoEBAOE3zP1ik1meuCO5bj7WISot/zXhRmPU0V8QE5jP9mC9i8ULOqymkdWd3OhedvZ4omVCChUAMQiBBAAmQsBJXOsPDsB4SczTXSxGWaFWWKS5fAwN+jdgIXwPTk/wA+4Bam/0oKOAi5SDEHiuZzZOYNFQOECILQQQAAUIATM6p7vVYVDs91aFNLpUfccdz+NODhWYodikvgBRrGMFyHjA0g37KcupYjVLahtgWAVk/vk5ngucA9n8/YgEYAACCoEEAAFCQElsxtQ1EqsGTylVy93HXcf64rWWohKGJUXClzUV6j4gAeEnPO6nCk5F6/o3IKMKJkkOGauhOrNiUtQbxGAAAgqBBAAhQkBY4TNPd+mmIObzPZyiMmu7YTguTHcYkZiQsMlyO2YMRW+rZ5/iA9wjxZ0S6F7xeYWNAk8JtkgFU9lbYf3EgEIgKBCAAFQqBBQMit7VwUIAN1PPgS4rxYebSLrMYGik5jQKnzLnY8Z0uJyUqJroWdBV7JbUNtK9yyWtKA76m0h1P+sdwM6iwAEQFAhgAAoWAiYAcV34Ogk590AIwBC9ZO2gTpmv9Zm+9MTLulC0zQepeMDbokPcF6XcyWXOCAKt6A9aUHvE6k6kQBhWze8TiIAARBUCCAAEAIaHRuw9D2BZyoA1hPbYYB7a2F1nPhkppHYsRhzAJXzxQPiA/JAYvxv9sPrwO/btjO9jC0t6A4kDlzUWLlw7RUBCICgQgABgBBYT+gS28LHueVsN8ZIyPFrl5vVNKH2J3VuRfZuacL1NlXEB+RQjyHcgoKMmXvcJ+8TqzOJvmcVT3WAAIhWCCAAEAKbg8pc+c8WlM0qXmgBsCct6CJ2v9YtSJ2GybjmFuID8hACevyXPE8klFvQroWAWWLVJhVPNbivHSAAohQCCACEQNtEcK38ZguqVAarsRHsAGguAhvUrpkK3ONQkS7U9ZghvYrcXFDAfnCLpFvQSNotyOwCjFv+ObmFE/O8c4FbDd4NOEAARCcEEAAIgX2ceJ4Ikj4FtBEEPAr4DLqP7gp0nadWroIBwqQLdV93CyVz5sgmT+zsJC3opN2Cdi1AfUy02qTiqcZORAACIKgQQAAgBLpOBCfKb9BRkqt4HQWARLali119NYGzAUJOaBWuJF7GjWsl7xa0tidCM8qoHucqQ7egPbsAmnmi9TVVMgHCg3bwDxAA0QgBBABCoM/AotvJkcfB5XksSEkIGMPx855+8rySZoSUr+eoVGa7AI12R4Bw2lwGuKd2KwmddjK3uTNHt6B9fX6RcH1J7KAO2g04QABEIwTeIgAQAgiBwYa3NjL2GRovQtv/KvzVnv66TLzPSExooXcDxp6//3WgMUML0GmAW+tA4VwzBlUB6jErt6AOuwDK58KNAFJZjXovnhwgAKIRAksEAEIAIdB78tCrVHr1f1/9LSQEgCmnfc/ye+L9RSqoOefdgCrgvW+U/CFimotM3byC1GUItyCP8R0PGff19Ty9lFi86LsbcIAAiNPoRAAgBCIUAtFkbdGTkdmi/txh7BIRAD0ms9cpdxTBCa0KcWhR7oGsggHebYbkRLg+xxnXpWT615EPYW76eKXyR6rP9aojvRMwQQAE4dYIsG0CoEIABBMCSWbFMYbZG48TwuFzm/3nvz+EPtW14fvfZbCbGwGwEniui45jaQ4T3lLoPucB2pvEfBjaML0JeG9pIVAJ9P2Q9SnpFuQ0c5zZOb3q+H9Tt4e+CN1n3Kd/Hfz3t1/1dtIU+0+UdRDwVsPEuAbNKCZxFirtoM1Vfb313J/1BPBZr95ID8p6YKuvr+pltb3LxD6ty0NKAPQ5JXWcwYQmtfp4qORPn30v1J5HAceKpQobaCkpBN5lIhzb6lI6/euDC2FuxsA+bkDJpq02LAXvddt1jjkwRmfXU2zBnQDYOQBTJ0GMmlZhlpgY0G3HZwpRPbjo1ZuvOiDXc8CY9vnXA9ofPYz/dQYgkRWyRlrSPqR+IFYleK9jKYNxzynPrgl9HkLose7Bd9YgU58SxuN54DH/WliYf3CwkPHQUzylfn7IofC9OvWtA4zOOATANtcg6gQBYDEp6J0k7R7kc0dpbTDpnYHPxlgf207aervZfJde9f+s9uTc31qXL7mZJQVA3wH+PPHTVMfC97sVKq8LJTdZXwR2I4lhN0rv7j15DjiVeM8qguxHkm5BIzUwmNeM8R8GiLNxTHFpA3gvfL/jLuX1aosx+iC4EoIAUN8FAV/W/z6lThAAjg1VPdjqCaoSLtel+uYHuVA/rjxWjWd6t/H3IWjXxhupVHJmgN2XDnT/mJDYwWEmkC9E5h6v5WV2Gx4CvNOZEe2SdThWcRzi5aUcjKi4DTBv3phV+VL65kz1OHfFCPm+OwCbXNb3u1MJYd77c6Db7yyvV1sfGKMzhABYGxJnCAEEgMcJ4lzlF3C+MAPdXNCA0hPt2NFX6v7+UdoQHGhY6fcOvRqn/Z/vXIk949+sDcaQPsdTY0AuBepxYt43xnFgbsphbtk/u7oORvkOlvXbJWOaa/vmctfuq+ljVw5tGF22OlXxLPbzAyLpb61t8lXrg2N0hhAACiGAABAw5C4yEQMrM7DdCZTb2Bj9p56NCz1Ia0Pwd/Vt92QVYreg4aqif/6i4gvM06Lpoy6vPgaXMUgqYyi9i+y99Ht8Ut8SFCxsjJyNd13XYQr9fmnq95Op38WOd1u30dfmZxXZO6z7sjLvsvTcb0OtOjfrbGHa2Vigjy3N/b6YPz+XbwgR1miTVeO9Y+pvCzNmztdjy6udL4TRGUIAIAQQAFJiYGLEQJVgv9InMN4JZf65VuEPrprrTEeeDf6nhJv01vLR/uYqfDrOIPUfSbt1yY0xrMaZvI+3Pp1h3Q+iLt9XnueG/6VePgc7/wOBqaEEgKbtZGHqBAHgovPr1WVtROvg4SPTpmIvk6V6CX57o/1uEz9GHgDA1/h+rcKmgIVEONjbmDA6QwgAhAACQHLC0CtSOrjrZ/WSWjQmQaANf+3u81YLFu13ivEPALCXM4oA9tF5qwQ3FHEB8F1nxjUIASCN8S0dq29b8IdC/ecvv8XUMucAAABkJwIwOoMJAIQAAiAWUVCpl/gBLQj+pl6CDQ/VsEwUa2Nf//xi/rzE6AcAAIhQBGB0BhMACAEEQCpCYbSjnS8lUiACAACABxGA0RlMACAEEAAAAAAA4UQARmcwAYAQQAAAAAAAhBMBGJ3BBABCAAEAAAAAEE4EFG50hhQACAEEAAAAAEA4EVCo0RmDAEAIIAAAAAAAwomAwozOmAQAQgABAAAAABBOBBRidMYoABACCAAAAACAcCIgc6MzZgFQshBAAAAAAACEFgGZGp0pCIAShQACAAAAACAWEZCZ0ZmSAChJCCAAAAAAAGITAZkYnSkKgBKEAAIAAAAAIFYRkLjRmbIAyFkIIAAAAAAAYhcBiRqdOQiAHIUAAgAAAAAgFRGQmNGZkwDISQggAAAAAABSEwGJGJ05CoAchAACAAAAACBVERC50ZmzAEhZCCAAAAAAAFIXAZEanSUIgBSFAAIAAAAAIBcREJnRWZIASEkIIAAAAAAAchMBkRidJQqAFIQAAgAAAAAgVxEQ2OgsWQDELAQQAAAAAAC5i4BARicCIE4hgAAAAAAAKEUECBudCIA4hQACAAAAAKA0ESBkdCIA4hQCCAAAAAAAQQ5iepjaCDyrf0wRAEF4qMthIlwnCAAAgA78/Z//PqyvESUBHdvLmFJIop5Gum8jAvwanQiAOIUAAgAAoBt6bP4c0mCAdAxLbdfUP48pjejR9udVqJu/irYRu3NDQQD0R8I1CAHw48D9P+/1+q//mwZ+xw/1D58T09z8HGfQJI7q+ppvKcOxGbdCMW+MrV/MT92fF/Xzrjy3n6DvXr/fq4B952v9o6qvm/o5rhMa164DGjnrtqlZ1tfv5udyW9/KaC5Zz9Xz+j2PMq5f8fHXcdnpOnow7fSN7/FzGz/FWvp69bk2OpWl0YkAGIbeEVCbQsBRnSAA2rlp/Pl1fY3M5Qo9UAcTAfWAVzkWAOsJ/lPjd0vzs/m7d5mIguY7+m4ru2iW5fFGHS+NSNDlP/MwqUm++9y0rz8jMOomRgBozuvrOqH2umlI/WLqqxK492Fb36/LdD0XPbfXuq3OMhEAVWOOHutdgfrdFkyvUXLVaKe6zu6kH+BV9A16+OozAsAeHzsCCID+A/oHh0bOUagVMMcrRtoQvOtqZBoXiguV1opVr7oyq+S3gmKgC9qwevRtYDl+d/2sl/UzLyMaB542jNngu3qOhM1tRPPwytT9fcpG85Zxdlq/z1ki43qy4+/AMau5q6l3p94gAtwIAQRAnEIAATB8wHDlRqNXZ08CvcMfjvrdYAOosf1qIz668s78PBxonPaehIzYebIwhnW5Pm78bm186lX3Sg3bVdEG9Y1Pw9XBu3s3mBwZC89jaf2cbzMY12zn40v1zd1ns6/9YtrrkPYwN+11nlh56vf/uqU8f/blatJTBCzNtWuH7VQN2yXSdfVpz3hc9fhu3yLgactYeiK9I/Uqmcbd3ehEAMQpBBAA9oP7H46+7o30KqcD49uZ8dMy+HbCxifcBOm9N2Kuyxg0aBKy9Jvv5G/eeJchCwGXviZXBzEDP4fwy93zTm3j7FEOfu2WK8l7y8CMncfGuOzb76PbFRo4znqLI+lQf0uzsDDtUo4W43PXsasyzzuxbVsWZVYZsfaDkPEdw7HJQSoDRccMNQgAP9hmDUIA2Lb/F8PE1RZ1iK3b041JYSgfHTzLx0B1ODOrzHrL98aMVz7uMxd8Fy3I+txvnbXk1keWG8t3n0coAKodxsp5JsPb3HNbXekdKGNcnfQcf7R40BmZLhIpy6vI2or2cX+rjfNYhJR+DjN2HVnORT7qaSydBvggpZFij9GJAIhTCCAA3LHaKNehHEumGTSD2rjxqxuLr3MxaAf19zVGyfUAA1q6nLq8y8IYV33r9MKIgVFE776MsM9f7enHVQbj2lKw781Mv+vjcqHHSi1aP8ScnnUjePyHdzD/Lol227yMTVhvLBi8lZ4P9gh7ccF2kNpo0WJ0IgDiFAIIAL+CYDrws4fK/ynQbYPaqucEnIKhNnQSWhoDeurh65fC76JFTV9f+pEnITD03X+PzKhbu7F07VvJ9oMAIvxkQL87Nu01VlviNKK2cpdC4LoRKEfCQmDf3DuRbGMHSQ4a3xudCIA4hQACwI/h3+TekWEuachMY10ZCjgR6b4zz+A9dP+/HCBInzgJdysXHeauCYeHWfW7vgsSoxiFgImFGe97dqFThPXu4GVC7WA1YAHDZj4879j3EQEdhMAdAiBKIYAA8MOXjcFrYWE8VkKnSU42+uA91biVE+UpRkB4Qr0bYFghBLZz2rHsJhTVYPSctcxACJx2/H8Siz+XqTUCM5dOBW7VNSmE2K7NQcq9tzYyLxEA8QmB+nqLABAj9t2A5j1mqWTZCDAJrTISSGcDBM2hitvVQpQ9/t3BDIZM+92QVWBtY3yIpK1UPYSg7ziSacIZq24E7tE1KYdYDMdBbp0aARBeCIDoJKZXXYca1mOfE4LZaWh+/yM1tpM7lcdugH6HIauBh7EYVhHQx7CX2tXLdQzVRut04Ph5nVhb8S0aHxNuB3oe9Zajf8t8GIW4z0oEIAAQAoVis4LsM13od2lBpQ9BSdR4nmXyLtOB4nScUDpGX8bCWPU/4IrdADuGrgJfhXRjMztnfedfX3EkywzOrfCZPrpvHxWJ4chtJ+AUAZDESgS4RRtcQ1eQvaQLNTsMx46ESsoGnd7WHfco448Zvb6NYVXyOD5EmI8zSRcaSrQu1XCf8NuAj94leHyTLlmnhpDDAoaXd+gYuN1m0yICOnfk3369VDLBHfCN5yBgiiHoBGazguwrsHAzLWip/VIP/Hp3ctSxLmcqA5egxoS6Gtgmb0tsLMaQHw/8+JUCG4a6sowD5OC3NRJ9tJVPhc+lPupp4lvcZxcT0OMUW3AkAAgCjgKboCYfOznNSXFWcFrQIa4Cc8Sp/8kvUmyMM9KF2rVX3e+WqQiwnsHjm/iII1lk0hQ+Oa6nStkttHn1tDjIsjMjBBAA5U1gSxVJulAzOR06Eiip83rAZ75k9P427k1FuRkO9O/epOh4CgcMFa0hgrPPA39+zfTZFsgn89vz+zgUNbbl7FXcH+TakxECCIACiWU3oPld88LTgg7ZCZiauky+3CyDwUtb2XZhwJ8qyF60Dgwe38RJHIk5+Xyeje34cqL03MXutSNh7yuGI28RgBBAAJSG5Xb22EWWC/Mdze8pNi2omQBGA+pRT6rXGYmnoQaC18kvQlwYkVVA//RcxtCgRrWw4CCOxC8T5SZZjbd6Osi+UyMEEABlEXo3oPkdS5MqslTGNMdnbHxs3xciGDeNhUXgflwyNkLgWKCtVBv30YsFQ+dk4khkxdrQfu3N3eyghFpACCAACsImu4zVhLBl67P0w8He0xytDdpSdgI2V/ouLYxRkfzitNdgfX6zrehx1iYFM3Ek/oR9tSEuLy2+0ou4PyilQhACCIAi2vmLH6NNO7eZECYbf78reALwlXq1NKNK5W7QbjlJdG7cUmwMO2IDhmMTmD/23FY2x5WVGWfvaCvRsWm035h+PXQ89OJudlBSjSAEEACFEMp4aA5604LTgtqKqdyE6dLyK8aZF9GmsfBoyk3v6g0tuwmHhw3Gqr16Fq2b48rMBLLaLP4QR+JerOk20IwHawZP28zPzmMDDkqrHIQAAqAQo8sm1V3vCWHLauZ9qeVvjC/8st0ZVr9k3FZGGyJnM47Gph/RBgOIAGWftadPnd7QVpIQ9jeN+Vn372hiOA5KrB2EAAKgAKR3A5qf0e4Mi4LL/kG5yQiBYWWEaUHGwma/jcpgKMI+sN+5eu3jubYEj8+az2rG3PlQ4UIcibN60uNVM5ZptSVBRjQxHAfFdnSEAAIg74lsrux8DzuvZm0Z9IoMCNYGV31pAcBk6pZRpu1F95tJ01jYnJMs3TxKS7Gae3u96mBIEkcSni71FE0Mx0HJNYUQQABkjtT2cPP/rkpMC2rcoT4rgoF3jStWAivDMtlsK/ctcTRR+RDTXjuJL9fji15YqBq/mm8704A4kuDzwKbwXm0z+GOK4TgovdIQAgiAbNu2nO/hxJHBksIgP25cF3rlv76+1v/0QeXttmLLn5afH2XWjg63CO1pSz/WRp1NjA+7Af1ZRdZWt6UFbYPYgHBcqB9dtlYx19MBdYYQQABkjVffwy1+qrn3o6fGdWsEEMY/9BbZm/1mjy86hl2hdAgeV1vEJHEkYdgVuL0p7qOI4UAEIAQQAHlj06a7+B6e9zBkAGC7sbDTyI8xvzhE21aIIwkj1jaF/azDfBg8hgMRgBBAAOTcpl8GoaFteqfvoVmham59P1LiAJ2MhaZR3jWbFrEB5bUV3U6aY3BXA5+2Is9V3zqIIYYDEVC2EEAAlIGNcX7e8d8W2wLVMhRVr/RV//Fn3XfUyzHwM5oY9OB0iMEWW35xEGGy8fdOhzASRyIu1sYbwr7PfBjU1Q8RUK4QQACU0p5fBqOhBvpW38Mtx9ffF1amOguSXsG9q6+T+ldvLMoYyjIWmv1paVYDuxJNfnHw3la2BY/fC7UV4kj6cWVR9kHFPSKgTCGAACgPm92Abb6HTQGg21HRq+F65a2+jhQJBnwK2RzY7Es3PT8fTX5xaMVVW9Wr8X2Cx7f1GeJI/Iu1SvUL3N6sp6AxHIiA8oQAAqBMI0q34+XAj2/zPdwMCKY9vZTzmWJHYBu/YCz86N/d90yNmPKLZ04MKWltVpdtPtN2f8iwnhABZQkBBEDZ2OwGTBrGjF55qBwNYDmixwz62PfYbFkvMikDF8aCbX/DzSOB9moRPL4pGqeKOBJRYT/EXgwZw4EIKEcIIADAxpWgaTw03QpmpAXdOqAjjNyOXakbC9u27e8Gtq8o8otDK18cfMeg4HEPopE4kj1CaePvNrviQcQ9IqAMIYAAAGvfQ706ZVY+jh0NXAiucrBxr/iSwftvniRq60IXPL94rpjUx8FEq4PgcZdjEW1lt7A/d9UvQ8VwIALyFwIIAHC52nC+MTnNKVLngitHbNwKcmhjtgHBm+0reH5x2upWVkPcdjy3FeJI/GAVuO1hfh4UG/AT9dhfCPz9H/95HkgRAJCgcbqoB3VtVI0HfFyvkFWOBqwS+JjIOOEVS/eTpQOjKvT7Tzb6jeah/n3Ix9Ji/pIuuhWb9jqzbCvVljHjvP697Yr8oWVbmdIs9hrdejX+KeDzaHF/2XeHERGQrxBAAMCu1YahE916MmGle7/gmrkw9My2s3YnmSe681KFMqoiNRZsDU1XBsMNWb228tpS+LtuK6EzFT3HkbDru1fYV5ZjnQv0PHHd5wO4A1kIgYiNIAQA7DRO1XBXgr+MMwyITriYOI+NcVAlWgY26UEfU678LSeJxoJ1fvGMGWp0r2x891uCx2OB2IA0yqP3c7ETYCkEItwRQABAF/RuwK3F528ows79cWz5He/Nz2WiZTD0/RepuwKpH1d2p/X1u+d79PnclC76gyE+VATYluVm8LheQPjkwUgcIkrXO0dL2siPgdvK/WLFu4Hj5nMMR5/zRxABeQkBBAD0mbCu1DBf0TmTQWf+dGCUHDf6d2oTZmVhVCUdc9JykuiZh/v8ooatID/nF7fMPJMbNivxtu11cxX3zPU4W9e3tg2GLv4QR7K9nm76HvrXoZ70mPnZop46Pw/uQI6EgAq/ooIAgO5t9sWVZ+jkT0BwD8Fk+fmLjTpLjfHAzy1dT6wB2Fyh9+XaxOFh7ng38HNWmWFaDgdbeng/3ac4PMxO2E8av7KZR3fNz2JngSAC8hACCAAYwhCXniUrh70Gcz2Zv7IIqjt1JCZCcSrYNmMyFg63GAt3vtqYCpBfPEMDz8Yn37a9nku0f9uzYhRxJD+cC+BxcUbkLBBEQPpCAAEAQyeE5QDj8pGSEzNKrtW31cFVgs+vn3084KPzDHYBNk9a9R1IL55fPEM28753FgCWuwC6jzRd5nyfv0JbcSPslU97T+osEERA2kIAAQDSEwIn4cpNOM1VpxRPzR1iMOix7Cyzuns2FD0L+qnCzSNEe9XB69eO7+u7rWjDcuhu7nMcSaHtY9up30vP9/Tu6ocISFcIIABAerVhSlpQMR42JpxlSg/fcuhRFy4zCDrfXFGeCb2TjcFwUbjo1m21khasW3bLVkK7YMSR9OfUYRl2xbu4RwSkKQQQAOCSritPBATLGCQX6kff29QM4yEZSKYZuAFppAKCN7HZpTsvuL8dqmG7AJcOUthuSyHr3z6xjyMZFdZGNkWiSPpiBzEcE0RAfkIAAVAurz1976zDasM8g5ztqUw2ty39PqV36OsyMPWRPjMCY2ElFUhvazCYZy+RW9V/F+DMVrC27JZJxlyxGxC/sPdeT4iAtIQAAqBsKi9ttJvxQECwjAH5sKOOUniHkeq/C5CLANi2ojwXfgybfnpVaJ/rK37OHO1YbfaTlfBCS5fFnzYmpWSVMjuzVah+PTCBx182wz5xjwhIRwggACDUasMqEzcNFxPC2NP3XrcJAJVIelAjAJ5UvwwrNzkIAMM2Y0E0oNu4eSwtDIaLgvryZEef2zoO1teJi7HQjCPHW+Z4ybZim+P+toA2stVVLMCuuJW43xUbgAhIQwggADA+dSduGqBOfTL3ZIy4d/wuNoa0CyPc5jsq12VRX5/V7lXYIf1+aPv4xaJO+wiAtUF17aG7DK3fdxb1qNtFLC4S3gwGj+JxKKOB97zoKQBe5mB3rl23GbSVY0+LIuL9d1d/UMPSxroWbDbCs1I7Av8RAfELAQQAqC2d2IcPb5uxP3V8HxtD+m8O7m8TW3HuwkjSafbq68kYzvsMmS89v/vQYuIa93k/bfzW10NPAaDb0xsfvvKWLgo29fqh5fOvA4wVc8sykHYLsqmz9wNE91MPI1zPu3q36q2r1d/6/rctfb6SbigOziO4zaT/bh2j24znQK5QNnV13vbMiIC4hQACANYrZdtWGW9dZmlocSXwkQv51OKzVjnNLU8FVWbyfupb7sb40M/+UF9/GKNx3PHjfcvfxqXj0LzfeI/hr99Fv8NX1d2neq5eVlPPPMY42Ajj0ZCVTSOC2trDcYAc/Lb3uxDOBW+zg6L71YddRpnuq3rl3+y4PfXod3qefutyt8os3LT1z8qXu+Ge8VBZ9pnblPvvjjn3wdNzhujXh2bO+YFXmFiBDLt//OdhT0NCAMDazeLDjgFg7VYxd3S/ycbgd+Ty9EpjMNkOoOut+VXPex+qbivvXVmp/X68IwdGWec6GODn3Pf9xgO+Q6/43/v2o3X07itT3osO96vM/cYd2uuJ1PkHZqV77KAcTjyfXOtqPGiK5eWG4TMa8B2Prhc/Gr7lFzGUe+O5rpWbnR+dLvUupf674zkuVDc3IOt37mkHPDn4qql57hUiIG4hgAAo2/CvzCR+2mMy14bWR+XgyHmzUq0HQJ0L+a2jVZWRGVgrhwaqHtA+7ntfM4Dq61xF4N85gJ93CR7TXkamvcRwmqd+1rlpjzOfmY0a736u3MSLNCdL/fzzzec3q+TvBxivuo9+MWWjHIvrcaMcKoflMDNG8dxVPTbGg3PlOLbJQjzMzVgyc9w+1/1y0nPsWZj2t1iLcQ/lf+q4z+hnvTdtZRlr/93xHMcD+s+y0a+XZv5dOqqnddkMGWu6CF09Ni8QAfEJAQRAucb//xx/5aBV/Mbq0KBUeA5Xl4awft9xLu2iroNXWwy+p4gecW30fzGT7txjHwn97nPHbWtoHw1RDrbjSSwsN9rrwlNbdf3eN0NdkzzMLYOeNXT/3RxLPT2TblNHA+vpScnOXfOfML0CT/C//XpWCwFlhAACoGxuHH/f0BWJteE/dFVsHrAM1+/8KZM2sWz53U3gZ1o/10L4DIMY3v1TBH00RDksExwPlPq2mq6k3Gw8vbfN90m3lXmk/VfimZYWn30UnruWCuKgFgIX9XVISQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEDM/L8AAwAmgU8odpeQfAAAAABJRU5ErkJggg==" 
    
    doc.addImage(logoBase64, 'PNG', 15, 15, 62, 20) // X: 15, Y: 15, Width: 15, Height: 15
    
    doc.setTextColor(textDark)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    
    doc.setTextColor(textLight)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)

    // Garis Bawah Header (Kiri Tipis, Kanan Tebal seperti gambar referensi)
    doc.setDrawColor(200, 200, 200) // Abu-abu muda
    doc.setLineWidth(0.5)
    doc.line(15, 40, pageWidth - 15, 40)
    
    doc.setDrawColor(accentColor) // Warna aksen biru
    doc.setLineWidth(1.5)
    doc.line(pageWidth / 2, 40, pageWidth - 15, 40) // Setengah kanan lebih tebal

    // --- 2. INFORMASI PENERIMA & TANGGAL ---
    const today = new Date(warn.issued_at || new Date())
    const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const recipientName = warn.employee?.name || warn.recipient?.name || employeeName.value
    
    // Tanggal (Kanan)
    doc.setTextColor(textLight)
    doc.setFontSize(10)
    doc.text(dateStr, pageWidth - 15, 55, { align: 'right' })
    doc.text('Badung, Bali - Indonesia', pageWidth - 15, 60, { align: 'right' })

    // Penerima (Kiri)
    doc.setTextColor(textDark)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(recipientName, 15, 55)
    
    doc.setTextColor(textLight)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Karyawan PT. Cakra Media Data', 15, 60)

    // --- 3. JUDUL / PERIHAL SURAT ---
    const letterNumber = `0${warn.id}/HRD-CMD/SP-${warn.level.replace('SP', '')}/${today.getMonth() + 1}/${today.getFullYear()}`
    
    doc.setTextColor(textDark)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`Perihal: Surat Peringatan ${warn.level.replace('SP', '')} (${warn.level})`, 15, 80)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(textLight)
    doc.text(`No. Ref: ${letterNumber}`, 15, 85)

    // --- 4. ISI SURAT ---
    let currentY = 100
    doc.setTextColor(textDark)
    doc.setFontSize(10)
    doc.text('Dengan hormat,', 15, currentY)
    
    currentY += 8
    const p1 = `Melalui surat ini, Manajemen PT Cakra Media Data memberikan ${warn.level} kepada Saudara/i atas evaluasi kinerja dan kedisiplinan. Perusahaan selalu mengedepankan profesionalisme dan kami berharap setiap karyawan dapat berkontribusi positif.`
    const splitP1 = doc.splitTextToSize(p1, pageWidth - 30)
    doc.text(splitP1, 15, currentY)

    // Poin Pelanggaran (Bold)
    currentY += (splitP1.length * 5) + 5
    doc.setFont('helvetica', 'bold')
    const splitP2 = doc.splitTextToSize(`Pelanggaran: ${warn.reason}`, pageWidth - 30)
    doc.text(splitP2, 15, currentY)
    
    // Deskripsi Tambahan
    currentY += (splitP2.length * 5) + 3
    doc.setFont('helvetica', 'normal')
    const splitP3 = doc.splitTextToSize(`Catatan: ${warn.description || 'Tidak ada catatan tambahan terkait pelanggaran ini.'}`, pageWidth - 30)
    doc.text(splitP3, 15, currentY)

    currentY += (splitP3.length * 5) + 5
    const p4 = `Kami sangat antusias dengan potensi Saudara/i dan berharap Anda dapat segera memperbaiki kinerja. Apabila di kemudian hari masih terjadi pelanggaran atau tidak ada peningkatan performa, perusahaan akan mengambil tindakan tegas sesuai dengan peraturan perusahaan yang berlaku.`
    const splitP4 = doc.splitTextToSize(p4, pageWidth - 30)
    doc.text(splitP4, 15, currentY)

    // --- 5. TANDA TANGAN (Model Kiri seperti referensi) ---
    currentY += (splitP4.length * 5) + 15
    doc.text('Hormat kami,', 15, currentY)
        
    doc.setFont('helvetica', 'bold')
    doc.text(warn.issuer?.name || 'HRD Management', 15, currentY + 25)

    // Tanda Tangan Pegawai (Di Kanan untuk menjaga standar SP perusahaan)
    doc.setFont('helvetica', 'normal')
    doc.text('Mengetahui / Menerima,', pageWidth - 60, currentY)
    doc.setFont('helvetica', 'bold')
    doc.text(employeeName.value, pageWidth - 60, currentY + 25)

    // --- 6. FOOTER MODERN ---
    const footerY = pageHeight - 25
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(15, footerY, pageWidth - 15, footerY)
    
    doc.setDrawColor(accentColor)
    doc.setLineWidth(1.5)
    doc.line(pageWidth / 2, footerY, pageWidth - 15, footerY)

    doc.setTextColor(textLight)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    // Menambahkan icon web sederhana menggunakan karakter standar
    doc.text('www.cakramediadata.com', pageWidth - 15, footerY + 8, { align: 'right' })

    // --- SAVE FILE ---
    doc.save(`Surat_${warn.level}_${recipientName.replace(/\s+/g, '_')}.pdf`)
    
  } catch (error) {
    console.error("Gagal cetak PDF:", error)
    alert("Gagal mengunduh PDF.")
  }
}
</script>
