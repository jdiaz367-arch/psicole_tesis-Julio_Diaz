<template>
  <div class="simple-container">
    <h2 class="title">Materias, Notas y Planificaciones (Vista Simple)</h2>

    <!-- Selección de alumno -->
    <section class="card">
      <div class="row">
        <label>Alumno:</label>
        <select v-model="alumnoId" @change="onAlumnoChange">
          <option disabled value="">Seleccionar alumno</option>
          <option v-for="a in alumnos" :key="a.id" :value="a.id">
            {{ a.apellido }} {{ a.nombre }} (ID: {{ a.id }})
          </option>
        </select>
      </div>
      <div class="row" v-if="alumnoId">
        <label>Materia:</label>
        <select v-model="materiaId" @change="onMateriaChange">
          <option disabled value="">Seleccionar materia</option>
          <option v-for="m in materiasAsignadas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
        </select>
        <button class="btn" v-if="materiasAsignadas.length === 0 && materiasDisponibles.length" @click="asignarPrimeraMateria">Asignar primera disponible</button>
      </div>
    </section>

    <!-- Bloque de notas -->
    <section v-if="alumnoId && materiaId" class="card">
      <h3>Notas</h3>
      <div class="row">
        <input v-model.number="nuevaNota.nota" type="number" step="0.01" min="0" max="10" placeholder="Nota (0-10)" />
        <input v-model="nuevaNota.descripcion" type="text" placeholder="Descripción (ej: N, R1)" />
        <button class="btn" @click="agregarNota">Agregar</button>
      </div>
      <div class="row">
        <label>Ingreso rápido (tipo Excel):</label>
        <button class="btn" @click="agregarColumna">Añadir columna</button>
        <button class="btn" :disabled="gridNotas.length===0" @click="guardarGrid">Guardar todo</button>
      </div>
      <table class="table" v-if="gridNotas.length">
        <thead>
          <tr>
            <th v-for="(col, idx) in gridNotas" :key="idx">Nota {{ idx+1 }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="(col, idx) in gridNotas" :key="idx">
              <input type="number" min="0" max="10" step="0.01" v-model.number="gridNotas[idx]" />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td :colspan="gridNotas.length || 1"><strong>Promedio:</strong> {{ promedioGrid }}</td>
          </tr>
        </tfoot>
      </table>

      <table class="table" v-if="notas.length">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Nota</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in notas" :key="n.id">
            <td>{{ n.descripcion || '—' }}</td>
            <td>{{ n.nota }}</td>
            <td>{{ formatDate(n.fecha) }}</td>
            <td>
              <button class="link" @click="eliminarNota(n.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="hint">No hay notas para esta materia.</p>
    </section>

    <!-- Bloque de planificaciones PDF -->
    <section v-if="alumnoId && materiaId" class="card">
      <h3>Planificaciones (PDF)</h3>
      <div class="row">
        <input type="file" accept="application/pdf" @change="onFileSelect" />
        <button class="btn" :disabled="!fileToUpload" @click="subirPlanificacion">Subir PDF</button>
      </div>

      <table class="table" v-if="planificaciones.length">
        <thead>
          <tr>
            <th>Archivo</th>
            <th>Tamaño</th>
            <th>Modificado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in planificaciones" :key="p.filename">
            <td><a :href="p.url" target="_blank" rel="noopener">{{ p.filename }}</a></td>
            <td>{{ formatSize(p.size) }}</td>
            <td>{{ formatDate(p.modifiedAt) }}</td>
            <td>
              <button class="link" @click="eliminarPlanificacion(p.filename)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="hint">No hay planificaciones cargadas.</p>
    </section>

    <!-- Mensajes -->
    <p v-if="mensaje" :class="mensajeTipo">{{ mensaje }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const alumnos = ref([])
const alumnoId = ref('')
const materiasAsignadas = ref([])
const materiasDisponibles = ref([])
const materiaId = ref('')

const notas = ref([])
const nuevaNota = ref({ nota: null, descripcion: '' })
const gridNotas = ref([])
const promedioGrid = ref('0.00')

const planificaciones = ref([])
const fileToUpload = ref(null)

const mensaje = ref('')
const mensajeTipo = ref('msg-ok')

const token = localStorage.getItem('token') || ''
const headers = token ? { Authorization: `Bearer ${token}` } : {}

const showOk = (text) => { mensaje.value = text; mensajeTipo.value = 'msg-ok'; setTimeout(() => mensaje.value = '', 2500) }
const showErr = (text) => { mensaje.value = text; mensajeTipo.value = 'msg-err'; setTimeout(() => mensaje.value = '', 3500) }

const formatDate = (d) => new Date(d).toLocaleString()
const formatSize = (s) => `${(s / 1024 / 1024).toFixed(2)} MB`

const cargarAlumnos = async () => {
  try {
    const { data } = await axios.get('/api/alumnos', { headers })
    alumnos.value = data
  } catch (e) { showErr('Error cargando alumnos') }
}

const onAlumnoChange = async () => {
  materiaId.value = ''
  notas.value = []
  planificaciones.value = []
  await cargarMaterias()
}

const cargarMaterias = async () => {
  try {
    const [asig, disp] = await Promise.all([
      axios.get(`/api/alumnos/${alumnoId.value}/materias/asignadas`, { headers }),
      axios.get(`/api/alumnos/${alumnoId.value}/materias/disponibles`, { headers })
    ])
    materiasAsignadas.value = Array.isArray(asig.data) ? asig.data : (asig.data || [])
    materiasDisponibles.value = Array.isArray(disp.data) ? disp.data : (disp.data?.materias || [])
  } catch (e) { showErr('Error cargando materias') }
}

const asignarPrimeraMateria = async () => {
  try {
    const first = materiasDisponibles.value[0]
    if (!first) return
    await axios.post(`/api/alumnos/${alumnoId.value}/materias`, { materia_id: first.id }, { headers })
    showOk(`Materia "${first.nombre}" asignada`)
    await cargarMaterias()
  } catch (e) { showErr('No se pudo asignar la materia') }
}

const onMateriaChange = async () => {
  await cargarNotas()
  await cargarPlanificaciones()
}

const cargarNotas = async () => {
  try {
    const { data } = await axios.get(`/api/alumnos/${alumnoId.value}/notas`, { params: { materiaId: materiaId.value }, headers })
    notas.value = data
  } catch (e) { showErr('Error cargando notas') }
}

const agregarNota = async () => {
  try {
    if (nuevaNota.value.nota === null || nuevaNota.value.nota === '' || Number.isNaN(Number(nuevaNota.value.nota))) return showErr('Nota requerida')
    await axios.post(`/api/alumnos/${alumnoId.value}/notas`, {
      materia_id: materiaId.value,
      nota: Number(nuevaNota.value.nota),
      descripcion: nuevaNota.value.descripcion || null
    }, { headers })
    nuevaNota.value = { nota: null, descripcion: '' }
    await cargarNotas()
    showOk('Nota agregada')
  } catch (e) { showErr('No se pudo agregar la nota') }
}
const agregarColumna = () => {
  gridNotas.value.push(null)
  recomputarPromedio()
}

const recomputarPromedio = () => {
  const vals = gridNotas.value.map(v => Number(v)).filter(v => !Number.isNaN(v))
  if (!vals.length) { promedioGrid.value = '0.00'; return }
  const sum = vals.reduce((a,b)=>a+b,0)
  promedioGrid.value = (sum / vals.length).toFixed(2)
}

const guardarGrid = async () => {
  try {
    const vals = gridNotas.value.map(v => Number(v)).filter(v => !Number.isNaN(v))
    for (const v of vals) {
      await axios.post(`/api/alumnos/${alumnoId.value}/notas`, {
        materia_id: materiaId.value,
        nota: v,
        descripcion: null
      }, { headers })
    }
    await cargarNotas()
    showOk('Notas guardadas')
  } catch (e) { showErr('No se pudo guardar el lote de notas') }
}

watch(gridNotas, recomputarPromedio, { deep: true })

const eliminarNota = async (id) => {
  try {
    await axios.delete(`/api/alumnos/${alumnoId.value}/notas/${id}`, { headers })
    await cargarNotas()
    showOk('Nota eliminada')
  } catch (e) { showErr('No se pudo eliminar la nota') }
}

const onFileSelect = (ev) => {
  const file = ev.target.files?.[0]
  fileToUpload.value = file || null
}

const cargarPlanificaciones = async () => {
  try {
    const { data } = await axios.get(`/api/alumnos/${alumnoId.value}/materias/${materiaId.value}/planificaciones`, { headers })
    planificaciones.value = data
  } catch (e) { showErr('Error cargando planificaciones') }
}

const subirPlanificacion = async () => {
  try {
    if (!fileToUpload.value) return showErr('Seleccione un PDF')
    const fd = new FormData()
    fd.append('file', fileToUpload.value)
    await axios.post(`/api/alumnos/${alumnoId.value}/materias/${materiaId.value}/planificaciones`, fd, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    })
    fileToUpload.value = null
    await cargarPlanificaciones()
    showOk('PDF subido')
  } catch (e) {
    const msg = e?.response?.data?.error || 'No se pudo subir el PDF'
    showErr(msg)
  }
}

const eliminarPlanificacion = async (filename) => {
  try {
    await axios.delete(`/api/alumnos/${alumnoId.value}/materias/${materiaId.value}/planificaciones/${encodeURIComponent(filename)}`, { headers })
    await cargarPlanificaciones()
    showOk('PDF eliminado')
  } catch (e) { showErr('No se pudo eliminar el PDF') }
}

onMounted(() => { cargarAlumnos() })
</script>

<style scoped>
.simple-container { max-width: 980px; margin: 24px auto; padding: 12px }
.title { margin-bottom: 16px }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px }
.row { display: flex; gap: 12px; align-items: center; margin-bottom: 12px }
.row > label { min-width: 70px; font-weight: 600 }
.row > select, .row > input { flex: 1; padding: 8px }
.btn { padding: 8px 12px; background: #2563eb; color: #fff; border: 0; border-radius: 6px; cursor: pointer }
.btn:disabled { background: #9ca3af; cursor: not-allowed }
.table { width: 100%; border-collapse: collapse }
.table th, .table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left }
.link { background: transparent; border: 0; color: #2563eb; cursor: pointer }
.hint { color: #6b7280 }
.msg-ok { color: #065f46; background: #ecfdf5; border: 1px solid #10b981; padding: 8px; border-radius: 6px }
.msg-err { color: #7f1d1d; background: #fef2f2; border: 1px solid #ef4444; padding: 8px; border-radius: 6px }
</style>
