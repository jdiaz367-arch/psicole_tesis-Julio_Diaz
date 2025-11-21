<template>
  <div class="dai-container">
    <h2>🧠 Sistema de Diagnóstico y Evaluación Psicológica (DAI)</h2>
    
    <!-- Filtros y búsqueda -->
    <div class="filters-section">
      <div class="filters-header">
        <h3>Filtros de Búsqueda</h3>
        <button @click="mostrarModalNuevaEvaluacion" class="btn-primary">
          ➕ Nueva Evaluación
        </button>
      </div>
      
      <div class="filters-row">
        <div class="filter-group">
          <label>Alumno:</label>
          <select v-model="filters.alumno_id" @change="filtrarEvaluaciones">
            <option value="">Todos los alumnos</option>
            <option v-for="alumno in alumnos" :key="alumno.id" :value="alumno.id">
              {{ alumno.nombre }} {{ alumno.apellido }} - {{ alumno.nivel }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Nivel:</label>
          <select v-model="filters.nivel" @change="filtrarEvaluaciones">
            <option value="">Todos los niveles</option>
            <option value="Inicial">Inicial</option>
            <option value="Primario">Primario</option>
            <option value="Secundario">Secundario</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Estado:</label>
          <select v-model="filters.estado" @change="filtrarEvaluaciones">
            <option value="">Todos los estados</option>
            <option value="pendiente">🟡 Pendiente</option>
            <option value="completado">🟢 Completado</option>
            <option value="cancelado">🔴 Cancelado</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Fecha desde:</label>
          <input type="date" v-model="filters.fecha_desde" @change="filtrarEvaluaciones" />
        </div>
        
        <div class="filter-group">
          <label>Fecha hasta:</label>
          <input type="date" v-model="filters.fecha_hasta" @change="filtrarEvaluaciones" />
        </div>
      </div>
      
      <div class="search-box">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Buscar por nombre, diagnóstico o observaciones..." 
          @input="filtrarEvaluaciones"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-number">{{ estadisticas.total }}</div>
            <div class="stat-label">Total Evaluaciones</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🟡</div>
          <div class="stat-info">
            <div class="stat-number">{{ estadisticas.pendientes }}</div>
            <div class="stat-label">Pendientes</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🟢</div>
          <div class="stat-info">
            <div class="stat-number">{{ estadisticas.completados }}</div>
            <div class="stat-label">Completados</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔴</div>
          <div class="stat-info">
            <div class="stat-number">{{ estadisticas.cancelados }}</div>
            <div class="stat-label">Cancelados</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de evaluaciones -->
    <div class="list-section">
      <div class="list-header">
        <h3>Evaluaciones Psicológicas</h3>
        <div class="export-actions">
          <button @click="exportarPDF" class="btn-export" :disabled="evaluacionesFiltradas.length === 0">
            📄 Exportar PDF
          </button>
          <button @click="exportarExcel" class="btn-export" :disabled="evaluacionesFiltradas.length === 0">
            📊 Exportar Excel
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">Cargando evaluaciones...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="evaluacionesFiltradas.length === 0" class="no-data">
        {{ hasFilters ? 'No se encontraron evaluaciones con los filtros aplicados' : 'No hay evaluaciones registradas' }}
      </div>
      
      <div v-else class="evaluaciones-grid">
        <div v-for="evaluacion in evaluacionesFiltradas" :key="evaluacion.id" class="evaluacion-card" 
             :class="`estado-${evaluacion.estado}`">
          <div class="evaluacion-header">
            <div class="evaluacion-title">
              <h4>{{ evaluacion.tipo_evaluacion }}</h4>
              <span :class="`badge estado-${evaluacion.estado}`">
                {{ getEstadoText(evaluacion.estado) }}
              </span>
            </div>
            <div class="evaluacion-date">
              {{ formatDate(evaluacion.fecha_evaluacion) }}
            </div>
          </div>
          
          <div class="evaluacion-body">
            <div class="evaluacion-info">
              <div class="info-item">
                <strong>Alumno:</strong> 
                <span>{{ evaluacion.nombre_alumno }} {{ evaluacion.apellido_alumno }}</span>
              </div>
              <div class="info-item">
                <strong>Edad:</strong> 
                <span>{{ calcularEdad(evaluacion.fecha_nacimiento) }} años</span>
              </div>
              <div class="info-item">
                <strong>Curso:</strong> 
                <span>{{ evaluacion.nombre_curso }} - {{ evaluacion.nivel }}</span>
              </div>
              <div class="info-item">
                <strong>Evaluador:</strong> 
                <span>{{ evaluacion.nombre_evaluador }} {{ evaluacion.apellido_evaluador }}</span>
              </div>
            </div>
            
            <div class="evaluacion-diagnostico" v-if="evaluacion.diagnostico">
              <strong>Diagnóstico preliminar:</strong>
              <p>{{ evaluacion.diagnostico }}</p>
            </div>
            
            <div class="evaluacion-observaciones" v-if="evaluacion.observaciones">
              <strong>Observaciones:</strong>
              <p>{{ evaluacion.observaciones }}</p>
            </div>
            
            <div class="evaluacion-resultados" v-if="evaluacion.resultados">
              <strong>Resultados:</strong>
              <div class="resultados-chips">
                <span v-for="(valor, clave) in parseResultados(evaluacion.resultados)" :key="clave" 
                      class="resultado-chip">
                  {{ clave }}: {{ valor }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="evaluacion-actions">
            <button @click="verDetalles(evaluacion)" class="btn-view" title="Ver detalles">
              👁️ Detalles
            </button>
            <button @click="editarEvaluacion(evaluacion)" class="btn-edit" title="Editar">
              ✏️ Editar
            </button>
            <button v-if="evaluacion.estado === 'pendiente'" 
                    @click="completarEvaluacion(evaluacion)" 
                    class="btn-complete" 
                    title="Marcar como completado">
              ✅ Completar
            </button>
            <button @click="eliminarEvaluacion(evaluacion)" class="btn-delete" title="Eliminar">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para nueva/editar evaluación -->
    <div v-if="mostrarModalEvaluacion" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ evaluacionEditando.id ? 'Editar' : 'Nueva' }} Evaluación Psicológica</h3>
          <button @click="cerrarModal" class="btn-close">&times;</button>
        </div>
        
        <form @submit.prevent="evaluacionEditando.id ? actualizarEvaluacion() : crearEvaluacion()" class="evaluacion-form">
          <div class="form-row">
            <div class="form-group">
              <label for="alumno_id">Alumno *</label>
              <select v-model="formData.alumno_id" id="alumno_id" required @change="cargarDatosAlumno">
                <option value="">Seleccionar alumno</option>
                <option v-for="alumno in alumnos" :key="alumno.id" :value="alumno.id">
                  {{ alumno.nombre }} {{ alumno.apellido }} - {{ alumno.nivel }} ({{ alumno.nombre_colegio }})
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="tipo_evaluacion">Tipo de Evaluación *</label>
              <select v-model="formData.tipo_evaluacion" id="tipo_evaluacion" required>
                <option value="">Seleccionar tipo</option>
                <option value="Evaluación Psicopedagógica">Evaluación Psicopedagógica</option>
                <option value="Evaluación Conductual">Evaluación Conductual</option>
                <option value="Evaluación Emocional">Evaluación Emocional</option>
                <option value="Evaluación de Aprendizaje">Evaluación de Aprendizaje</option>
                <option value="Evaluación Social">Evaluación Social</option>
                <option value="Evaluación Integral">Evaluación Integral</option>
                <option value="Seguimiento">Seguimiento</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="fecha_evaluacion">Fecha de Evaluación *</label>
              <input type="date" v-model="formData.fecha_evaluacion" id="fecha_evaluacion" required />
            </div>
            
            <div class="form-group">
              <label for="estado">Estado *</label>
              <select v-model="formData.estado" id="estado" required>
                <option value="pendiente">🟡 Pendiente</option>
                <option value="completado">🟢 Completado</option>
                <option value="cancelado">🔴 Cancelado</option>
              </select>
            </div>
          </div>

          <div class="form-group full-width">
            <label for="instrumentos">Instrumentos Utilizados</label>
            <textarea v-model="formData.instrumentos" id="instrumentos" 
                      placeholder="Lista de tests, cuestionarios o instrumentos utilizados..." 
                      rows="2"></textarea>
          </div>

          <div class="form-group full-width">
            <label for="observaciones">Observaciones</label>
            <textarea v-model="formData.observaciones" id="observaciones" 
                      placeholder="Observaciones generales del proceso de evaluación..." 
                      rows="3"></textarea>
          </div>

          <div class="form-group full-width">
            <label for="diagnostico">Diagnóstico Preliminar</label>
            <textarea v-model="formData.diagnostico" id="diagnostico" 
                      placeholder="Diagnóstico preliminar o impresiones clínicas..." 
                      rows="3"></textarea>
          </div>

          <div class="form-group full-width">
            <label for="recomendaciones">Recomendaciones</label>
            <textarea v-model="formData.recomendaciones" id="recomendaciones" 
                      placeholder="Recomendaciones para padres, profesores o tratamiento..." 
                      rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="cerrarModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Guardando...' : (evaluacionEditando.id ? 'Actualizar' : 'Crear') }} Evaluación
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="mostrarModalDetalles" class="modal-overlay" @click="cerrarModalDetalles">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Detalles de la Evaluación</h3>
          <button @click="cerrarModalDetalles" class="btn-close">&times;</button>
        </div>
        
        <div v-if="evaluacionSeleccionada" class="detalles-content">
          <div class="detalle-section">
            <h4>Información General</h4>
            <div class="detalle-grid">
              <div class="detalle-item">
                <strong>Alumno:</strong> {{ evaluacionSeleccionada.nombre_alumno }} {{ evaluacionSeleccionada.apellido_alumno }}
              </div>
              <div class="detalle-item">
                <strong>Edad:</strong> {{ calcularEdad(evaluacionSeleccionada.fecha_nacimiento) }} años
              </div>
              <div class="detalle-item">
                <strong>Curso:</strong> {{ evaluacionSeleccionada.nombre_curso }} - {{ evaluacionSeleccionada.nivel }}
              </div>
              <div class="detalle-item">
                <strong>Colegio:</strong> {{ evaluacionSeleccionada.nombre_colegio }}
              </div>
              <div class="detalle-item">
                <strong>Tipo de Evaluación:</strong> {{ evaluacionSeleccionada.tipo_evaluacion }}
              </div>
              <div class="detalle-item">
                <strong>Fecha:</strong> {{ formatDate(evaluacionSeleccionada.fecha_evaluacion) }}
              </div>
              <div class="detalle-item">
                <strong>Estado:</strong> 
                <span :class="`badge estado-${evaluacionSeleccionada.estado}`">
                  {{ getEstadoText(evaluacionSeleccionada.estado) }}
                </span>
              </div>
              <div class="detalle-item">
                <strong>Evaluador:</strong> {{ evaluacionSeleccionada.nombre_evaluador }} {{ evaluacionSeleccionada.apellido_evaluador }}
              </div>
            </div>
          </div>

          <div class="detalle-section" v-if="evaluacionSeleccionada.instrumentos">
            <h4>Instrumentos Utilizados</h4>
            <p>{{ evaluacionSeleccionada.instrumentos }}</p>
          </div>

          <div class="detalle-section" v-if="evaluacionSeleccionada.observaciones">
            <h4>Observaciones</h4>
            <p>{{ evaluacionSeleccionada.observaciones }}</p>
          </div>

          <div class="detalle-section" v-if="evaluacionSeleccionada.diagnostico">
            <h4>Diagnóstico Preliminar</h4>
            <p>{{ evaluacionSeleccionada.diagnostico }}</p>
          </div>

          <div class="detalle-section" v-if="evaluacionSeleccionada.recomendaciones">
            <h4>Recomendaciones</h4>
            <p>{{ evaluacionSeleccionada.recomendaciones }}</p>
          </div>

          <div class="detalle-section" v-if="evaluacionSeleccionada.resultados">
            <h4>Resultados</h4>
            <div class="resultados-detalle">
              <div v-for="(valor, clave) in parseResultados(evaluacionSeleccionada.resultados)" :key="clave" 
                   class="resultado-item">
                <strong>{{ clave }}:</strong> {{ valor }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

// Estado reactivo
const evaluaciones = ref([])
const alumnos = ref([])
const loading = ref(false)
const error = ref('')
const mostrarModalEvaluacion = ref(false)
const mostrarModalDetalles = ref(false)
const evaluacionEditando = ref({})
const evaluacionSeleccionada = ref(null)

// Filtros
const filters = ref({
  alumno_id: '',
  nivel: '',
  estado: '',
  fecha_desde: '',
  fecha_hasta: '',
  search: ''
})

// Datos del formulario
const formData = ref({
  alumno_id: '',
  tipo_evaluacion: '',
  fecha_evaluacion: new Date().toISOString().split('T')[0],
  estado: 'pendiente',
  instrumentos: '',
  observaciones: '',
  diagnostico: '',
  recomendaciones: '',
  resultados: ''
})

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
const evaluacionesFiltradas = computed(() => {
  let filtered = evaluaciones.value
  
  if (filters.value.alumno_id) {
    filtered = filtered.filter(e => e.alumno_id == filters.value.alumno_id)
  }
  
  if (filters.value.nivel) {
    filtered = filtered.filter(e => e.nivel === filters.value.nivel)
  }
  
  if (filters.value.estado) {
    filtered = filtered.filter(e => e.estado === filters.value.estado)
  }
  
  if (filters.value.fecha_desde) {
    filtered = filtered.filter(e => e.fecha_evaluacion >= filters.value.fecha_desde)
  }
  
  if (filters.value.fecha_hasta) {
    filtered = filtered.filter(e => e.fecha_evaluacion <= filters.value.fecha_hasta)
  }
  
  if (filters.value.search) {
    const term = filters.value.search.toLowerCase()
    filtered = filtered.filter(e => 
      e.tipo_evaluacion.toLowerCase().includes(term) ||
      (e.diagnostico && e.diagnostico.toLowerCase().includes(term)) ||
      (e.observaciones && e.observaciones.toLowerCase().includes(term)) ||
      e.nombre_alumno.toLowerCase().includes(term)
    )
  }
  
  return filtered.sort((a, b) => new Date(b.fecha_evaluacion) - new Date(a.fecha_evaluacion))
})

const estadisticas = computed(() => {
  const total = evaluaciones.value.length
  const pendientes = evaluaciones.value.filter(e => e.estado === 'pendiente').length
  const completados = evaluaciones.value.filter(e => e.estado === 'completado').length
  const cancelados = evaluaciones.value.filter(e => e.estado === 'cancelado').length
  
  return { total, pendientes, completados, cancelados }
})

const hasFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== '')
})

// Métodos
const cargarEvaluaciones = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Simular datos de ejemplo (luego se conectarán con el backend real)
    const evaluacionesEjemplo = [
      {
        id: 1,
        alumno_id: 1,
        tipo_evaluacion: 'Evaluación Psicopedagógica',
        fecha_evaluacion: '2024-01-15',
        estado: 'completado',
        instrumentos: 'WISC-V, Bender, Figura humana',
        observaciones: 'El alumno muestra buen rendimiento en áreas verbales',
        diagnostico: 'Capacidad intelectual dentro del promedio',
        recomendaciones: 'Seguimiento trimestral',
        resultados: '{"CI Verbal": "105", "CI Ejecutivo": "98", "Memoria": "110"}',
        nombre_alumno: 'Juan',
        apellido_alumno: 'Pérez',
        fecha_nacimiento: '2015-03-20',
        nombre_curso: '3er Grado Primaria',
        nivel: 'Primario',
        nombre_colegio: 'Colegio San José',
        nombre_evaluador: 'María',
        apellido_evaluador: 'González'
      },
      {
        id: 2,
        alumno_id: 2,
        tipo_evaluacion: 'Evaluación Conductual',
        fecha_evaluacion: '2024-01-20',
        estado: 'pendiente',
        instrumentos: 'CBCL, Observación directa',
        observaciones: 'Se observa dificultad en atención sostenida',
        diagnostico: 'Posible TDAH',
        recomendaciones: 'Evaluación médica complementaria',
        resultados: '{"Atención": "Baja", "Hiperactividad": "Alta", "Impulsividad": "Media"}',
        nombre_alumno: 'Ana',
        apellido_alumno: 'López',
        fecha_nacimiento: '2016-07-15',
        nombre_curso: '2do Grado Primaria',
        nivel: 'Primario',
        nombre_colegio: 'Colegio Santa María',
        nombre_evaluador: 'Carlos',
        apellido_evaluador: 'Rodríguez'
      }
    ]
    
    evaluaciones.value = evaluacionesEjemplo
  } catch (err) {
    console.error('Error al cargar evaluaciones:', err)
    error.value = 'Error al cargar evaluaciones: ' + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

const cargarAlumnos = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/alumnos', getAuthHeaders())
    alumnos.value = response.data
  } catch (err) {
    console.error('Error al cargar alumnos:', err)
    // En caso de error, usar datos de ejemplo
    alumnos.value = [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        nivel: 'Primario',
        nombre_colegio: 'Colegio San José',
        fecha_nacimiento: '2015-03-20'
      },
      {
        id: 2,
        nombre: 'Ana',
        apellido: 'López',
        nivel: 'Primario',
        nombre_colegio: 'Colegio Santa María',
        fecha_nacimiento: '2016-07-15'
      }
    ]
  }
}

const filtrarEvaluaciones = () => {
  // La computed property se actualiza automáticamente
}

const mostrarModalNuevaEvaluacion = () => {
  evaluacionEditando.value = {}
  formData.value = {
    alumno_id: '',
    tipo_evaluacion: '',
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    instrumentos: '',
    observaciones: '',
    diagnostico: '',
    recomendaciones: '',
    resultados: ''
  }
  mostrarModalEvaluacion.value = true
}

const cargarDatosAlumno = () => {
  // Aquí se podrían cargar datos específicos del alumno seleccionado
}

const crearEvaluacion = async () => {
  loading.value = true
  
  try {
    // Aquí iría la llamada al backend cuando esté listo
    console.log('Creando evaluación:', formData.value)
    
    // Simular creación exitosa
    const nuevaEvaluacion = {
      id: Date.now(),
      ...formData.value,
      nombre_alumno: alumnos.value.find(a => a.id == formData.value.alumno_id)?.nombre || '',
      apellido_alumno: alumnos.value.find(a => a.id == formData.value.alumno_id)?.apellido || '',
      fecha_nacimiento: alumnos.value.find(a => a.id == formData.value.alumno_id)?.fecha_nacimiento || '',
      nombre_curso: 'Curso por definir',
      nivel: alumnos.value.find(a => a.id == formData.value.alumno_id)?.nivel || '',
      nombre_colegio: alumnos.value.find(a => a.id == formData.value.alumno_id)?.nombre_colegio || '',
      nombre_evaluador: 'Usuario Actual',
      apellido_evaluador: ''
    }
    
    evaluaciones.value.unshift(nuevaEvaluacion)
    cerrarModal()
    alert('Evaluación creada exitosamente')
  } catch (err) {
    console.error('Error al crear evaluación:', err)
    error.value = err.response?.data?.error || 'Error al crear evaluación'
  } finally {
    loading.value = false
  }
}

const editarEvaluacion = (evaluacion) => {
  evaluacionEditando.value = { ...evaluacion }
  formData.value = { ...evaluacion }
  mostrarModalEvaluacion.value = true
}

const actualizarEvaluacion = async () => {
  loading.value = true
  
  try {
    // Aquí iría la llamada al backend cuando esté listo
    console.log('Actualizando evaluación:', formData.value)
    
    // Simular actualización exitosa
    const index = evaluaciones.value.findIndex(e => e.id === evaluacionEditando.value.id)
    if (index !== -1) {
      evaluaciones.value[index] = { ...evaluaciones.value[index], ...formData.value }
    }
    
    cerrarModal()
    alert('Evaluación actualizada exitosamente')
  } catch (err) {
    console.error('Error al actualizar evaluación:', err)
    error.value = err.response?.data?.error || 'Error al actualizar evaluación'
  } finally {
    loading.value = false
  }
}

const verDetalles = (evaluacion) => {
  evaluacionSeleccionada.value = evaluacion
  mostrarModalDetalles.value = true
}

const completarEvaluacion = async (evaluacion) => {
  if (confirm('¿Marcar esta evaluación como completada?')) {
    try {
      // Simular actualización
      const index = evaluaciones.value.findIndex(e => e.id === evaluacion.id)
      if (index !== -1) {
        evaluaciones.value[index].estado = 'completado'
      }
      alert('Evaluación marcada como completada')
    } catch (err) {
      console.error('Error al completar evaluación:', err)
      error.value = 'Error al completar evaluación'
    }
  }
}

const eliminarEvaluacion = (evaluacion) => {
  if (confirm('¿Está seguro de que desea eliminar esta evaluación?')) {
    try {
      evaluaciones.value = evaluaciones.value.filter(e => e.id !== evaluacion.id)
      alert('Evaluación eliminada exitosamente')
    } catch (err) {
      console.error('Error al eliminar evaluación:', err)
      error.value = 'Error al eliminar evaluación'
    }
  }
}

const cerrarModal = () => {
  mostrarModalEvaluacion.value = false
  evaluacionEditando.value = {}
}

const cerrarModalDetalles = () => {
  mostrarModalDetalles.value = false
  evaluacionSeleccionada.value = null
}

// Utilidades
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return '-'
  const nacimiento = new Date(fechaNacimiento)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

const getEstadoText = (estado) => {
  const estados = {
    pendiente: 'Pendiente',
    completado: 'Completado',
    cancelado: 'Cancelado'
  }
  return estados[estado] || estado
}

const parseResultados = (resultados) => {
  try {
    return typeof resultados === 'string' ? JSON.parse(resultados) : resultados
  } catch {
    return {}
  }
}

const exportarPDF = () => {
  alert('Funcionalidad de exportación PDF en desarrollo...')
}

const exportarExcel = () => {
  alert('Funcionalidad de exportación Excel en desarrollo...')
}

// Inicialización
onMounted(async () => {
  await cargarAlumnos()
  await cargarEvaluaciones()
})
</script>

<style scoped>
.dai-container {
  padding: 20px;
  max-width: 1400px;
  margin: auto;
}

.filters-section, .stats-section, .list-section {
  background: white;
  padding: 25px;
  margin-bottom: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #007bff;
}

.stat-icon {
  font-size: 32px;
  margin-right: 15px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.export-actions {
  display: flex;
  gap: 10px;
}

.btn-export {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-export:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.evaluaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.evaluacion-card {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.evaluacion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.evaluacion-card.estado-pendiente {
  border-left: 4px solid #ffc107;
}

.evaluacion-card.estado-completado {
  border-left: 4px solid #28a745;
}

.evaluacion-card.estado-cancelado {
  border-left: 4px solid #dc3545;
}

.evaluacion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.evaluacion-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.evaluacion-title h4 {
  margin: 0;
  color: #333;
}

.evaluacion-date {
  color: #666;
  font-size: 14px;
}

.evaluacion-body {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.info-item strong {
  color: #555;
}

.evaluacion-diagnostico,
.evaluacion-observaciones,
.evaluacion-resultados {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
}

.evaluacion-diagnostico strong,
.evaluacion-observaciones strong,
.evaluacion-resultados strong {
  color: #495057;
}

.resultados-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.resultado-chip {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.evaluacion-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.evaluacion-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-view {
  background-color: #17a2b8;
  color: white;
}

.btn-edit {
  background-color: #ffc107;
  color: #212529;
}

.btn-complete {
  background-color: #28a745;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-view:hover { background-color: #138496; }
.btn-edit:hover { background-color: #e0a800; }
.btn-complete:hover { background-color: #218838; }
.btn-delete:hover { background-color: #c82333; }

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge.estado-pendiente {
  background-color: #ffc107;
  color: #212529;
}

.badge.estado-completado {
  background-color: #28a745;
  color: white;
}

.badge.estado-cancelado {
  background-color: #dc3545;
  color: white;
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
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 15px;
}

.modal-header h3 {
  margin: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #333;
}

.evaluacion-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 25px;
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

.detalles-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.detalle-section {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detalle-section h4 {
  margin: 0 0 15px 0;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 8px;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.detalle-item:last-child {
  border-bottom: none;
}

.detalle-item strong {
  color: #495057;
  min-width: 120px;
}

.resultados-detalle {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resultado-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #dee2e6;
}

.resultado-item:last-child {
  border-bottom: none;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 40px;
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

@media (max-width: 768px) {
  .dai-container {
    padding: 10px;
  }
  
  .filters-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .list-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .export-actions {
    justify-content: center;
  }
  
  .evaluaciones-grid {
    grid-template-columns: 1fr;
  }
  
  .evaluacion-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    padding: 15px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .detalle-grid {
    grid-template-columns: 1fr;
  }
}
</style>