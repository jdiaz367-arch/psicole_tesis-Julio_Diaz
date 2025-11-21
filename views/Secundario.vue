<template>
  <div class="nivel-container">
    <!-- Header del nivel -->
    <div class="nivel-header">
      <h1>🎓 Nivel Secundario</h1>
      <div class="breadcrumb">
        <router-link to="/menu">Menu</router-link> / Secundario
      </div>
    </div>

    <!-- Selección de curso -->
    <div class="seleccion-curso">
      <div class="seleccion-header">
        <h2>Seleccionar Curso/División</h2>
        <button class="btn-primary" @click="abrirModalCurso">➕ Crear Curso</button>
      </div>
      <div class="cursos-grid">
        <div v-for="curso in cursosSecundario" :key="curso.id" 
             class="curso-card" 
             :class="{ active: cursoSeleccionado?.id === curso.id }"
              @click="seleccionarCurso(curso)">
          <div class="curso-icon">📚</div>
          <div class="curso-info">
            <h3>{{ curso.nombre }}</h3>
            <p>{{ curso.grado }}° año - {{ curso.turno }}</p>
            <span class="alumnos-count">{{ curso.cantidad_alumnos }} alumnos</span>
            <div class="curso-actions">
              <button class="btn-edit small" @click.stop="editarCurso(curso)">✏️ Editar</button>
              <button class="btn-danger small" @click.stop="eliminarCursoConfirm(curso)">🗑️ Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Curso -->
    <div v-if="mostrarModalCurso" class="modal-overlay" @click="cerrarModalCurso">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 v-if="!modoEdicion">➕ Crear Curso (Secundario)</h3>
          <h3 v-else>✏️ Editar Curso (Secundario)</h3>
          <button @click="cerrarModalCurso" class="btn-close">&times;</button>
        </div>
        <div class="form-row">
          <label>Nombre</label>
          <input v-model="nuevoCurso.nombre" class="input" placeholder="Ej: 1° Año - División A" />
        </div>
        <div class="form-row">
          <label>Grado/Año</label>
          <input type="number" v-model.number="nuevoCurso.grado" class="input" placeholder="Ej: 1" />
        </div>
        <div class="form-row">
          <label>Turno</label>
          <input v-model="nuevoCurso.turno" class="input" placeholder="Mañana / Tarde" />
        </div>
        <div class="form-row">
          <label>Colegio (opcional)</label>
          <input v-model="nuevoCurso.colegio_id" class="input" placeholder="ID de colegio" />
        </div>
        <div class="acciones">
          <button class="btn-secondary" @click="cerrarModalCurso">Cancelar</button>
          <button v-if="!modoEdicion" class="btn-primary" @click="crearCurso">Crear</button>
          <button v-else class="btn-primary" @click="guardarEdicionCurso">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Contenido principal cuando hay curso seleccionado -->
    <div v-if="cursoSeleccionado" class="contenido-principal">
      <!-- Información del curso -->
      <div class="curso-info-panel">
        <div class="info-header">
          <h2>{{ cursoSeleccionado.nombre }} - {{ cursoSeleccionado.grado }}° año</h2>
          <div class="curso-stats">
            <span class="stat">👨‍🎓 {{ alumnosCurso.length }} alumnos</span>
            <span class="stat">📖 {{ materiasCurso.length }} materias</span>
          </div>
        </div>
      </div>

      <!-- Pestañas de funcionalidades -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button v-for="tab in tabs" :key="tab.id" 
                  class="tab-button" 
                  :class="{ active: tabActiva === tab.id }"
                  @click="tabActiva = tab.id">
            {{ tab.icon }} {{ tab.nombre }}
          </button>
        </div>

        <!-- Contenido de las pestañas -->
        <div class="tab-content">
          <!-- Pestaña 1: Lista de Alumnos -->
          <div v-if="tabActiva === 'alumnos'" class="tab-panel">
            <div class="panel-header">
              <h3>👨‍🎓 Lista de Alumnos</h3>
              <button @click="exportarListaAlumnos" class="btn-export">📄 Exportar</button>
            </div>
            
            <div class="alumnos-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Alumno</th>
                    <th>Edad</th>
                    <th>Contacto</th>
                    <th>Diagnósticos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(alumno, index) in alumnosCurso" :key="alumno.id">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <strong>{{ alumno.nombre }} {{ alumno.apellido }}</strong>
                      <div class="alumno-info">
                        DNI: {{ alumno.dni }} | {{ alumno.genero }}
                      </div>
                    </td>
                    <td>{{ calcularEdad(alumno.fecha_nacimiento) }} años</td>
                    <td>
                      <div>{{ alumno.email }}</div>
                      <div>{{ alumno.telefono }}</div>
                    </td>
                    <td>
                      <div v-if="alumno.diagnosticos && alumno.diagnosticos.length > 0" class="diagnosticos-list">
                        <span v-for="diag in alumno.diagnosticos" :key="diag.id" class="diagnostico-chip" :title="diag.diagnostico">
                          {{ diag.tipo_evaluacion }}
                          <button class="chip-remove" @click="eliminarDiagnosticoAlumno(alumno, diag)">✖</button>
                        </span>
                      </div>
                      <span v-else class="sin-diagnosticos">Sin diagnósticos</span>
                      <div class="diagnosticos-input">
                        <input v-model="nuevoDiagTexto[alumno.id]" class="input" placeholder="Agregar diagnóstico..." />
                        <button class="btn-secondary small" :disabled="!(nuevoDiagTexto[alumno.id] && nuevoDiagTexto[alumno.id].trim())" @click="agregarDiagnosticoAlumno(alumno)">Agregar</button>
                      </div>
                    </td>
                    <td class="acciones">
                      <button @click="abrirEncuestaAlumno(alumno)" class="btn-add" title="Crear encuesta">🧾</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pestaña 2: Materias y Profesores -->
          <div v-if="tabActiva === 'materias'" class="tab-panel">
            <div class="panel-header">
              <h3>📖 Materias del Curso</h3>
              <button class="btn-primary" @click="abrirModalNota">➕ Cargar Nota</button>
            </div>
            
            <div class="materias-grid">
              <div v-for="materia in materiasCurso" :key="materia.id" class="materia-card">
                <div class="materia-header">
                  <h4>{{ materia.nombre }}</h4>
                </div>
                
                <div class="materia-profesor">
                  <strong>Profesor:</strong> 
                  {{ materia.nombre_profesor }} {{ materia.apellido_profesor }}
                  <div class="especialidad">{{ materia.especialidad_profesor }}</div>
                </div>
                
                <div class="materia-actions">
                  <button @click="verPlanificacionMateria(materia)" class="btn-primary">
                    📋 Ver Planificación
                  </button>
                  <button @click="subirPlanificacion(materia)" class="btn-secondary">
                    ⬆️ Subir Planificación
                  </button>
                  <button @click="irANotasMateria(materia)" class="btn-primary">
                    📝 Notas
                  </button>
                  <button @click="abrirEncuestaMateria(materia)" class="btn-primary">
                    🧾 Encuesta
                  </button>
                </div>
                
                <div v-if="materia.planificacion" class="planificacion-info">
                  <div class="planificacion-estado" :class="`estado-${materia.planificacion.estado}`">
                    {{ materia.planificacion.estado }}
                  </div>
                  <div class="planificacion-fecha">
                    Actualizado: {{ formatDate(materia.planificacion.fecha_actualizacion) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pestaña 3: Planificaciones DAI -->
          <div v-if="tabActiva === 'dai'" class="tab-panel">
            <div class="panel-header">
              <h3>🧠 Sugerencias DAI para el Curso</h3>
            </div>
            <div class="acciones">
              <button class="btn-primary" @click="abrirModalActaSec">Registrar reunión</button>
            </div>
            
            <div class="dai-recomendaciones">
              <div v-for="recomendacion in recomendacionesDAI" :key="recomendacion.id" class="recomendacion-card">
                <div class="recomendacion-header">
                  <h4>{{ recomendacion.titulo }}</h4>
                  <span class="prioridad" :class="`prioridad-${recomendacion.prioridad}`">
                    {{ recomendacion.prioridad }}
                  </span>
                </div>
                
                <div class="recomendacion-content">
                  <p>{{ recomendacion.descripcion }}</p>
                  
                  <div v-if="recomendacion.alumnos_afectados" class="alumnos-afectados">
                    <strong>Alumnos afectados:</strong>
                    <div class="alumnos-list">
                      <span v-for="alumnoId in recomendacion.alumnos_afectados" :key="alumnoId"
                            class="alumno-chip">
                        {{ getNombreAlumno(alumnoId) }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="recomendacion-actions">
                    <button @click="aplicarRecomendacion(recomendacion)" class="btn-primary">
                      ✅ Aplicar Recomendación
                    </button>
                    <button @click="adaptarRecomendacion(recomendacion)" class="btn-secondary">
                      ✏️ Adaptar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="mostrarModalActaSec" class="modal-backdrop">
              <div class="modal">
                <div class="modal-header">
                  <h3>Acta de reunión</h3>
                </div>
                <div class="modal-body">
                  <div class="form-row">
                    <label>Título</label>
                    <input v-model="actaFormSec.titulo" class="input" placeholder="Ej: Consejo de curso" />
                  </div>
                  <div class="form-row">
                    <label>Fecha</label>
                    <input v-model="actaFormSec.fecha" type="date" class="input" />
                  </div>
                  <div class="form-row">
                    <label>Asistentes</label>
                    <input v-model="actaFormSec.asistentes" class="input" placeholder="Nombres de asistentes" />
                  </div>
                  <div class="form-row">
                    <label>Temas tratados</label>
                    <textarea v-model="actaFormSec.temas" class="input" rows="3"></textarea>
                  </div>
                  <div class="form-row">
                    <label>Acuerdos</label>
                    <textarea v-model="actaFormSec.acuerdos" class="input" rows="3"></textarea>
                  </div>
                  <div class="form-row">
                    <label>Acciones</label>
                    <textarea v-model="actaFormSec.acciones" class="input" rows="2"></textarea>
                  </div>
                  <div class="form-row">
                    <label>Observaciones</label>
                    <textarea v-model="actaFormSec.observaciones" class="input" rows="2"></textarea>
                  </div>
                </div>
                <div class="modal-actions">
                  <button class="btn-secondary" @click="cerrarModalActaSec">Cancelar</button>
                  <button class="btn-primary" :disabled="!actaFormSec.titulo" @click="guardarActaSec">Guardar</button>
                </div>
              </div>
            </div>
            <div v-if="actasCursoSec.length" class="actas-list">
              <h4>Actas registradas</h4>
              <div v-for="a in actasCursoSec" :key="a.id" class="acta-item">
                <div class="acta-title">{{ a.titulo }} - {{ formatDate(a.fecha) }}</div>
                <div class="acta-summary">{{ a.temas }}</div>
                <div class="item-actions">
                  <button class="btn-primary xsmall" @click="exportarActaSecPDF(a)">Exportar PDF</button>
                </div>
              </div>
            </div>

            <div v-if="mostrarModalSubirPlanif" class="modal-overlay" @click="cerrarModalSubirPlanif">
              <div class="modal-content" @click.stop>
                <div class="modal-header">
                  <h3>Subir planificación PDF</h3>
                  <button class="btn-close" @click="cerrarModalSubirPlanif">&times;</button>
                </div>
                <div class="form-row">
                  <label>Alumno</label>
                  <select v-model="alumnoParaSubirId" class="input">
                    <option :value="''">Selecciona un alumno</option>
                    <option v-for="a in alumnosCurso" :key="a.id" :value="a.id">{{ a.nombre }} {{ a.apellido }}</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>Archivo PDF</label>
                  <input type="file" accept="application/pdf" class="input" @change="onPlanifFileChange" />
                </div>
                <div class="acciones">
                  <button class="btn-secondary" @click="cerrarModalSubirPlanif">Cancelar</button>
                  <button class="btn-primary" :disabled="!alumnoParaSubirId || !archivoPlanif" @click="subirPlanificacionPDF">Subir</button>
                </div>
              </div>
            </div>

            <div v-if="mostrarModalNota" class="modal-overlay" @click="cerrarModalNota">
              <div class="modal-content" @click.stop>
                <div class="modal-header">
                  <h3>Cargar Nota</h3>
                  <button class="btn-close" @click="cerrarModalNota">&times;</button>
                </div>
                <div class="form-row">
                  <label>Alumno</label>
                  <select v-model="alumnoNotaId" class="input">
                    <option :value="''">Selecciona un alumno</option>
                    <option v-for="a in alumnosCurso" :key="a.id" :value="a.id">{{ a.nombre }} {{ a.apellido }}</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>Materia</label>
                  <select v-model="materiaNotaId" class="input">
                    <option :value="''">Selecciona materia</option>
                    <option v-for="m in materiasCurso" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>Nota (0–10)</label>
                  <input type="number" min="0" max="10" step="0.01" v-model.number="notaValor" class="input" />
                </div>
                <div class="form-row">
                  <label>Descripción (opcional)</label>
                  <input type="text" v-model="notaDescripcion" class="input" />
                </div>
                <div class="acciones">
                  <button class="btn-secondary" @click="cerrarModalNota">Cancelar</button>
                  <button class="btn-primary" :disabled="!puedeGuardarNota" @click="guardarNota">Guardar</button>
                </div>
              </div>
            </div>

            <div v-if="mostrarModalEncuesta" class="modal-overlay" @click="cerrarEncuestaMateria">
              <div class="modal-content" @click.stop>
                <div class="modal-header">
                  <h3>Encuesta psicopedagógica</h3>
                  <button class="btn-close" @click="cerrarEncuestaMateria">&times;</button>
                </div>
                <div class="form-row">
                  <label>Alumno</label>
                  <select v-model="alumnoEncuestaId" class="input">
                    <option :value="''">Selecciona un alumno</option>
                    <option v-for="a in alumnosCurso" :key="a.id" :value="a.id">{{ a.nombre }} {{ a.apellido }}</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>Materia</label>
                  <select v-model="materiaEncuestaId" class="input">
                    <option :value="''">Selecciona materia</option>
                    <option v-for="m in materiasCurso" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>Fecha</label>
                  <input type="date" v-model="encuestaFecha" class="input" />
                </div>
                <div class="grid">
                  <div class="form-row">
                    <label>Atención y concentración</label>
                    <select v-model="encuestaRespuestas.atencion" class="input">
                      <option value="">Seleccionar</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <label>Comunicación y lenguaje</label>
                    <select v-model="encuestaRespuestas.comunicacion" class="input">
                      <option value="">Seleccionar</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <label>Interacción social</label>
                    <select v-model="encuestaRespuestas.interaccion" class="input">
                      <option value="">Seleccionar</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <label>Autonomía en tareas</label>
                    <select v-model="encuestaRespuestas.autonomia" class="input">
                      <option value="">Seleccionar</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <label>Regulación emocional</label>
                    <select v-model="encuestaRespuestas.regulacion" class="input">
                      <option value="">Seleccionar</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <label>Conducta adaptativa</label>
                    <select v-model="encuestaRespuestas.conducta" class="input">
                      <option value="">Seleccionar</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                </div>
                <div class="acciones">
                  <button class="btn-secondary" @click="cerrarEncuestaMateria">Cancelar</button>
                  <button class="btn-primary" :disabled="!alumnoEncuestaId || !(materiaEncuestaId || (materiaParaEncuesta && materiaParaEncuesta.id))" @click="guardarEncuestaMateria">Guardar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pestaña 4: Adaptaciones Finales -->
          <div v-if="tabActiva === 'adaptaciones'" class="tab-panel">
            <div class="panel-header">
              <h3>📋 Adaptaciones Curriculares Finales</h3>
              <button @click="nuevaAdaptacion" class="btn-primary">➕ Nueva Adaptación</button>
            </div>
            
            <div class="adaptaciones-list">
              <div v-for="adaptacion in adaptacionesCurso" :key="adaptacion.id" class="adaptacion-card">
                <div class="adaptacion-header">
                  <h4>{{ adaptacion.materia_nombre }}</h4>
                  <span class="adaptacion-estado" :class="`estado-${adaptacion.estado}`">
                    {{ adaptacion.estado }}
                  </span>
                </div>
                
                <div class="adaptacion-content">
                  <p><strong>Objetivo:</strong> {{ adaptacion.objetivo }}</p>
                  <p><strong>Estrategias:</strong> {{ adaptacion.estrategias }}</p>
                  
                  <div class="adaptacion-alumnos">
                    <strong>Alumnos objetivo:</strong>
                    <div class="alumnos-objetivo">
                      <span v-for="alumnoId in adaptacion.alumnos_objetivo" :key="alumnoId"
                            class="alumno-chip">
                        {{ getNombreAlumno(alumnoId) }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="adaptacion-actions">
                  <button @click="editarAdaptacion(adaptacion)" class="btn-edit">✏️ Editar</button>
                  <button @click="verAdaptacion(adaptacion)" class="btn-view">👁️ Ver</button>
                  <button @click="exportarAdaptacion(adaptacion)" class="btn-export">📄 PDF</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver alumno -->
    <div v-if="mostrarModalAlumno" class="modal-overlay" @click="cerrarModalAlumno">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Perfil de {{ alumnoSeleccionado?.nombre }} {{ alumnoSeleccionado?.apellido }}</h3>
          <button @click="cerrarModalAlumno" class="btn-close">&times;</button>
        </div>
        <!-- Contenido del modal de alumno -->
      </div>
    </div>
  </div>
  <MateriaModal
    :visible="mostrarModalMateriaCompleto"
    :alumno="alumnoParaMateriaCompleto"
    @close="mostrarModalMateriaCompleto = false"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import MateriaModal from '../components/MateriaModal.vue'

const router = useRouter()

// Estado reactivo
const cursosSecundario = ref([])
const cursoSeleccionado = ref(null)
const alumnosCurso = ref([])
const materiasCurso = ref([])
const recomendacionesDAI = ref([])
const mostrarModalActaSec = ref(false)
const actasCursoSec = ref([])
const actaFormSec = ref({ titulo: '', fecha: new Date().toISOString().slice(0,10), asistentes: '', temas: '', acuerdos: '', acciones: '', observaciones: '' })
const adaptacionesCurso = ref([])
const tabActiva = ref('alumnos')
const alumnoSeleccionado = ref(null)
const mostrarModalAlumno = ref(false)
const mostrarModalCurso = ref(false)
const nuevoCurso = ref({ nombre: '', grado: 1, turno: 'Mañana', colegio_id: null })
const modoEdicion = ref(false)
const cursoEditando = ref(null)

// Tabs disponibles
const tabs = ref([
  { id: 'alumnos', nombre: 'Lista de Alumnos', icon: '👨‍🎓' },
  { id: 'materias', nombre: 'Materias y Profesores', icon: '📖' },
  { id: 'dai', nombre: 'Psicopedagoga y DAI', icon: '' },
  { id: 'adaptaciones', nombre: 'Adaptaciones Finales', icon: '📋' }
])

// Configurar headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
}

// Cargar datos iniciales
const cargarCursosSecundario = async () => {
  try {
    const response = await axios.get('/api/cursos?nivel=Secundario', getAuthHeaders())
    cursosSecundario.value = response.data.map(curso => ({
      ...curso,
      cantidad_alumnos: Math.floor(Math.random() * 30) + 10 // Simular cantidad de alumnos
    }))
  } catch (error) {
    console.error('Error cargando cursos secundario:', error)
    // Datos de ejemplo para desarrollo
    cursosSecundario.value = [
      {
        id: 1,
        nombre: '1° Año - División A',
        grado: 1,
        turno: 'Mañana',
        nombre_colegio: 'Colegio Secundario Modelo',
        cantidad_alumnos: 25
      },
      {
        id: 2,
        nombre: '1° Año - División B',
        grado: 1,
        turno: 'Tarde',
        nombre_colegio: 'Colegio Secundario Modelo',
        cantidad_alumnos: 28
      },
      {
        id: 3,
        nombre: '2° Año - División A',
        grado: 2,
        turno: 'Mañana',
        nombre_colegio: 'Colegio Secundario Modelo',
        cantidad_alumnos: 22
      }
    ]
  }
}

const abrirModalCurso = () => {
  nuevoCurso.value = { nombre: '', grado: 1, turno: 'Mañana', colegio_id: null }
  modoEdicion.value = false
  cursoEditando.value = null
  mostrarModalCurso.value = true
}

const cerrarModalCurso = () => {
  mostrarModalCurso.value = false
  modoEdicion.value = false
  cursoEditando.value = null
}

const crearCurso = async () => {
  try {
    const payload = {
      nombre: nuevoCurso.value.nombre,
      descripcion: null,
      nivel: 'Secundario',
      grado: nuevoCurso.value.grado,
      turno: nuevoCurso.value.turno,
      capacidad_maxima: 30,
      colegio_id: nuevoCurso.value.colegio_id || null
    }
    const res = await axios.post('/api/cursos', payload, getAuthHeaders())
    if (res.status === 201) {
      await cargarCursosSecundario()
      cerrarModalCurso()
    }
  } catch (err) {
    console.error('Error creando curso:', err)
    // Fallback local: agregar a la lista para seguir trabajando
    cursosSecundario.value.unshift({
      id: Date.now(),
      nombre: nuevoCurso.value.nombre,
      grado: nuevoCurso.value.grado,
      turno: nuevoCurso.value.turno,
      nombre_colegio: '-',
      cantidad_alumnos: Math.floor(Math.random() * 30) + 10
    })
    cerrarModalCurso()
  }
}

const editarCurso = (curso) => {
  modoEdicion.value = true
  cursoEditando.value = { ...curso }
  nuevoCurso.value = {
    nombre: curso.nombre || '',
    grado: Number(curso.grado) || 1,
    turno: curso.turno || 'Mañana',
    colegio_id: curso.colegio_id || null
  }
  mostrarModalCurso.value = true
}

const guardarEdicionCurso = async () => {
  if (!cursoEditando.value) return
  try {
    const payload = {
      nombre: nuevoCurso.value.nombre,
      descripcion: null,
      nivel: 'Secundario',
      grado: nuevoCurso.value.grado,
      turno: nuevoCurso.value.turno,
      capacidad_maxima: 30,
      colegio_id: nuevoCurso.value.colegio_id || null
    }
    const res = await axios.put(`/api/cursos/${cursoEditando.value.id}` , payload, getAuthHeaders())
    if (res.status === 200) {
      await cargarCursosSecundario()
      cerrarModalCurso()
    }
  } catch (err) {
    console.error('Error editando curso:', err)
    // Fallback local: actualizar en memoria
    const idx = cursosSecundario.value.findIndex(c => c.id === cursoEditando.value.id)
    if (idx !== -1) {
      cursosSecundario.value[idx] = {
        ...cursosSecundario.value[idx],
        nombre: nuevoCurso.value.nombre,
        grado: nuevoCurso.value.grado,
        turno: nuevoCurso.value.turno
      }
    }
    cerrarModalCurso()
  }
}

const eliminarCursoConfirm = async (curso) => {
  const ok = window.confirm(`¿Eliminar el curso "${curso.nombre}"?`)
  if (!ok) return
  await eliminarCurso(curso)
}

const eliminarCurso = async (curso) => {
  try {
    const res = await axios.delete(`/api/cursos/${curso.id}`, getAuthHeaders())
    if (res.status === 200) {
      await cargarCursosSecundario()
      if (cursoSeleccionado.value?.id === curso.id) {
        cursoSeleccionado.value = null
      }
    }
  } catch (err) {
    console.error('Error eliminando curso:', err)
    // Fallback local: eliminar de la lista
    cursosSecundario.value = cursosSecundario.value.filter(c => c.id !== curso.id)
    if (cursoSeleccionado.value?.id === curso.id) {
      cursoSeleccionado.value = null
    }
  }
}

const seleccionarCurso = async (curso) => {
  cursoSeleccionado.value = curso
  tabActiva.value = 'alumnos'
  
  // Cargar datos del curso seleccionado
  await Promise.all([
    cargarAlumnosCurso(curso.id),
    cargarMateriasCurso(curso.id),
    cargarRecomendacionesDAI(curso.id),
    cargarAdaptacionesCurso(curso.id)
  ])
  await cargarActasCursoSec()
}

const cargarAlumnosCurso = async (cursoId) => {
  try {
    // Simular carga de alumnos
    alumnosCurso.value = [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '40123456',
        fecha_nacimiento: '2008-05-15',
        genero: 'Masculino',
        email: 'juan.perez@colegio.com',
        telefono: '123-456-7890',
        diagnosticos: [
          { id: 1, tipo_evaluacion: 'Evaluación Psicopedagógica', diagnostico: 'Dificultad en atención' },
          { id: 2, tipo_evaluacion: 'Evaluación Conductual', diagnostico: 'Ansiedad moderada' }
        ]
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'González',
        dni: '40987654',
        fecha_nacimiento: '2008-08-20',
        genero: 'Femenino',
        email: 'maria.gonzalez@colegio.com',
        telefono: '123-456-7891',
        diagnosticos: []
      }
    ]
  } catch (error) {
    console.error('Error cargando alumnos:', error)
  }
}

const cargarMateriasCurso = async (cursoId) => {
  try {
    // Simular carga de materias
    materiasCurso.value = [
      {
        id: 1,
        nombre: 'Matemáticas',
        nombre_profesor: 'Carlos',
        apellido_profesor: 'Rodríguez',
        especialidad_profesor: 'Matemáticas',
        horarios: ['Lunes 08:00-09:30', 'Miércoles 08:00-09:30'],
        planificacion: {
          estado: 'Completado',
          fecha_actualizacion: '2024-01-15'
        }
      },
      {
        id: 2,
        nombre: 'Lengua y Literatura',
        nombre_profesor: 'Ana',
        apellido_profesor: 'Martínez',
        especialidad_profesor: 'Lengua',
        horarios: ['Martes 10:00-11:30', 'Jueves 10:00-11:30'],
        planificacion: {
          estado: 'Pendiente',
          fecha_actualizacion: '2024-01-10'
        }
      }
    ]
  } catch (error) {
    console.error('Error cargando materias:', error)
  }
}

const cargarRecomendacionesDAI = async (cursoId) => {
  try {
    // Simular recomendaciones DAI
    recomendacionesDAI.value = [
      {
        id: 1,
        titulo: 'Adaptación metodológica para TDAH',
        descripcion: 'Implementar breaks cortos cada 20 minutos y usar material visual',
        prioridad: 'Alta',
        alumnos_afectados: [1],
        materia_id: 1
      },
      {
        id: 2,
        titulo: 'Refuerzo positivo para ansiedad',
        descripcion: 'Establecer sistema de recompensas y reducir presión en evaluaciones',
        prioridad: 'Media',
        alumnos_afectados: [1, 2],
        materia_id: null
      }
    ]
  } catch (error) {
    console.error('Error cargando recomendaciones DAI:', error)
  }
}

const cargarAdaptacionesCurso = async (cursoId) => {
  try {
    // Simular adaptaciones
    adaptacionesCurso.value = [
      {
        id: 1,
        materia_nombre: 'Matemáticas',
        objetivo: 'Facilitar comprensión de conceptos abstractos',
        estrategias: 'Uso de material concreto y ejemplos de la vida real',
        alumnos_objetivo: [1],
        estado: 'Implementado'
      }
    ]
  } catch (error) {
    console.error('Error cargando adaptaciones:', error)
  }
}

// Métodos de utilidad
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

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const getNombreAlumno = (alumnoId) => {
  const alumno = alumnosCurso.value.find(a => a.id === alumnoId)
  return alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno no encontrado'
}

// Métodos de interfaz
const verAlumno = (alumno) => {
  // Navegar al detalle del alumno
  router.push(`/menu/alumno/${alumno.id}`)
}

const cerrarModalAlumno = () => {
  mostrarModalAlumno.value = false
  alumnoSeleccionado.value = null
}

const verDiagnosticos = (alumno) => {
  router.push(`/alumno/${alumno.id}/diagnosticos`)
}

const verPlanificaciones = (alumno) => {
  router.push(`/alumno/${alumno.id}/planificaciones`)
}

const verPlanificacionMateria = (materia) => {
  if (!materia?.id) return
  router.push({ path: '/menu/simple-notas', query: { materiaId: materia.id } })
}

const subirPlanificacion = (materia) => {
  materiaParaSubir.value = materia
  alumnoParaSubirId.value = ''
  archivoPlanif.value = null
  mostrarModalSubirPlanif.value = true
}

const aplicarRecomendacion = (recomendacion) => {
  console.log('Aplicar recomendación:', recomendacion.titulo)
}

const adaptarRecomendacion = (recomendacion) => {
  console.log('Adaptar recomendación:', recomendacion.titulo)
}

const nuevaAdaptacion = () => {
  console.log('Nueva adaptación curricular')
}

const exportarListaAlumnos = () => {
  console.log('Exportar lista de alumnos')
}

const abrirModalActaSec = () => {
  mostrarModalActaSec.value = true
  actaFormSec.value = { titulo: '', fecha: new Date().toISOString().slice(0,10), asistentes: '', temas: '', acuerdos: '', acciones: '', observaciones: '' }
}
const cerrarModalActaSec = () => { mostrarModalActaSec.value = false }
const guardarActaSec = async () => {
  if (!cursoSeleccionado.value?.id || !actaFormSec.value.titulo) return
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('/api/actas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ curso_id: cursoSeleccionado.value.id, fecha: actaFormSec.value.fecha, titulo: actaFormSec.value.titulo, asistentes: actaFormSec.value.asistentes, temas: actaFormSec.value.temas, acuerdos: actaFormSec.value.acuerdos, acciones: actaFormSec.value.acciones, observaciones: actaFormSec.value.observaciones })
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const saved = await res.json()
    actasCursoSec.value.unshift(saved)
    mostrarModalActaSec.value = false
  } catch {}
}
const cargarActasCursoSec = async () => {
  if (!cursoSeleccionado.value?.id) return
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`/api/actas?curso_id=${cursoSeleccionado.value.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
    if (!res.ok) return
    const data = await res.json()
    actasCursoSec.value = Array.isArray(data) ? data : []
  } catch {}
}

const exportarActaSecPDF = (acta) => {
  try {
    const nombreCurso = cursoSeleccionado.value?.nombre || '-'
    const fecha = acta?.fecha ? new Date(acta.fecha).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR')
    console.log('Exportar PDF (Secundario)', { curso: nombreCurso, titulo: acta?.titulo, id: acta?.id })
    const partes = []
    partes.push('<html>')
    partes.push('<body style="font-family: Arial, sans-serif; margin: 40px;">')
    partes.push('<div style="text-align: center; margin-bottom: 20px;">')
    partes.push('<div style="color:#111827; font-size:22px; font-weight:bold;">Acta de reunión</div>')
    partes.push('<div style="color:#374151; margin-top:6px;">Curso: ' + nombreCurso + '</div>')
    partes.push('<div style="color:#374151; margin-top:6px;">Fecha: ' + fecha + '</div>')
    partes.push('</div>')
    partes.push('<div style="background:#f3f4f6; padding:12px; border-radius:6px; margin:16px 0;">')
    partes.push('<span style="font-weight:bold; color:#374151;">Título:</span> ' + (acta?.titulo || ''))
    partes.push('</div>')
    const box = (txt) => '<div style="background:#fff; border:1px solid #d1d5db; border-radius:6px; padding:12px; margin-top:6px; white-space: pre-wrap;">' + (txt || '') + '</div>'
    partes.push('<div style="margin-top:14px;"><div style="font-weight:bold; color:#374151;">Asistentes</div>' + box(acta?.asistentes) + '</div>')
    partes.push('<div style="margin-top:14px;"><div style="font-weight:bold; color:#374151;">Temas tratados</div>' + box(acta?.temas) + '</div>')
    partes.push('<div style="margin-top:14px;"><div style="font-weight:bold; color:#374151;">Acuerdos</div>' + box(acta?.acuerdos) + '</div>')
    partes.push('<div style="margin-top:14px;"><div style="font-weight:bold; color:#374151;">Acciones</div>' + box(acta?.acciones) + '</div>')
    partes.push('<div style="margin-top:14px;"><div style="font-weight:bold; color:#374151;">Observaciones</div>' + box(acta?.observaciones) + '</div>')
    partes.push('<div style="margin-top:26px; text-align:right; font-size:12px; color:#6b7280;">Generado: ' + new Date().toLocaleString('es-AR') + '</div>')
    partes.push('</body></html>')
    const contenido = partes.join('')
    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(contenido)
    win.document.close()
    console.log('PDF listo para imprimir (Secundario)', { fecha: new Date().toISOString() })
    setTimeout(() => win.print(), 250)
  } catch {}
}

const irANotasMateria = (materia) => {
  if (!materia || !materia.id) return
  router.push({ path: '/menu/calificaciones', query: { asignaturaId: materia.id } })
}

const mostrarModalSubirPlanif = ref(false)
const materiaParaSubir = ref(null)
const alumnoParaSubirId = ref('')
const archivoPlanif = ref(null)
const onPlanifFileChange = (e) => {
  const f = e.target.files?.[0]
  archivoPlanif.value = f || null
}
const cerrarModalSubirPlanif = () => {
  mostrarModalSubirPlanif.value = false
  materiaParaSubir.value = null
  alumnoParaSubirId.value = ''
  archivoPlanif.value = null
}
const subirPlanificacionPDF = async () => {
  try {
    if (!materiaParaSubir.value?.id || !alumnoParaSubirId.value || !archivoPlanif.value) return
    const fd = new FormData()
    fd.append('file', archivoPlanif.value)
    const token = localStorage.getItem('token')
    await axios.post(`/api/alumnos/${alumnoParaSubirId.value}/materias/${materiaParaSubir.value.id}/planificaciones`, fd, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
    })
    cerrarModalSubirPlanif()
    alert('PDF subido correctamente')
  } catch (err) {
    alert(err?.response?.data?.error || 'No se pudo subir el PDF')
  }
}

const mostrarModalNota = ref(false)
const alumnoNotaId = ref('')
const materiaNotaId = ref('')
const notaValor = ref(null)
const notaDescripcion = ref('')
const abrirModalNota = () => {
  alumnoNotaId.value = ''
  materiaNotaId.value = ''
  notaValor.value = null
  notaDescripcion.value = ''
  mostrarModalNota.value = true
}
const cerrarModalNota = () => { mostrarModalNota.value = false }
const puedeGuardarNota = computed(() => !!alumnoNotaId.value && !!materiaNotaId.value && notaValor.value !== null && !Number.isNaN(Number(notaValor.value)))
const guardarNota = async () => {
  if (!puedeGuardarNota.value) return
  const token = localStorage.getItem('token')
  try {
    await axios.post(`/api/alumnos/${alumnoNotaId.value}/notas`, {
      materia_id: materiaNotaId.value,
      nota: Number(notaValor.value),
      descripcion: (notaDescripcion.value || null)
    }, { headers: { 'Authorization': `Bearer ${token}` } })
    mostrarModalNota.value = false
    alert('Nota guardada')
  } catch (err) {
    alert(err?.response?.data?.error || 'No se pudo guardar la nota')
  }
}

const nuevoDiagTipo = ref({})
const nuevoDiagTexto = ref({})
const agregarDiagnosticoAlumno = async (alumno) => {
  const tipo = (nuevoDiagTipo.value[alumno.id] || '').trim()
  const texto = (nuevoDiagTexto.value[alumno.id] || '').trim()
  if (!tipo && !texto) return
  const token = localStorage.getItem('token')
  try {
    const { data } = await axios.post(`/api/alumnos/${alumno.id}/diagnosticos`, { tipo_evaluacion: tipo || null, diagnostico: texto || null }, { headers: { 'Authorization': `Bearer ${token}` } })
    alumno.diagnosticos = [data, ...(alumno.diagnosticos || [])]
    nuevoDiagTipo.value[alumno.id] = ''
    nuevoDiagTexto.value[alumno.id] = ''
  } catch {}
}
const eliminarDiagnosticoAlumno = async (alumno, diag) => {
  const token = localStorage.getItem('token')
  try {
    await axios.delete(`/api/alumnos/${alumno.id}/diagnosticos/${diag.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
    alumno.diagnosticos = (alumno.diagnosticos || []).filter(d => d.id !== diag.id)
  } catch {}
}

const mostrarModalEncuesta = ref(false)
const materiaParaEncuesta = ref(null)
const alumnoEncuestaId = ref('')
const encuestaFecha = ref(new Date().toISOString().slice(0,10))
const materiaEncuestaId = ref('')
const encuestaRespuestas = ref({
  atencion: '',
  comunicacion: '',
  interaccion: '',
  autonomia: '',
  regulacion: '',
  conducta: ''
})
const abrirEncuestaMateria = (materia) => {
  materiaParaEncuesta.value = materia
  alumnoEncuestaId.value = ''
  materiaEncuestaId.value = materia?.id ? String(materia.id) : ''
  encuestaFecha.value = new Date().toISOString().slice(0,10)
  encuestaRespuestas.value = { atencion:'', comunicacion:'', interaccion:'', autonomia:'', regulacion:'', conducta:'' }
  mostrarModalEncuesta.value = true
}
const cerrarEncuestaMateria = () => {
  mostrarModalEncuesta.value = false
  materiaParaEncuesta.value = null
}
const abrirEncuestaAlumno = (alumno) => {
  materiaParaEncuesta.value = null
  alumnoEncuestaId.value = alumno?.id ? String(alumno.id) : ''
  materiaEncuestaId.value = ''
  encuestaFecha.value = new Date().toISOString().slice(0,10)
  encuestaRespuestas.value = { atencion:'', comunicacion:'', interaccion:'', autonomia:'', regulacion:'', conducta:'' }
  mostrarModalEncuesta.value = true
}
const guardarEncuestaMateria = async () => {
  try {
    const mid = materiaEncuestaId.value || (materiaParaEncuesta.value?.id ? String(materiaParaEncuesta.value.id) : '')
    if (!mid || !alumnoEncuestaId.value) return
    const token = localStorage.getItem('token')
    const payload = {
      materia_id: mid,
      atencion: encuestaRespuestas.value.atencion,
      comunicacion: encuestaRespuestas.value.comunicacion,
      interaccion: encuestaRespuestas.value.interaccion,
      autonomia: encuestaRespuestas.value.autonomia,
      regulacion: encuestaRespuestas.value.regulacion,
      conducta: encuestaRespuestas.value.conducta,
      fecha: encuestaFecha.value
    }
    await axios.post(`/api/alumnos/${alumnoEncuestaId.value}/encuestas/psico`, payload, { headers: { 'Authorization': `Bearer ${token}` } })
    mostrarModalEncuesta.value = false
    alert('Encuesta guardada')
  } catch (err) {
    alert('No se pudo guardar la encuesta')
  }
}

// Inicialización
onMounted(() => {
  cargarCursosSecundario()
})

// Modal de Materias/Notas unificado
const mostrarModalMateriaCompleto = ref(false)
const alumnoParaMateriaCompleto = ref(null)
const abrirModalMateriaCompleto = (alumno) => {
  alumnoParaMateriaCompleto.value = alumno
  mostrarModalMateriaCompleto.value = true
}
</script>

<style scoped>
.nivel-container {
  padding: 20px;
  max-width: 1400px;
  margin: auto;
}

.nivel-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  text-align: center;
}

.nivel-header h1 {
  margin: 0;
  font-size: 2.5em;
}

.breadcrumb {
  margin-top: 10px;
  opacity: 0.9;
}

.breadcrumb a {
  color: white;
  text-decoration: none;
}

.seleccion-curso {
  background: white;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 25px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.seleccion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cursos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.curso-card {
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.curso-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,123,255,0.1);
}

.curso-card.active {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.curso-icon {
  font-size: 2em;
}

.curso-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.curso-info p {
  margin: 0 0 5px 0;
  color: #666;
}

.alumnos-count {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.curso-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.contenido-principal {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.curso-info-panel {
  padding: 25px;
  border-bottom: 1px solid #e9ecef;
  color: #212529;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #212529;
}

.curso-stats {
  display: flex;
  gap: 20px;
}

.stat {
  background: #f8f9fa;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  color: #212529;
}

.tabs-container {
  padding: 0;
}

.tabs-header {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.tab-button {
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  background: #e9ecef;
}

.tab-button.active {
  background: white;
  border-bottom-color: #007bff;
  color: #007bff;
}

.tab-content {
  padding: 25px;
  color: #212529;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
  color: #212529;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
  color: #212529;
}

/* Estilos para tablas */
.alumnos-table {
  overflow-x: auto;
}

.alumnos-table table {
  width: 100%;
  border-collapse: collapse;
}

.alumnos-table th,
.alumnos-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.alumnos-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.alumno-info {
  font-size: 12px;
  color: #666;
}

.diagnosticos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.diagnostico-chip {
  background: #17a2b8;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.mas-diagnosticos {
  background: #6c757d;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.sin-diagnosticos {
  color: #6c757d;
  font-style: italic;
}

.acciones {
  display: flex;
  gap: 5px;
}

.acciones button {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.btn-view { background: #17a2b8; color: white; }
.btn-info { background: #6f42c1; color: white; }
.btn-edit { background: #ffc107; color: #212529; }

/* Estilos para cards de materias */
.materias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.materia-card {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  background: white;
  /* Asegurar texto visible sobre fondo blanco */
  color: #212529;
}

.materia-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.materia-header h4 {
  /* Forzar color de título para evitar herencias que lo pongan en blanco */
  color: #212529;
}

.horario-info {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.materia-profesor {
  margin-bottom: 15px;
}

.especialidad {
  font-size: 12px;
  color: #666;
}

.materia-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.planificacion-info {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 12px;
}

.planificacion-estado {
  font-weight: 600;
}

.estado-Completado { color: #28a745; }
.estado-Pendiente { color: #ffc107; }

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

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
}

/* Botones generales */
.btn-primary {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-export {
  background: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.small {
  padding: 6px 10px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .nivel-container {
    padding: 10px;
  }
  
  .cursos-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs-header {
    flex-direction: column;
  }
  
  .materias-grid {
    grid-template-columns: 1fr;
  }
  
  .materia-actions {
    flex-direction: column;
  }
  
  .info-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .curso-stats {
    flex-wrap: wrap;
  }
}
/* Texto en negro para paneles y tarjetas */
.dai-recomendaciones,
.recomendacion-card,
.adaptaciones-list,
.adaptacion-card {
  color: #212529;
}
</style>
