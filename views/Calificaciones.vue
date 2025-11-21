<template>
  <div class="calificaciones-container">
    <h2>Gestión de Calificaciones</h2>

    <!-- Encabezado estilo solicitado: Alumno + botón Cargar Nota -->
    <div class="notas-header">
      <div class="left-info" v-if="false">
        <span v-if="nuevaCalificacion.asignaturaId" class="chip">Asignatura: {{ getAsignaturaNombre(nuevaCalificacion.asignaturaId) }}</span>
        <span v-else class="chip muted">Seleccione asignatura</span>
      </div>
      <div class="alumno-pill" v-if="false">
        Alumno: <strong v-if="alumnoSeleccionado">{{ alumnoSeleccionado.nombre }} {{ alumnoSeleccionado.apellido }}</strong>
        <span v-else class="muted">Seleccione alumno</span>
      </div>
      <button type="button" class="btn-secondary btn-large" :disabled="!nuevaCalificacion.alumnoId || !nuevaCalificacion.asignaturaId" @click="imprimirLibreta">Imprimir Libreta</button>
    </div>
    
    <!-- Formulario para crear calificación -->
    <div class="form-section">
      <h3>Registrar Nueva Calificación</h3>
      <form @submit.prevent="guardarCalificacion" class="formulario">
        <div class="form-row">
          <div class="form-group" v-if="!nuevaCalificacion.alumnoId">
            <label for="alumno">Alumno:</label>
            <select v-model="nuevaCalificacion.alumnoId" id="alumno" required>
              <option value="">Seleccione alumno</option>
              <option v-for="alumno in alumnos" :key="alumno.id" :value="alumno.id">
                {{ alumno.nombre }} {{ alumno.apellido }}
              </option>
            </select>
          </div>
          <div class="form-group" v-if="!nuevaCalificacion.asignaturaId">
            <label for="asignatura">Asignatura:</label>
            <select v-model="nuevaCalificacion.asignaturaId" id="asignatura" required>
              <option value="">Seleccione asignatura</option>
              <option v-for="asignatura in asignaturas" :key="asignatura.id" :value="asignatura.id">
                {{ asignatura.nombre }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          
          <div class="form-group">
            <label for="nota">Nota:</label>
            <input v-model="nuevaCalificacion.nota" type="number" min="1" max="10" step="0.1" id="nota" required />
          </div>
        </div>
        
        <div class="form-group">
          <label for="observacion">Observación:</label>
          <textarea v-model="nuevaCalificacion.observacion" id="observacion" placeholder="Observaciones sobre la calificación" rows="3"></textarea>
        </div>
        <div class="acciones-estructurada">
          <button class="btn-orange btn-large" :disabled="!nuevaCalificacion.alumnoId || !nuevaCalificacion.asignaturaId || !nuevaCalificacion.nota" @click="guardarCalificacion">Guardar nota</button>
        </div>
      </form>
    </div>

    <div class="list-section">
      <h3>Notas de esta materia</h3>
      <div v-if="loading" class="loading">Cargando calificaciones...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="calificaciones.length === 0" class="no-calificaciones">No hay calificaciones registradas</div>
      <table v-else class="calificaciones-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nota</th>
            <th>Observación</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="calificacion in calificaciones" :key="calificacion.id">
            <td>{{ calificacion.id }}</td>
            <td>{{ calificacion.nota }}</td>
            <td>{{ calificacion.observacion || '-' }}</td>
            <td>{{ formatDate(calificacion.fecha) }}</td>
            <td>
              <button @click="editarCalificacion(calificacion)" class="btn-edit">Editar</button>
              <button @click="eliminarCalificacion(calificacion.id)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Modal de edición -->
    <div v-if="mostrarModalEdicion" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Editar Calificación</h3>
          <button @click="cerrarModal" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="actualizarCalificacion" class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label for="edit-alumno">Alumno:</label>
              <select v-model="calificacionEditando.alumno_id" id="edit-alumno" required>
                <option v-for="alumno in alumnos" :key="alumno.id" :value="alumno.id">
                  {{ alumno.nombre }} {{ alumno.apellido }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-asignatura">Asignatura:</label>
              <select v-model="calificacionEditando.asignatura_id" id="edit-asignatura" required>
                <option v-for="asignatura in asignaturas" :key="asignatura.id" :value="asignatura.id">
                  {{ asignatura.nombre }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              
            </div>
            <div class="form-group">
              <label for="edit-nota">Nota:</label>
              <input v-model="calificacionEditando.nota" type="number" min="1" max="10" step="0.1" id="edit-nota" required />
            </div>
          </div>
          
          <div class="form-group">
            <label for="edit-observacion">Observación:</label>
            <textarea v-model="calificacionEditando.observacion" id="edit-observacion" rows="3"></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="cerrarModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { 'Authorization': `Bearer ${token}` } }
}

const calificaciones = ref([])
const alumnos = ref([])
const asignaturas = ref([])
const loading = ref(false)
const error = ref('')
const mostrarModalEdicion = ref(false)
const calificacionEditando = ref({})
const router = useRouter()
const route = useRoute()

const nuevaCalificacion = ref({
  alumnoId: '',
  asignaturaId: '',
  periodo: '',
  nota: '',
  observacion: ''
})

// Filtrado por profesor autenticado (si aplica)
const usuarioActual = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } })()
const esProfesor = !!usuarioActual && (usuarioActual.rol === 'profesor' || usuarioActual.tipo_usuario === 'profesor')
const nombreProfesor = usuarioActual ? `${(usuarioActual.nombre || usuarioActual.name || '').trim()} ${(usuarioActual.apellido || '').trim()}`.trim() : ''

const alumnoSeleccionado = computed(() => {
  const id = nuevaCalificacion.value.alumnoId
  return alumnos.value.find(a => a.id === id) || null
})

const obtenerCalificaciones = async () => {
  loading.value = true
  error.value = ''
  try {
    const alumnoId = nuevaCalificacion.value.alumnoId
    const materiaId = nuevaCalificacion.value.asignaturaId
    if (alumnoId && materiaId) {
      const res = await axios.get(`/api/alumnos/${alumnoId}/materias/${materiaId}/notas`, getAuthHeaders())
      const data = res.data
      calificaciones.value = Array.isArray(data.notas) ? data.notas : []
    } else if (alumnoId) {
      const res = await axios.get(`/api/alumnos/${alumnoId}/notas`, getAuthHeaders())
      calificaciones.value = Array.isArray(res.data) ? res.data : []
    } else {
      calificaciones.value = []
    }
  } catch (err) {
    error.value = 'Error al cargar notas: ' + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

const obtenerAlumnos = async () => {
  try {
    const response = await axios.get('/api/alumnos', getAuthHeaders())
    alumnos.value = response.data
  } catch (err) {
    console.error('Error al obtener alumnos:', err)
  }
}

const obtenerAsignaturas = async () => {
  try {
    const alumnoId = nuevaCalificacion.value.alumnoId
    if (alumnoId) {
      const res = await axios.get(`/api/alumnos/${alumnoId}/materias`, getAuthHeaders())
      asignaturas.value = res.data || []
    } else {
      const res = await axios.get('/api/materias', getAuthHeaders())
      asignaturas.value = res.data || []
    }
    if (esProfesor && nombreProfesor) {
      asignaturas.value = (asignaturas.value || []).filter(a => String(a.descripcion || '').includes(nombreProfesor))
    }
  } catch (err) {}
}

const guardarCalificacion = async () => {
  try {
    const alumnoId = nuevaCalificacion.value.alumnoId
    const materiaId = nuevaCalificacion.value.asignaturaId
    if (esProfesor && nombreProfesor) {
      const materiaSel = (asignaturas.value || []).find(m => m.id === materiaId)
      const desc = String(materiaSel?.descripcion || '')
      if (!desc.includes(nombreProfesor)) {
        alert('No puedes cargar notas en una materia que no dictas')
        return
      }
    }
    await axios.post(`/api/alumnos/${alumnoId}/materias/${materiaId}/notas`, {
      nota: nuevaCalificacion.value.nota,
      descripcion: nuevaCalificacion.value.observacion || null
    }, getAuthHeaders())
    nuevaCalificacion.value.nota = ''
    nuevaCalificacion.value.observacion = ''
    await obtenerCalificaciones()
    alert('Nota guardada')
  } catch (err) {
    error.value = 'Error al crear nota: ' + (err.response?.data?.error || err.message)
  }
}

const editarCalificacion = (calificacion) => {
  calificacionEditando.value = { ...calificacion }
  mostrarModalEdicion.value = true
}

const cerrarModal = () => {
  mostrarModalEdicion.value = false
  calificacionEditando.value = {}
}

const actualizarCalificacion = async () => {
  try {
    const alumnoId = calificacionEditando.value.alumno_id
    const materiaId = calificacionEditando.value.materia_id || calificacionEditando.value.asignatura_id
    const id = calificacionEditando.value.id
    await axios.put(`/api/alumnos/${alumnoId}/materias/${materiaId}/notas/${id}`, {
      nota: calificacionEditando.value.nota,
      descripcion: calificacionEditando.value.observacion || calificacionEditando.value.descripcion || null
    }, getAuthHeaders())
    cerrarModal()
    await obtenerCalificaciones()
    alert('Nota actualizada')
  } catch (err) {
    error.value = 'Error al actualizar nota: ' + (err.response?.data?.error || err.message)
  }
}

const eliminarCalificacion = async (id) => {
  if (confirm('¿Seguro que deseas eliminar esta nota?')) {
    try {
      const alumnoId = nuevaCalificacion.value.alumnoId
      const materiaId = nuevaCalificacion.value.asignaturaId
      await axios.delete(`/api/alumnos/${alumnoId}/materias/${materiaId}/notas/${id}`, getAuthHeaders())
      await obtenerCalificaciones()
      alert('Nota eliminada')
    } catch (err) {
      error.value = 'Error al eliminar nota: ' + (err.response?.data?.error || err.message)
    }
  }
}

const getAlumnoNombre = (alumnoId) => {
  const alumno = alumnos.value.find(a => a.id === alumnoId)
  return alumno ? `${alumno.nombre} ${alumno.apellido}` : '-'
}

const getAsignaturaNombre = (asignaturaId) => {
  const asignatura = asignaturas.value.find(a => a.id === asignaturaId)
  return asignatura ? asignatura.nombre : '-'
}

const getMateriaNombre = (cal) => {
  const direct = cal?.materia_nombre
  if (direct) return direct
  const id = cal?.materia_id || cal?.asignatura_id
  const asignatura = asignaturas.value.find(a => a.id === id)
  return asignatura ? asignatura.nombre : '-'
}

const formatDate = (value) => {
  if (!value) return '-'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('es-AR')
  } catch {
    return '-'
  }
}

const verDetalleAlumno = (alumnoId) => {
  if (!alumnoId) return
  router.push(`/menu/alumno/${alumnoId}`)
}

onMounted(async () => {
  await obtenerAlumnos()
  await obtenerAsignaturas()
  const alumnoIdParam = route.query.alumnoId || route.params.id
  if (alumnoIdParam != null) {
    const parsed = Number(alumnoIdParam)
    if (!Number.isNaN(parsed)) {
      nuevaCalificacion.value.alumnoId = parsed
    }
  }
  const asignaturaIdParam = route.query.asignaturaId
  if (asignaturaIdParam) {
    const parsedAsig = Number(asignaturaIdParam)
    if (!Number.isNaN(parsedAsig)) {
      nuevaCalificacion.value.asignaturaId = parsedAsig
    }
  }
  await obtenerCalificaciones()
})

// Generar libreta imprimible del alumno seleccionado
const imprimirLibreta = () => {
  const alumnoId = nuevaCalificacion.value.alumnoId
  const materiaId = nuevaCalificacion.value.asignaturaId
  if (!alumnoId || !materiaId) { alert('Seleccione alumno y asignatura'); return }
  router.push({ path: '/menu/boletin', query: { alumnoId, materiaId } })
}

const asignarAsignaturaAlAlumno = async () => {
  const alumnoId = nuevaCalificacion.value.alumnoId
  const asignaturaId = nuevaCalificacion.value.asignaturaId
  if (!alumnoId || !asignaturaId) { alert('Seleccione alumno y asignatura'); return }
  const asig = asignaturas.value.find(a => a.id === asignaturaId)
  if (!asig || !asig.curso_id) { alert('La asignatura no tiene curso asociado'); return }
  try {
    let materia
    try {
      const resCrear = await axios.post(`/api/cursos/${asig.curso_id}/materias`, { nombre: asig.nombre, descripcion: `${asig.nombre_profesor || ''} ${asig.apellido_profesor || ''}`.trim() }, getAuthHeaders())
      materia = resCrear.data
    } catch (errCrear) {
      const resList = await axios.get(`/api/cursos/${asig.curso_id}/materias`, getAuthHeaders())
      materia = (resList.data || []).find(m => m.nombre === asig.nombre) || null
      if (!materia) throw errCrear
    }
    if (!materia || !materia.id) { alert('No se pudo obtener la materia'); return }
    await axios.post(`/api/alumnos/${alumnoId}/materias`, { materia_id: materia.id }, getAuthHeaders())
    alert('Asignatura asignada al alumno como materia')
  } catch (err) {
    alert(err.response?.data?.error || 'Error asignando asignatura')
  }
}
</script>

<style scoped>
.calificaciones-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

/* Encabezado de notas con estilo solicitado */
.notas-header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  background: #f7f9fc;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}
.alumno-pill {
  background: #ffffff;
  border: 2px solid #111827;
  color: #111827;
  border-radius: 12px;
  padding: 8px 16px;
  text-align: center;
  font-weight: 500;
}
.chip {
  background: #e0f2fe;
  color: #1e3a8a;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.9rem;
}
.chip.muted, .alumno-pill .muted {
  background: #f3f4f6;
  color: #6b7280;
}
.btn-orange {
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-large { padding: 12px 20px; font-size: 1rem; font-weight: 600; }

.form-section, .list-section {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: #212529;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

h3 {
  color: #555;
  margin-bottom: 15px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.calificaciones-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.calificaciones-table th,
.calificaciones-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  color: #212529;
}

.calificaciones-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
}

.btn-edit {
  background-color: #ffc107;
  color: #212529;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-edit:hover {
  background-color: #e0a800;
}

.btn-delete:hover {
  background-color: #c82333;
}

.loading, .error, .no-calificaciones {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 15px;
}

.no-calificaciones {
  color: #6c757d;
  font-style: italic;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.btn-close:hover {
  color: #333;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style>
