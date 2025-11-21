<template>
  <div class="asignaturas-container">
    <h2>Gestión de Asignaturas</h2>
    
    <!-- Formulario para crear asignatura -->
    <div class="form-section">
      <h3>{{ asignaturaEditando.id ? 'Editar' : 'Nueva' }} Asignatura</h3>
      <form @submit.prevent="asignaturaEditando.id ? actualizarAsignatura() : guardarAsignatura()" class="formulario">
        <div class="form-row">
          <div class="form-group">
            <label for="nombre">Nombre de la Asignatura:</label>
            <input 
              v-model="formData.nombre" 
              type="text" 
              id="nombre" 
              placeholder="Ej: Matemáticas, Lenguaje, Ciencias" 
              required 
            />
          </div>
          <div class="form-group" v-if="mostrarNivel">
            <label for="nivel">Nivel:</label>
            <select v-model="formData.nivel" id="nivel" @change="filtrarCursos" required>
              <option value="">Seleccionar nivel</option>
              <option value="Inicial">Inicial</option>
              <option value="Primario">Primario</option>
              <option value="Secundario">Secundario</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" v-if="!cursoPreseleccionado">
            <label for="curso_id">Curso:</label>
            <select 
              v-model.number="formData.curso_id" 
              id="curso_id" 
              :disabled="cargandoCursos || !formData.nivel"
              required
            >
              <option value="">Seleccionar curso</option>
              <option v-for="curso in cursosFiltrados" :key="curso.id" :value="curso.id">
                {{ curso.nombre }} - {{ curso.grado }}° ({{ curso.turno }})
              </option>
            </select>
            <div class="inline-help" v-if="cursosFiltrados.length === 0">
              No hay cursos en este nivel. 
              <button type="button" class="btn-link" @click="irACursos">Crear curso</button>
            </div>
          </div>
          <div class="form-group">
            <label for="profesor_id">Profesor:</label>
            <select 
              v-model.number="formData.profesor_id" 
              id="profesor_id" 
              required
            >
              <option value="">Seleccionar profesor</option>
              <option v-for="profesor in profesores" :key="profesor.id" :value="profesor.id">
                {{ profesor.nombre }} {{ profesor.apellido }} - {{ profesor.especialidad }}
              </option>
            </select>
            <div class="inline-help" v-if="profesores.length === 0">
              No hay profesores cargados. 
              <button type="button" class="btn-link" @click="irAProfesores">Crear profesor</button>
            </div>
          </div>
        </div>

        <div class="form-group full-width">
          <label for="descripcion">Descripción:</label>
          <textarea 
            v-model="formData.descripcion" 
            id="descripcion" 
            placeholder="Descripción de la asignatura..." 
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="cancelarEdicion" class="btn-secondary" v-if="asignaturaEditando.id">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : (asignaturaEditando.id ? 'Actualizar' : 'Guardar') }} Asignatura
          </button>
        </div>
      </form>
  </div>
  
  <!-- Materias del curso seleccionado -->
  <div class="form-section" v-if="formData.curso_id">
    <h3>Materias del Curso Seleccionado</h3>
    <div v-if="cargandoMaterias" class="loading">Cargando materias...</div>
    <div v-else>
      <div v-if="(materiasCurso || []).length > 0" class="table-container">
        <table class="asignaturas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Materia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="materia in materiasCurso" :key="materia.id">
              <td>{{ materia.id }}</td>
              <td>
                <strong>{{ materia.nombre }}</strong>
                <div v-if="materia.descripcion" class="descripcion-corta">
                  {{ materia.descripcion.substring(0, 50) }}...
                </div>
              </td>
              <td class="acciones">
                <button @click="verNotas(materia)" class="btn-notas" title="Ver notas">
                  📝 Notas
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Nombre de la materia:</label>
        <input v-model="materiaNueva.nombre" type="text" placeholder="Ej: Matemáticas" />
      </div>
      <div class="form-group full-width">
        <label>Descripción:</label>
        <textarea v-model="materiaNueva.descripcion" rows="2" placeholder="Descripción breve"></textarea>
      </div>
    </div>
    <div class="form-actions">
      <button type="button" class="btn-primary" @click="crearMateriaRapida" :disabled="guardandoMateria || !materiaNueva.nombre">
        {{ guardandoMateria ? 'Creando...' : 'Crear materia' }}
      </button>
    </div>
  </div>

  <!-- Gestión de Horarios -->
  <div class="form-section" v-if="asignaturaEditando.id">
      <h3>Gestión de Horarios</h3>
      <div class="horarios-section">
        <div v-for="(horario, index) in horariosTemporales" :key="index" class="horario-item">
          <div class="form-row">
            <div class="form-group">
              <label>Día de la semana:</label>
              <select v-model="horario.dia_semana" required>
                <option value="">Seleccionar día</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
              </select>
            </div>
            <div class="form-group">
              <label>Hora inicio:</label>
              <input type="time" v-model="horario.hora_inicio" required />
            </div>
            <div class="form-group">
              <label>Hora fin:</label>
              <input type="time" v-model="horario.hora_fin" required />
            </div>
            <div class="form-group">
              <label>Aula:</label>
              <input type="text" v-model="horario.aula" placeholder="Ej: Aula 101" />
            </div>
            <div class="form-group acciones-horario">
              <button type="button" @click="eliminarHorarioTemporal(index)" class="btn-remove" 
                      :disabled="horariosTemporales.length === 1">
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <button type="button" @click="agregarHorarioTemporal" class="btn-add">
          ➕ Agregar Horario
        </button>
        
        <div class="form-actions">
          <button type="button" @click="guardarHorarios" class="btn-primary" :disabled="guardandoHorarios">
            {{ guardandoHorarios ? 'Guardando...' : 'Guardar Horarios' }}
          </button>
        </div>
      </div>
    </div>


    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>¿Eliminar Asignatura?</h3>
        <p>¿Estás seguro de que quieres eliminar "{{ asignaturaAEliminar?.nombre }}"?</p>
        <p class="warning">⚠️ Esta acción no se puede deshacer</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="confirmarEliminacion" class="btn-delete">
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed, watch, onActivated } from 'vue'
import axios from 'axios'

// Estado reactivo
const cursos = ref([])
const profesores = ref([])
const asignaturas = ref([])
const loading = ref(false)
const error = ref('')
const showDeleteModal = ref(false)
const asignaturaAEliminar = ref(null)
const guardandoHorarios = ref(false)
const cargandoCursos = ref(false)
const cargandoMaterias = ref(false)

// Búsqueda y filtros
const route = useRoute()
const cursoPreseleccionado = computed(() => !!Number(route.query?.cursoId || 0))
const searchTerm = ref(route.query?.q || '')
const filterNivel = ref('')

// Datos del formulario
const formData = ref({
  nombre: '',
  descripcion: '',
  nivel: '',
  curso_id: '',
  profesor_id: ''
})

// Estado de edición
const asignaturaEditando = ref({})
const horariosTemporales = ref([{ dia_semana: '', hora_inicio: '', hora_fin: '', aula: '' }])

// Configurar headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
}

// Computed properties
const cursosFiltrados = computed(() => {
  if (!formData.value.nivel) return cursos.value
  // Asegurar coincidencia por texto exacto de nivel
  return (cursos.value || []).filter(curso => {
    const nivel = (curso.nivel || curso.nivel_curso || '').toString()
    return nivel === formData.value.nivel
  })
})

const asignaturasFiltradas = computed(() => {
  let filtered = asignaturas.value
  
  // Filtrar por término de búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(asignatura => 
      asignatura.nombre.toLowerCase().includes(term) ||
      asignatura.nombre_profesor.toLowerCase().includes(term) ||
      asignatura.nombre_curso.toLowerCase().includes(term)
    )
  }
  
  // Filtrar por nivel
  if (filterNivel.value) {
    filtered = filtered.filter(asignatura => asignatura.nivel_curso === filterNivel.value)
  }
  
  return filtered
})

// Métodos
const router = useRouter()

const cargarCursos = async () => {
  cargandoCursos.value = true
  try {
    const nivel = formData.value.nivel
    const url = nivel ? `/api/cursos?nivel=${encodeURIComponent(nivel)}` : '/api/cursos'
    const response = await axios.get(url, getAuthHeaders())
    cursos.value = response.data
  } catch (err) {
    console.error('Error al cargar cursos:', err)
    error.value = 'Error al cargar cursos: ' + (err.response?.data?.error || err.message)
  } finally {
    cargandoCursos.value = false
  }
}

const cargarProfesores = async () => {
  try {
    const response = await axios.get('/api/profesores', getAuthHeaders())
    profesores.value = response.data
  } catch (err) {
    console.error('Error al cargar profesores:', err)
    error.value = 'Error al cargar profesores: ' + (err.response?.data?.error || err.message)
  }
}

const cargarAsignaturas = async () => {
  // Backend actual no expone /api/asignaturas; usar materias por curso
  asignaturas.value = []
}

const filtrarCursos = () => {
  if (!cursoPreseleccionado.value) {
    formData.value.curso_id = ''
  }
}

const irACursos = () => {
  // Navegar a la vista de cursos/nivel correspondiente para crear rápidamente
  const nivel = formData.value.nivel
  if (nivel === 'Inicial') {
    router.push('/menu/inicial')
  } else if (nivel === 'Primario') {
    router.push('/menu/primario')
  } else if (nivel === 'Secundario') {
    router.push('/menu/secundario')
  } else {
    // Si no hay nivel, ir a la lista general de asignaturas o menú
    router.push('/menu/primario')
  }
}

const irAProfesores = () => {
  router.push('/menu/profesores')
}

const guardarAsignatura = async () => {
  loading.value = true
  
  try {
    const cursoId = formData.value.curso_id
    if (!cursoId) {
      error.value = 'Selecciona un curso para crear la materia'
      return
    }
    await axios.post(`/api/cursos/${cursoId}/materias`, {
      nombre: formData.value.nombre,
      descripcion: formData.value.descripcion || ''
    }, getAuthHeaders())
    
    // Limpiar formulario
    resetForm()
    
    // Recargar lista
    await cargarMateriasPorCurso()
    
    alert('Materia creada exitosamente')
  } catch (err) {
    console.error('Error al crear materia:', err)
    error.value = err.response?.data?.error || 'Error al crear materia'
  } finally {
    loading.value = false
  }
}

const editarAsignatura = async (asignatura) => {
  asignaturaEditando.value = { ...asignatura }
  formData.value = {
    nombre: asignatura.nombre,
    descripcion: asignatura.descripcion,
    nivel: asignatura.nivel_curso,
    curso_id: asignatura.curso_id,
    profesor_id: asignatura.profesor_id
  }
  
  // Cargar horarios de la asignatura
  try {
    const horariosResponse = await axios.get(
      `/api/horarios/asignatura/${asignatura.id}`, 
      getAuthHeaders()
    )
    horariosTemporales.value = horariosResponse.data.length > 0 
      ? horariosResponse.data 
      : [{ dia_semana: '', hora_inicio: '', hora_fin: '', aula: '' }]
  } catch (error) {
    console.error('Error cargando horarios:', error)
    horariosTemporales.value = [{ dia_semana: '', hora_inicio: '', hora_fin: '', aula: '' }]
  }
}

const cancelarEdicion = () => {
  resetForm()
}

const actualizarAsignatura = async () => {
  loading.value = true
  
  try {
    await axios.put(
      `/api/materias/${asignaturaEditando.value.id}`,
      {
        nombre: formData.value.nombre,
        descripcion: formData.value.descripcion || ''
      },
      getAuthHeaders()
    )
    
    resetForm()
    await cargarMateriasPorCurso()
    
    alert('Materia actualizada exitosamente')
  } catch (err) {
    console.error('Error al actualizar materia:', err)
    error.value = err.response?.data?.error || 'Error al actualizar materia'
  } finally {
    loading.value = false
  }
}

const eliminarAsignatura = (asignatura) => {
  asignaturaAEliminar.value = asignatura
  showDeleteModal.value = true
}

const confirmarEliminacion = async () => {
  if (!asignaturaAEliminar.value) return

  try {
    await axios.delete(`/api/materias/${asignaturaAEliminar.value.id}`, getAuthHeaders())
    
    showDeleteModal.value = false
    await cargarMateriasPorCurso()
    
    alert('Materia eliminada exitosamente')
  } catch (err) {
    console.error('Error eliminando materia:', err)
    error.value = err.response?.data?.error || 'Error eliminando materia'
  }
}

// Métodos para horarios
const agregarHorarioTemporal = () => {
  horariosTemporales.value.push({ dia_semana: '', hora_inicio: '', hora_fin: '', aula: '' })
}

const eliminarHorarioTemporal = (index) => {
  if (horariosTemporales.value.length > 1) {
    horariosTemporales.value.splice(index, 1)
  }
}

const guardarHorarios = async () => {
  if (!asignaturaEditando.value.id) return

  guardandoHorarios.value = true
  
  try {
    // Eliminar horarios existentes (borrado lógico)
    const horariosExistentes = await axios.get(
      `/api/horarios/asignatura/${asignaturaEditando.value.id}`,
      getAuthHeaders()
    )
    
    for (const horario of horariosExistentes.data) {
      await axios.delete(
        `/api/horarios/${horario.id}`,
        getAuthHeaders()
      )
    }
    
    // Crear nuevos horarios
    for (const horario of horariosTemporales.value) {
      if (horario.dia_semana && horario.hora_inicio && horario.hora_fin) {
        await axios.post('/api/horarios', {
          asignatura_id: asignaturaEditando.value.id,
          dia_semana: horario.dia_semana,
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin,
          aula: horario.aula || ''
        }, getAuthHeaders())
      }
    }
    
    await cargarAsignaturas()
    alert('Horarios guardados exitosamente')
  } catch (err) {
    console.error('Error guardando horarios:', err)
    error.value = err.response?.data?.error || 'Error guardando horarios'
  } finally {
    guardandoHorarios.value = false
  }
}

const resetForm = () => {
  formData.value = {
    nombre: '',
    descripcion: '',
    nivel: '',
    curso_id: '',
    profesor_id: ''
  }
  asignaturaEditando.value = {}
  horariosTemporales.value = [{ dia_semana: '', hora_inicio: '', hora_fin: '', aula: '' }]
}

const verNotas = (asignatura) => {
  if (!asignatura || !asignatura.id) return
  router.push(`/menu/calificaciones?asignaturaId=${asignatura.id}`)
}

// Inicialización
onMounted(async () => {
  await Promise.all([
    cargarCursos(),
    cargarProfesores(),
    cargarAsignaturas()
  ])
  // Prefiltrar por query si está presente
  const q = route.query?.q
  if (q && typeof q === 'string') {
    searchTerm.value = q
  }
  const cursoQuery = Number(route.query?.cursoId || 0)
  if (cursoQuery) {
    formData.value.curso_id = cursoQuery
    const cursoSel = (cursos.value || []).find(c => c.id === cursoQuery)
    if (cursoSel && (cursoSel.nivel || cursoSel.nivel_curso)) {
      formData.value.nivel = cursoSel.nivel || cursoSel.nivel_curso
    }
    await cargarMateriasPorCurso()
  }
})

// Refrescar al activar la vista (por si vuelve desde crear curso)
onActivated(async () => {
  await cargarCursos()
})

// Recargar cursos cuando cambia el nivel y limpiar selección de curso
watch(() => formData.value.nivel, async () => {
  try {
    await cargarCursos()
  } finally {
    if (!cursoPreseleccionado.value) {
      formData.value.curso_id = ''
    }
  }
})

// ===== Materias del curso seleccionado =====
const materiasCurso = ref([])
const materiaNueva = ref({ nombre: '', descripcion: '' })
const guardandoMateria = ref(false)

const cargarMateriasPorCurso = async () => {
  const id = formData.value.curso_id
  if (!id) { materiasCurso.value = []; return }
  cargandoMaterias.value = true
  try {
    const response = await axios.get(`/api/cursos/${id}/materias`, getAuthHeaders())
    materiasCurso.value = response.data
  } catch (err) {
    console.error('Error al cargar materias del curso:', err)
    materiasCurso.value = []
  } finally {
    cargandoMaterias.value = false
  }
}

const crearMateriaRapida = async () => {
  const id = formData.value.curso_id
  if (!id || !materiaNueva.value.nombre) return
  guardandoMateria.value = true
  try {
    await axios.post(`/api/cursos/${id}/materias`, {
      nombre: materiaNueva.value.nombre,
      descripcion: materiaNueva.value.descripcion || ''
    }, getAuthHeaders())
    materiaNueva.value = { nombre: '', descripcion: '' }
    await cargarMateriasPorCurso()
    alert('Materia creada exitosamente')
  } catch (err) {
    console.error('Error creando materia:', err)
    alert(err.response?.data?.error || 'Error creando materia')
  } finally {
    guardandoMateria.value = false
  }
}

watch(() => formData.value.curso_id, async (nuevo) => {
  if (nuevo) await cargarMateriasPorCurso()
  // Al seleccionar curso, setear nivel automáticamente si existe
  const cursoSel = (cursos.value || []).find(c => c.id === nuevo)
  if (cursoSel && (cursoSel.nivel || cursoSel.nivel_curso)) {
    formData.value.nivel = cursoSel.nivel || cursoSel.nivel_curso
  }
})
</script>

<style scoped>
.asignaturas-container {
  padding: 20px;
  max-width: 1400px;
  margin: auto;
}

.form-section, .list-section {
  background: white;
  padding: 25px;
  margin-bottom: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

h2 {
  color: #333;
  margin-bottom: 25px;
  text-align: center;
  font-size: 28px;
}

h3 {
  color: #555;
  margin-bottom: 20px;
  border-bottom: 3px solid #007bff;
  padding-bottom: 8px;
  font-size: 22px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.acciones-horario {
  display: flex;
  align-items: flex-end;
}

.btn-add, .btn-remove {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  height: 42px;
}

.btn-add {
  background-color: #28a745;
  color: white;
  width: 100%;
  margin-top: 10px;
}

.btn-remove {
  background-color: #dc3545;
  color: white;
  width: 50px;
}

.btn-add:hover {
  background-color: #218838;
  transform: translateY(-1px);
}

.btn-remove:hover:not(:disabled) {
  background-color: #c82333;
  transform: translateY(-1px);
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.horarios-section {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #fafafa;
}

.horario-item {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.table-container {
  overflow-x: auto;
  margin-top: 20px;
}

.asignaturas-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.asignaturas-table th,
.asignaturas-table td {
  padding: 16px 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
  line-height: 1.5;
}

.asignaturas-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #dee2e6;
}

.asignaturas-table td {
  font-size: 14px;
  color: #212529;
  background-color: white;
}

.asignaturas-table tr:hover td {
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.descripcion-corta {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.info-adicional {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-inicial {
  background-color: #28a745;
  color: white;
}

.badge-primario {
  background-color: #fd7e14;
  color: white;
}

.badge-secundario {
  background-color: #6f42c1;
  color: white;
}

.badge-curso {
  background-color: #17a2b8;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.horarios-lista {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.horario-item-lista {
  font-size: 12px;
  color: #495057;
  padding: 4px 8px;
  background: #e9ecef;
  border-radius: 4px;
  border-left: 3px solid #007bff;
}

.sin-horarios {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

.acciones {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.acciones button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 80px;
}

.btn-edit {
  background-color: #ffc107;
  color: #212529;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-notas {
  background-color: #6366f1; /* Indigo */
  color: #fff;
}

.btn-edit:hover {
  background-color: #e0a800;
  transform: translateY(-1px);
}

.btn-delete:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.btn-notas:hover {
  background-color: #4f46e5;
  transform: translateY(-1px);
}

.loading, .error, .no-data {
  text-align: center;
  padding: 30px;
  color: #666;
  font-size: 16px;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 20px;
}

.no-data {
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
  border-radius: 10px;
  padding: 25px;
  width: 90%;
  max-width: 400px;
}

.modal-content h3 {
  margin-top: 0;
  color: #dc3545;
}

.modal-content p {
  margin-bottom: 10px;
}

.warning {
  color: #dc3545;
  font-weight: bold;
}

/* Inline helper and link styles */
.inline-help {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}

.btn-link {
  background: none;
  border: none;
  color: #007bff;
  padding: 0;
  margin-left: 6px;
  cursor: pointer;
  text-decoration: underline;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .asignaturas-container {
    padding: 10px;
  }
  
  .list-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-actions {
    justify-content: space-between;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .acciones {
    flex-direction: column;
    gap: 5px;
  }
  
  .modal-content {
    width: 95%;
    padding: 15px;
  }
}
</style>
// Mostrar/ocultar campo Nivel para evitar redundancia si ya hay curso seleccionado
const mostrarNivel = computed(() => {
  // Ocultar si ya elegiste un curso o si el contexto de la ruta indica el nivel
  return !formData.value.curso_id
})
