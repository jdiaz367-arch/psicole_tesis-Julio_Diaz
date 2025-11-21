<template>
  <div class="boletin-container">
    <div class="toolbar">
      <button class="btn" @click="exportarPDF">Exportar PDF</button>
      <button class="btn-secondary" @click="volver">Volver</button>
    </div>
    <div class="card">
      <h1>Boletín Académico</h1>
      <div>Alumno: <strong>{{ alumno?.nombre || '-' }}</strong></div>
      <div>Materia: <strong>{{ materia?.nombre || '-' }}</strong></div>
    </div>
    <div class="grid">
      <div class="card">
        <h3>Notas institucionales</h3>
        <ul>
          <li>N: <strong>{{ inst.N ?? '-' }}</strong></li>
          <li>R1: <strong>{{ inst.R1 ?? '-' }}</strong></li>
          <li>R2: <strong>{{ inst.R2 ?? '-' }}</strong></li>
          <li>EVAL1: <strong>{{ inst.EVAL1 ?? '-' }}</strong></li>
        </ul>
      </div>
      <div class="card">
        <h3>Notas adicionales</h3>
        <ul>
          <li v-for="n in extras" :key="n.id">{{ n.descripcion || 'Nota' }}: <strong>{{ n.nota }}</strong></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const alumnoId = Number(route.query.alumnoId || 0)
const materiaId = Number(route.query.materiaId || 0)

const alumno = ref(null)
const materia = ref(null)
const inst = ref({ N:null,R1:null,R2:null,EVAL1:null })
const extras = ref([])

const cargar = async () => {
  const token = localStorage.getItem('token')
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
  const aRes = await fetch(`/api/alumnos/${alumnoId}`, { headers })
  alumno.value = aRes.ok ? await aRes.json() : null
  const mRes = await fetch(`/api/alumnos/${alumnoId}/materias/${materiaId}`, { headers })
  materia.value = mRes.ok ? (await mRes.json())?.materia : null
  const nRes = await fetch(`/api/alumnos/${alumnoId}/materias/${materiaId}/notas`, { headers })
  if (nRes.ok) {
    const data = await nRes.json()
    const list = Array.isArray(data.notas) ? data.notas : []
    const i = { N:null,R1:null,R2:null,EVAL1:null }
    const e = []
    for (const n of list) {
      const d = String(n.descripcion || '').toUpperCase()
      if (d === 'N') i.N = Number(n.nota)
      else if (d === 'R1') i.R1 = Number(n.nota)
      else if (d === 'R2') i.R2 = Number(n.nota)
      else if (d === 'EVAL 1' || d === 'EVAL1') i.EVAL1 = Number(n.nota)
      else e.push({ id:n.id, nota:Number(n.nota), descripcion:n.descripcion })
    }
    inst.value = i
    extras.value = e
  }
}

const exportarPDF = () => { window.print() }
const volver = () => { router.back() }

onMounted(cargar)
</script>

<style scoped>
.boletin-container{max-width:900px;margin:24px auto;padding:16px;color:#111}
.toolbar{display:flex;gap:8px;margin-bottom:12px}
.btn{padding:8px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer}
.btn-secondary{padding:8px 12px;background:#6c757d;color:#fff;border:none;border-radius:6px;cursor:pointer}
.card{border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:12px;background:#fff}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media print{.toolbar{display:none}}
</style>
