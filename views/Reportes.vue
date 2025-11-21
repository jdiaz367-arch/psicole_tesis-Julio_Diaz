<template>
  <div class="reportes-container">
    <h2>Crear Reporte</h2>
    <form @submit.prevent="guardarReporte" class="formulario">
      <div class="form-group">
        <label for="titulo">Título del reporte:</label>
        <input type="text" id="titulo" v-model="titulo" required />
      </div>

      <div class="form-group">
        <label for="contenido">Contenido:</label>
        <textarea id="contenido" v-model="contenido" rows="8" placeholder="Escribe el reporte aquí..." required></textarea>
      </div>

      <div class="form-group">
        <label for="archivo">Adjuntar archivos:</label>
        <input type="file" id="archivo" @change="onFileChange" multiple />
      </div>

      <button type="submit">Guardar Reporte</button>
    </form>

    <div v-if="archivos.length" class="archivos-lista">
      <h4>Archivos seleccionados:</h4>
      <ul>
        <li v-for="(file, idx) in archivos" :key="idx">{{ file.name }}</li>
      </ul>
    </div>

    <!-- Acceso rápido: Detalle de Alumno -->
    <div class="acceso-rapido">
      <h4>Acceso rápido al alumno</h4>
      <div class="acceso-form">
        <input type="number" min="1" v-model.number="alumnoIdInput" placeholder="ID de alumno" />
        <button class="btn-link" :disabled="!alumnoIdInput" @click="irADetalleAlumno">Ver detalle</button>
      </div>
    </div>

    <div class="acceso-rapido">
      <h4>Evaluación del alumno</h4>
      <div class="acceso-form">
        <select v-model="alumnoId" @change="cargarEvaluacion">
          <option value="">Seleccionar alumno</option>
          <option v-for="a in alumnos" :key="a.id" :value="a.id">{{ a.apellido }} {{ a.nombre }} (ID: {{ a.id }})</option>
        </select>
        <button class="btn-link" :disabled="!alumnoId || loadingEval" @click="cargarEvaluacion">Cargar</button>
      </div>
      <div v-if="alumnoId" class="evaluacion">
        <div class="bloque">
          <div class="bloque-titulo">Planificaciones del alumno</div>
          <ul class="lista" v-if="todasPlanif.length">
            <li v-for="p in todasPlanif" :key="p.key">
              <a :href="p.url" target="_blank" rel="noopener">{{ p.filename }}</a>
              <span class="archivo-info">{{ formatSize(p.size) }} • {{ formatDate(p.modifiedAt) }} • {{ p.materiaNombre || ('Materia ID: ' + p.materiaId) }}</span>
            </li>
          </ul>
          <div v-else class="hint">Sin planificaciones</div>
        </div>
        <div v-if="materiasAsignadas.length === 0" class="hint">El alumno no tiene materias asignadas.</div>
        <div v-else class="materias-grid">
          <div class="materia-card" v-for="m in materiasAsignadas" :key="m.id">
            <div class="materia-header">
              <div class="materia-nombre">{{ m.nombre }}</div>
              <div class="materia-prof" v-if="m.descripcion">{{ m.descripcion }}</div>
            </div>
            <div class="bloque">
              <div class="bloque-titulo">Notas</div>
              <div class="bloque-resumen">
                <span>Promedio: {{ resumenPromedio(m.id) }}</span>
                <span>Cantidad: {{ (agregados[m.id]?.notas || []).length }}</span>
              </div>
              <ul class="lista" v-if="(agregados[m.id]?.notas || []).length">
                <li v-for="n in agregados[m.id].notas" :key="n.id">
                  <span class="nota-valor">{{ n.nota }}</span>
                  <span class="nota-desc">{{ n.descripcion || '—' }}</span>
                </li>
              </ul>
              <div v-else class="hint">Sin notas</div>
            </div>
            <div class="bloque">
              <div class="bloque-titulo">Planificaciones (PDF)</div>
              <ul class="lista" v-if="(agregados[m.id]?.planificaciones || []).length">
                <li v-for="p in agregados[m.id].planificaciones" :key="p.filename">
                  <a :href="p.url" target="_blank" rel="noopener">{{ p.filename }}</a>
                  <span class="archivo-info">{{ formatSize(p.size) }} • {{ formatDate(p.modifiedAt) }}</span>
                </li>
              </ul>
              <div v-else class="hint">Sin planificaciones</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const titulo = ref('')
const contenido = ref('')
const archivos = ref([])
const alumnoIdInput = ref(null)
const router = useRouter()
const alumnos = ref([])
const alumnoId = ref('')
const materiasAsignadas = ref([])
const agregados = ref({})
const loadingEval = ref(false)
const token = localStorage.getItem('token') || ''
const headers = token ? { Authorization: `Bearer ${token}` } : {}

const onFileChange = (e) => {
  archivos.value = Array.from(e.target.files)
}

const guardarReporte = () => {
  // Aquí puedes enviar los datos al backend usando FormData si lo necesitas
  console.log('Título:', titulo.value)
  console.log('Contenido:', contenido.value)
  console.log('Archivos:', archivos.value)
  alert('Reporte guardado (simulado)')
  // Limpiar formulario
  titulo.value = ''
  contenido.value = ''
  archivos.value = []
}

const irADetalleAlumno = () => {
  if (!alumnoIdInput.value) return
  router.push(`/menu/alumno/${alumnoIdInput.value}`)
}

const cargarAlumnos = async () => {
  try {
    const { data } = await axios.get('/api/alumnos', { headers })
    alumnos.value = Array.isArray(data) ? data : (data || [])
  } catch (e) {}
}

const cargarEvaluacion = async () => {
  if (!alumnoId.value) return
  loadingEval.value = true
  materiasAsignadas.value = []
  agregados.value = {}
  try {
    // 1) Materias asignadas explícitas
    const { data } = await axios.get(`/api/alumnos/${alumnoId.value}/materias/asignadas`, { headers })
    materiasAsignadas.value = Array.isArray(data) ? data : (data || [])
    // 2) Fallback: materias del curso del alumno
    if (!materiasAsignadas.value.length) {
      try {
        const cursoRes = await axios.get(`/api/alumnos/${alumnoId.value}/materias`, { headers })
        const cursoArr = Array.isArray(cursoRes.data) ? cursoRes.data : (cursoRes.data || [])
        if (cursoArr.length) materiasAsignadas.value = cursoArr
      } catch {}
    }
    // 3) Fallback adicional: materias disponibles
    if (!materiasAsignadas.value.length) {
      try {
        const dispRes = await axios.get(`/api/alumnos/${alumnoId.value}/materias/disponibles`, { headers })
        const dispArr = Array.isArray(dispRes.data?.materias) ? dispRes.data.materias : (dispRes.data?.materias || [])
        if (dispArr.length) materiasAsignadas.value = dispArr
      } catch {}
    }
    await Promise.all(materiasAsignadas.value.map(async (m) => {
      try {
        const [notasRes, planifRes] = await Promise.all([
          axios.get(`/api/alumnos/${alumnoId.value}/notas?materiaId=${m.id}`, { headers }),
          axios.get(`/api/alumnos/${alumnoId.value}/materias/${m.id}/planificaciones`, { headers })
        ])
        const notasArr = Array.isArray(notasRes.data) ? notasRes.data : (notasRes.data || [])
        const planifArr = Array.isArray(planifRes.data) ? planifRes.data : (planifRes.data || [])
        agregados.value[m.id] = { notas: notasArr, planificaciones: planifArr, materia: m }
      } catch (e) {
        agregados.value[m.id] = { notas: [], planificaciones: [], materia: m }
      }
    }))
  } catch (e) {
    materiasAsignadas.value = []
  } finally {
    loadingEval.value = false
  }
}

const resumenPromedio = (materiaId) => {
  const arr = (agregados.value[materiaId]?.notas) || []
  if (!arr.length) return '—'
  const sum = arr.reduce((acc, n) => acc + Number(n.nota || 0), 0)
  return (sum / arr.length).toFixed(2)
}

const formatDate = (d) => new Date(d).toLocaleString()
const formatSize = (s) => `${(s / 1024 / 1024).toFixed(2)} MB`

// Planificaciones agregadas a nivel alumno
const todasPlanif = computed(() => {
  const out = []
  const data = agregados.value || {}
  for (const mid of Object.keys(data)) {
    const entry = data[mid]
    const arr = Array.isArray(entry?.planificaciones) ? entry.planificaciones : []
    const mat = entry?.materia || {}
    for (const p of arr) {
      out.push({
        ...p,
        materiaId: Number(mid),
        materiaNombre: mat?.nombre || undefined,
        key: `${mid}-${p.filename}`
      })
    }
  }
  return out.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))
})

onMounted(() => { cargarAlumnos() })
</script>

<style scoped>
.reportes-container {
  max-width: 100%;
  max-height: 100%;
  margin: 40px auto;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 10px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 4px;
  display: block;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
}

input[type="file"] {
  margin-top: 6px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0056b3;
}

.archivos-lista {
  margin-top: 20px;
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 0 6px #ccc;
}

.acceso-rapido {
  margin-top: 20px;
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 0 6px #ccc;
}
.acceso-form {
  display: flex;
  gap: 8px;
  align-items: center;
}
.btn-link {
  background-color: #0ea5e9;
  color: white;
}
.evaluacion { margin-top: 12px }
.materias-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px }
.materia-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px }
.materia-header { display: flex; flex-direction: column; margin-bottom: 8px }
.materia-nombre { font-weight: 600; color: #111827 }
.materia-prof { color: #374151; font-size: 0.9rem }
.bloque { margin-top: 8px }
.bloque-titulo { font-weight: 600; margin-bottom: 4px; color: #111827 }
.bloque-resumen { display: flex; gap: 12px; color: #6b7280; font-size: 0.9rem; margin-bottom: 6px }
.lista { list-style: none; padding: 0; margin: 0; display: grid; gap: 4px }
.nota-valor { font-weight: 600; margin-right: 6px }
.nota-desc { color: #374151 }
.archivo-info { color: #6b7280; margin-left: 8px }
.hint { color: #6b7280; font-style: italic }
</style>
