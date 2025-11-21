<template>
    <div class="nivel-container">
      <!-- Header del nivel -->
      <div class="nivel-header">
        <h1>📚 Nivel Primario</h1>
        <div class="breadcrumb">
          <router-link to="/menu">Menu</router-link> / Primario
        </div>
      </div>
  
      <!-- Selección de curso (formato unificado) -->
      <div class="seleccion-curso">
        <div class="seleccion-header">
          <h2>Seleccionar Curso/División</h2>
          <button class="btn-primary" @click="abrirModalCurso">➕ Crear Curso</button>
        </div>
      <div class="cursos-grid">
        <div v-for="grado in gradosPrimario" :key="grado.id" 
             class="curso-card" 
             :class="{ active: gradoSeleccionado?.id === grado.id }"
              @click="seleccionarGrado(grado)">
          <div class="curso-icon">📚</div>
          <div class="curso-info">
            <h3>{{ grado.nombre }}</h3>
            <p>{{ grado.grado }}° Grado - {{ grado.turno }}</p>
            <span class="alumnos-count">{{ grado.cantidad_alumnos }} estudiantes</span>
            <div class="curso-actions">
              <button class="btn-edit small" @click.stop="editarCurso(grado)" title="Editar">✏️ Editar</button>
              <button class="btn-danger small" @click.stop="eliminarCurso(grado)" title="Eliminar">🗑️ Eliminar</button>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal Crear Curso -->
      <div v-if="mostrarModalCurso" class="modal-overlay" @click="cerrarModalCurso">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ modoEdicion ? '✏️ Editar Curso (Primario)' : '➕ Crear Curso (Primario)' }}</h3>
            <button @click="cerrarModalCurso" class="btn-close">&times;</button>
          </div>
          <div class="form-row">
            <label>Nombre</label>
            <input v-model="nuevoCurso.nombre" class="input" placeholder="Ej: 1° Grado - División A" />
          </div>
          <div class="form-row">
            <label>Grado</label>
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
            <button class="btn-primary" @click="modoEdicion ? guardarCurso() : crearCurso()">{{ modoEdicion ? 'Guardar' : 'Crear' }}</button>
          </div>
        </div>
      </div>
    </div>
  
      <!-- Contenido principal cuando hay grado seleccionado -->
      <div v-if="gradoSeleccionado" class="contenido-principal">
        <!-- Información del grado -->
        <div class="curso-info-panel">
          <div class="info-header">
            <h2>{{ gradoSeleccionado.nombre }} - {{ gradoSeleccionado.grado }}° Grado</h2>
            <div class="curso-stats">
              <span class="stat">👨‍🎓 {{ estudiantesGrado.length }} estudiantes</span>
              <span class="stat">📖 {{ areasAprendizaje.length }} áreas</span>
            </div>
          </div>
        </div>
  
        <!-- Pestañas de funcionalidades específicas de Primario -->
        <div class="tabs-container">
          <div class="tabs-header">
            <button v-for="tab in tabsPrimario" :key="tab.id" 
                    class="tab-button" 
                    :class="{ active: tabActiva === tab.id }"
                    @click="tabActiva = tab.id">
              {{ tab.icon }} {{ tab.nombre }}
            </button>
          </div>
  
          <!-- Contenido de las pestañas -->
          <div class="tab-content">
            <!-- Pestaña 1: Lista de Estudiantes -->
            <div v-if="tabActiva === 'estudiantes'" class="tab-panel">
        <div class="panel-header">
          <h3>👨‍🎓 Lista de Estudiantes</h3>
          <div class="panel-actions">
            <button @click="exportarListaEstudiantes" class="btn-export">📄 Exportar</button>
            <button @click="abrirModalAlumnoPrimario(false)" class="btn-primary">➕ Agregar alumno</button>
          </div>
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
                    <tr v-for="(estudiante, index) in estudiantesGrado" :key="estudiante.id">
                      <td>{{ index + 1 }}</td>
                      <td>
                        <strong>{{ estudiante.nombre }} {{ estudiante.apellido }}</strong>
                        <div class="alumno-info">
                          DNI: {{ estudiante.dni }} | {{ estudiante.genero }}
                        </div>
                      </td>
                      <td>{{ calcularEdad(estudiante.fecha_nacimiento) }} años</td>
                      <td>
                        <div>{{ estudiante.email || '-' }}</div>
                        <div>{{ estudiante.telefono || '-' }}</div>
                      </td>
                      <td>
                        <div v-if="diagnosticosPorEstudiante[estudiante.id] && diagnosticosPorEstudiante[estudiante.id].length" class="diagnosticos-list">
                          <span v-for="diag in diagnosticosPorEstudiante[estudiante.id].slice(0,2)" :key="diag.id" class="diagnostico-chip" :title="diag.diagnostico">
                            {{ diag.tipo_evaluacion }}
                          </span>
                          <span v-if="diagnosticosPorEstudiante[estudiante.id].length > 2" class="mas-diagnosticos">+{{ diagnosticosPorEstudiante[estudiante.id].length - 2 }}</span>
                        </div>
                        <span v-else class="sin-diagnosticos">Sin diagnósticos</span>
                        
                      </td>
                      <td class="acciones">
                        <button @click="abrirEncuestaAlumnoPrimario(estudiante)" class="btn-add" title="Crear encuesta">🧾</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="mostrarModalEncuestaPrimario" class="modal-backdrop">
                  <div class="modal">
                    <div class="modal-header">
                      <h3>Encuesta psicopedagógica</h3>
                    </div>
                    <div class="modal-body">
                      <div class="form-row">
                        <label>Alumno</label>
                        <select v-model="alumnoEncuestaPrimarioId" class="input">
                          <option :value="''">Selecciona un alumno</option>
                          <option v-for="a in alumnosCurso" :key="a.id" :value="a.id">{{ a.nombre }} {{ a.apellido }}</option>
                        </select>
                      </div>
                      <div class="form-row">
                        <label>Materia</label>
                        <select v-model="materiaEncuestaPrimarioId" class="input">
                          <option :value="''">Selecciona materia</option>
                          <option v-for="m in materiasCurso" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                        </select>
                      </div>
                      <div class="form-row">
                        <label>Fecha</label>
                        <input type="date" v-model="encuestaFechaPrimario" class="input" />
                      </div>
                      <div class="grid">
                        <div class="form-row">
                          <label>Atención y concentración</label>
                          <select v-model="encuestaRespuestasPrimario.atencion" class="input">
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
                          <select v-model="encuestaRespuestasPrimario.comunicacion" class="input">
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
                          <select v-model="encuestaRespuestasPrimario.interaccion" class="input">
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
                          <select v-model="encuestaRespuestasPrimario.autonomia" class="input">
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
                          <select v-model="encuestaRespuestasPrimario.regulacion" class="input">
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
                          <select v-model="encuestaRespuestasPrimario.conducta" class="input">
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
                        <button class="btn-secondary" @click="mostrarModalEncuestaPrimario=false">Cancelar</button>
                        <button class="btn-primary" :disabled="!alumnoEncuestaPrimarioId || !materiaEncuestaPrimarioId" @click="guardarEncuestaPrimario">Guardar</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Pestaña 2: Materias y Profesores -->
            <div v-if="tabActiva === 'materias'" class="tab-panel">
              <div class="panel-header">
                <h3>MATERIAS</h3>
              </div>
              <div class="form-row">
                <label>Nombre</label>
                <input v-model="nuevaMateriaNombre" class="input" placeholder="Ej: Matemáticas" />
              </div>
              <div class="form-row">
                <label>Profesor (opcional)</label>
                <input v-model="nuevaMateriaDescripcion" class="input" placeholder="Ej: Prof. López" />
              </div>
              <div class="acciones">
                <button class="btn-primary" :disabled="!nuevaMateriaNombre" @click="crearMateriaCurso">Agregar Materia</button>
              </div>
              <div class="materias-grid">
                <div v-for="materia in materiasCurso" :key="materia.id" class="materia-card">
                  <div class="materia-header">
                    <h4>{{ materia.nombre }}</h4>
                    <span class="horario-info">📅 {{ materia.horarios?.length || 0 }} horarios</span>
                  </div>
                  <div class="materia-profesor">
                    <strong>Profesor:</strong> {{ materia.nombre_profesor }} {{ materia.apellido_profesor }}
                    <div class="especialidad">{{ materia.especialidad_profesor }}</div>
                  </div>
                  <div class="materia-actions">
                    <button @click="abrirModalMateriaCompleto({ id: 0, curso_id: gradoSeleccionado?.id })" class="btn-primary">📝 Notas</button>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <label>Agregar texto</label>
                <input v-model="nuevaObservacionCursoPrimario" class="input" placeholder="Escribe una nota rápida..." />
              </div>
              <div class="acciones">
                <button class="btn-secondary" :disabled="!(nuevaObservacionCursoPrimario && nuevaObservacionCursoPrimario.trim())" @click="agregarObservacionCursoPrimario">Agregar</button>
              </div>
              <div v-if="observacionesCursoPrimario.length" class="observaciones-list">
                <div v-for="(obs, i) in observacionesCursoPrimario" :key="i" class="observacion-item">
                  <span v-if="editObsIndexPrimario !== i">{{ obs }}</span>
                  <input v-else v-model="editObsTextPrimario" class="input" />
                  <div class="item-actions">
                    <button v-if="editObsIndexPrimario !== i" class="btn-edit small" @click="editarObservacionCursoPrimario(i, obs)">Modificar</button>
                    <button v-else class="btn-primary small" @click="guardarObservacionCursoPrimario(i)">Guardar</button>
                    <button v-if="editObsIndexPrimario === i" class="btn-secondary small" @click="cancelarEdicionObservacionCursoPrimario">Cancelar</button>
                    <button class="btn-danger small" @click="quitarObservacionCursoPrimario(i)">Quitar</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pestaña 3: Áreas de Aprendizaje -->
            <div v-if="tabActiva === 'areas'" class="tab-panel">
              <div class="panel-header">
                <h3>📖 Áreas Curriculares</h3>
                <button @click="nuevaPlanificacion" class="btn-primary">➕ Nueva Planificación</button>
              </div>
              
              <div class="areas-grid">
                <div v-for="area in areasAprendizaje" :key="area.id" class="area-card">
                  <div class="area-header">
                    <h4>{{ area.nombre }}</h4>
                    <span class="area-status" :class="`estado-${area.estado_planificacion}`">
                      {{ area.estado_planificacion }}
                    </span>
                  </div>
                  
                  <div class="area-content">
                    <div class="area-profesor">
                      <strong>Docente:</strong> {{ area.nombre_profesor }} {{ area.apellido_profesor }}
                    </div>
                    
                    <div class="area-horarios">
                      <strong>Horarios:</strong>
                      <div class="horarios-list">
                        <span v-for="horario in area.horarios" :key="horario" class="horario-chip">
                          {{ horario }}
                        </span>
                      </div>
                    </div>
                    
                  <div class="area-estadisticas">
                    <div class="estadistica">
                      <span class="valor">{{ area.promedio_grupo }}</span>
                      <span class="label">Promedio Grupo</span>
                    </div>
                    <div class="estadistica">
                      <span class="valor">{{ area.estudiantes_aprobados }}/{{ estudiantesGrado.length }}</span>
                      <span class="label">Aprobados</span>
                    </div>
                  </div>
                  
                  <div v-if="area.ultima_evaluacion" class="area-evaluacion">
                    <strong>Última evaluación:</strong> {{ area.ultima_evaluacion }}
                  </div>
                  <div v-if="area.comentario_docente" class="area-comentario">
                    <strong>Comentario de la docente:</strong> {{ area.comentario_docente }}
                  </div>
                </div>
                  
                  <div class="area-actions">
                    
                    <button @click="verResultadosArea(area)" class="btn-info">
                      📊 Resultados
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Pestaña 4: Sugerencias DAI -->
            <div v-if="tabActiva === 'dai'" class="tab-panel">
              <div class="panel-header">
                <h3>🧠 Sugerencias DAI</h3>
              </div>
              <div class="form-row">
                <label>Sugerencia</label>
                <input v-model="nuevaSugerenciaDAIPrimario" class="input" placeholder="Escribí una sugerencia..." />
              </div>
              <div class="acciones">
                <button class="btn-secondary" :disabled="!(nuevaSugerenciaDAIPrimario && nuevaSugerenciaDAIPrimario.trim())" @click="agregarSugerenciaDAIPrimario">Agregar</button>
                <button class="btn-primary" @click="abrirModalActaPrimario">Registrar reunión</button>
              </div>
              <div class="dai-recomendaciones">
                <div v-for="rec in recomendacionesDAI" :key="rec.id" class="recomendacion-card">
                  <div class="recomendacion-header">
                    <h4>{{ rec.titulo }}</h4>
                    <span class="prioridad" :class="`prioridad-${rec.prioridad}`">{{ rec.prioridad }}</span>
                  </div>
                  <div class="recomendacion-content">
                    <p>{{ rec.descripcion }}</p>
                    <div class="item-actions">
                      <button class="btn-danger xsmall" @click="quitarSugerenciaDAIPrimario(rec.id)">Quitar</button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="mostrarModalActaPrimario" class="modal-backdrop">
                <div class="modal">
                  <div class="modal-header">
                    <h3>Acta de reunión</h3>
                  </div>
                  <div class="modal-body">
                    <div class="form-row">
                      <label>Título</label>
                      <input v-model="actaFormPrimario.titulo" class="input" placeholder="Ej: Reunión con familia" />
                    </div>
                    <div class="form-row">
                      <label>Fecha</label>
                      <input v-model="actaFormPrimario.fecha" type="date" class="input" />
                    </div>
                    <div class="form-row">
                      <label>Asistentes</label>
                      <input v-model="actaFormPrimario.asistentes" class="input" placeholder="Nombres de asistentes" />
                    </div>
                    <div class="form-row">
                      <label>Temas tratados</label>
                      <textarea v-model="actaFormPrimario.temas" class="input" rows="3"></textarea>
                    </div>
                    <div class="form-row">
                      <label>Acuerdos</label>
                      <textarea v-model="actaFormPrimario.acuerdos" class="input" rows="3"></textarea>
                    </div>
                    <div class="form-row">
                      <label>Acciones</label>
                      <textarea v-model="actaFormPrimario.acciones" class="input" rows="2"></textarea>
                    </div>
                    <div class="form-row">
                      <label>Observaciones</label>
                      <textarea v-model="actaFormPrimario.observaciones" class="input" rows="2"></textarea>
                    </div>
                  </div>
                  <div class="modal-actions">
                    <button class="btn-secondary" @click="cerrarModalActaPrimario">Cancelar</button>
                    <button class="btn-primary" :disabled="!actaFormPrimario.titulo" @click="guardarActaPrimario">Guardar</button>
                  </div>
                </div>
              </div>
              <div v-if="actasCursoPrimario.length" class="actas-list">
                <h4>Actas registradas</h4>
                <div v-for="a in actasCursoPrimario" :key="a.id" class="acta-item">
                  <div class="acta-title">{{ a.titulo }} - {{ formatDate(a.fecha) }}</div>
                  <div class="acta-summary">{{ a.temas }}</div>
                  <div class="item-actions">
                    <button class="btn-primary xsmall" @click="exportarActaPrimarioPDF(a)">Exportar PDF</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pestaña 5: Adaptaciones Finales -->
            <div v-if="tabActiva === 'adaptaciones'" class="tab-panel">
              <div class="panel-header">
                <h3>📋 Adaptaciones Finales</h3>
              </div>
              <div class="adaptaciones-grid">
                <div v-for="adap in adaptacionesCurriculares" :key="adap.id" class="adaptacion-card">
                  <div class="adaptacion-header">
                    <h4>{{ adap.titulo }}</h4>
                    <span class="estado">{{ adap.estado }}</span>
                  </div>
                  <div class="adaptacion-content">
                    <p>{{ adap.objetivo }}</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
      </div>
    </div>
  </div>
  <div v-if="mostrarModalAlumnoPrimario" class="modal-overlay" @click="cerrarModalAlumnoPrimario">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ modoEdicionAlumnoPrimario ? 'Editar alumno' : 'Agregar alumno' }}</h3>
        <button @click="cerrarModalAlumnoPrimario" class="btn-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-row"><label>Nombre</label><input v-model="alumnoFormPrimario.nombre" class="input" placeholder="Nombre completo" /></div>
        <div class="form-row"><label>DNI</label><input v-model="alumnoFormPrimario.dni" class="input" /></div>
        <div class="form-row"><label>Fecha de nacimiento</label><input v-model="alumnoFormPrimario.fecha_nacimiento" type="date" class="input" /></div>
        <div class="form-row"><label>Género</label><select v-model="alumnoFormPrimario.genero" class="input"><option value="">Seleccionar</option><option>Masculino</option><option>Femenino</option><option>Otro</option></select></div>
        <div class="form-row"><label>Teléfono</label><input v-model="alumnoFormPrimario.telefono" class="input" /></div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" @click="cerrarModalAlumnoPrimario">Cancelar</button>
        <button class="btn-primary" :disabled="!alumnoFormPrimario.nombre" @click="guardarAlumnoPrimario">{{ modoEdicionAlumnoPrimario ? 'Actualizar' : 'Crear' }}</button>
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
  import MateriaModal from '../components/MateriaModal.vue'
  
  const router = useRouter()
  
  // Helper de autenticación para headers en fetch
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }
  
  // Navegar al detalle del alumno
  const verEstudiante = (estudiante) => {
    if (!estudiante || !estudiante.id) {
      console.error('Estudiante inválido para navegación', estudiante)
      return
    }
    router.push(`/menu/alumno/${estudiante.id}`)
  }
  
  // Estado reactivo para Primario
  const gradosPrimario = ref([])
  const gradoSeleccionado = ref(null)
  const estudiantesGrado = ref([])
  const mostrarModalAlumnoPrimario = ref(false)
  const modoEdicionAlumnoPrimario = ref(false)
  const alumnoFormPrimario = ref({ nombre: '', dni: '', fecha_nacimiento: '', genero: '', telefono: '' })
  const alumnoEditandoIdPrimario = ref(null)
  const areasAprendizaje = ref([])
  const evaluaciones = ref([])
  const adaptacionesCurriculares = ref([])
  const tabActiva = ref('estudiantes')
  
  // Filtros
  const filtroArea = ref('')
  const filtroPeriodo = ref('')
  
  // Tabs específicas para Primario
  const tabsPrimario = ref([
    { id: 'estudiantes', nombre: 'Lista de Alumnos', icon: '👨‍🎓' },
    { id: 'materias', nombre: 'Materias y Profesores', icon: '📖' },
    { id: 'areas', nombre: 'Áreas de Aprendizaje', icon: '📚' },
    { id: 'dai', nombre: 'Psicopedagoga y DAI', icon: '' },
    { id: 'adaptaciones', nombre: 'Adaptaciones Finales', icon: '📋' }
  ])

  const mostrarModalMateriaCompleto = ref(false)
  const alumnoParaMateriaCompleto = ref(null)
  const abrirModalMateriaCompleto = (estudiante) => {
    alumnoParaMateriaCompleto.value = estudiante
    mostrarModalMateriaCompleto.value = true
  }
  const verDiagnosticos = (estudiante) => { router.push('/menu/dai') }
  const materiasCurso = ref([])
  const recomendacionesDAI = ref([])
  const nuevaSugerenciaDAIPrimario = ref('')
  const mostrarModalActaPrimario = ref(false)
  const actasCursoPrimario = ref([])
  const actaFormPrimario = ref({ titulo: '', fecha: new Date().toISOString().slice(0,10), asistentes: '', temas: '', acuerdos: '', acciones: '', observaciones: '' })
  const nuevaMateriaNombre = ref('')
  const nuevaMateriaDescripcion = ref('')
  const nuevaObservacionCursoPrimario = ref('')
  const observacionesCursoPrimario = ref([])
  const diagnosticosPorEstudiante = ref({})
  const nuevoDiagnosticoTextoPrimario = ref({})
  const editObsIndexPrimario = ref(-1)
  const editObsTextPrimario = ref('')
  
  // Computed properties
  const evaluacionesFiltradas = computed(() => {
    let filtered = evaluaciones.value
    
    if (filtroArea.value) {
      filtered = filtered.filter(e => e.area_id == filtroArea.value)
    }
    
    if (filtroPeriodo.value) {
      filtered = filtered.filter(e => e.periodo == filtroPeriodo.value)
    }
    
    return filtered
  })
  
  const estadisticasEvaluaciones = computed(() => {
    const totalEvaluaciones = evaluaciones.value.length
    const promedioGeneral = evaluaciones.value.length > 0 
      ? (evaluaciones.value.reduce((sum, e) => sum + parseFloat(e.promedio_grupo), 0) / evaluaciones.value.length).toFixed(1)
      : '0.0'
    
    const totalAprobados = evaluaciones.value.reduce((sum, e) => sum + e.aprobados, 0)
    const totalEstudiantes = evaluaciones.value.length * estudiantesGrado.value.length
    const tasaAprobacion = totalEstudiantes > 0 ? Math.round((totalAprobados / totalEstudiantes) * 100) : 0
    
    return {
      promedio_general: promedioGeneral,
      aprobados: tasaAprobacion,
      evaluaciones_realizadas: totalEvaluaciones
    }
  })
  
  const estadisticasAdaptaciones = computed(() => {
    const estudiantesConAdaptaciones = new Set()
    adaptacionesCurriculares.value.forEach(adaptacion => {
      adaptacion.estudiantes_objetivo.forEach(estId => estudiantesConAdaptaciones.add(estId))
    })
    
    return {
      estudiantes_con_adaptaciones: estudiantesConAdaptaciones.size,
      adaptaciones_activas: adaptacionesCurriculares.value.filter(a => a.estado === 'Activa').length,
      efectividad: 75 // Simulado
    }
  })
  
  // Cargar datos iniciales
  const cargarGradosPrimario = async () => {
    try {
      const response = await fetch('/api/cursos?nivel=Primario', { headers: getAuthHeaders() })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      gradosPrimario.value = (Array.isArray(data) ? data : []).map(grado => ({
        ...grado,
        cantidad_alumnos: Math.floor(Math.random() * 30) + 15
      }))
    } catch (error) {
      console.error('Error cargando grados de primario:', error)
      // Fallback: datos simulados
      gradosPrimario.value = [
        { id: 1, nombre: '1° Grado - División A', grado: 1, turno: 'Mañana', nombre_colegio: 'Escuela Primaria Modelo', cantidad_alumnos: 25 },
        { id: 2, nombre: '2° Grado - División A', grado: 2, turno: 'Mañana', nombre_colegio: 'Escuela Primaria Modelo', cantidad_alumnos: 28 },
        { id: 3, nombre: '3° Grado - División B', grado: 3, turno: 'Tarde', nombre_colegio: 'Escuela Primaria Modelo', cantidad_alumnos: 22 }
      ]
    }
  }
  
  const seleccionarGrado = async (grado) => {
    gradoSeleccionado.value = grado
    tabActiva.value = 'estudiantes'
    
    // Cargar datos del grado seleccionado
    await Promise.all([
      cargarEstudiantesGrado(grado.id),
      cargarMateriasCurso(grado.id),
      cargarAreasAprendizaje(grado.id),
      cargarEvaluaciones(grado.id),
      cargarAdaptacionesCurriculares(grado.id)
    ])
    await cargarDiagnosticosGrado()
    await cargarActasCursoPrimario()
  }

  const cargarMateriasCurso = async (cursoId) => {
    try {
      const res = await fetch(`/api/cursos/${cursoId}/materias`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      materiasCurso.value = Array.isArray(data) ? data : []
    } catch (err) {
      materiasCurso.value = []
    }
  }

  const crearMateriaCurso = async () => {
    if (!gradoSeleccionado.value?.id || !nuevaMateriaNombre.value) return
    try {
      const res = await fetch(`/api/cursos/${gradoSeleccionado.value.id}/materias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ nombre: nuevaMateriaNombre.value, descripcion: nuevaMateriaDescripcion.value })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const creada = await res.json()
      materiasCurso.value.push(creada)
      nuevaMateriaNombre.value = ''
      nuevaMateriaDescripcion.value = ''
    } catch (err) {
      console.error('Error creando materia:', err)
    }
  }

  const agregarObservacionCursoPrimario = () => {
    if (!nuevaObservacionCursoPrimario.value) return
    observacionesCursoPrimario.value.unshift(nuevaObservacionCursoPrimario.value)
    nuevaObservacionCursoPrimario.value = ''
  }

  const quitarObservacionCursoPrimario = (i) => {
    observacionesCursoPrimario.value.splice(i, 1)
  }

  const agregarDiagnosticoPrimario = (est) => {
    const texto = (nuevoDiagnosticoTextoPrimario.value[est.id] || '').trim()
    if (!texto) return
    fetch(`/api/alumnos/${est.id}/diagnosticos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ tipo_evaluacion: texto, diagnostico: texto })
    })
    .then(async (resp) => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const creado = await resp.json()
      if (!diagnosticosPorEstudiante.value[est.id]) diagnosticosPorEstudiante.value[est.id] = []
      diagnosticosPorEstudiante.value[est.id].unshift(creado)
      nuevoDiagnosticoTextoPrimario.value[est.id] = ''
    })
    .catch(() => {})
  }

  const quitarDiagnosticoPrimario = (est, diagId) => {
    fetch(`/api/alumnos/${est.id}/diagnosticos/${diagId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    })
    .then(async (resp) => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const list = diagnosticosPorEstudiante.value[est.id] || []
      diagnosticosPorEstudiante.value[est.id] = list.filter(d => d.id !== diagId)
    })
    .catch(() => {})
  }

  const cargarDiagnosticosGrado = async () => {
    const alumnos = estudiantesGrado.value.map(a => a.id)
    await Promise.all(alumnos.map(async (id) => {
      try {
        const resp = await fetch(`/api/alumnos/${id}/diagnosticos`, { headers: getAuthHeaders() })
        if (!resp.ok) return
        const arr = await resp.json()
        diagnosticosPorEstudiante.value[id] = Array.isArray(arr) ? arr : []
      } catch {}
    }))
  }

  const editarObservacionCursoPrimario = (i, obs) => {
    editObsIndexPrimario.value = i
    editObsTextPrimario.value = obs
  }

  const guardarObservacionCursoPrimario = (i) => {
    if (!(editObsTextPrimario.value && editObsTextPrimario.value.trim())) return
    observacionesCursoPrimario.value[i] = editObsTextPrimario.value
    editObsIndexPrimario.value = -1
    editObsTextPrimario.value = ''
  }

  const cancelarEdicionObservacionCursoPrimario = () => {
    editObsIndexPrimario.value = -1
    editObsTextPrimario.value = ''
  }

  // Encuesta psicopedagógica (Primario)
  const mostrarModalEncuestaPrimario = ref(false)
  const alumnoEncuestaPrimarioId = ref('')
  const materiaEncuestaPrimarioId = ref('')
  const encuestaFechaPrimario = ref(new Date().toISOString().slice(0,10))
  const encuestaRespuestasPrimario = ref({ atencion:'', comunicacion:'', interaccion:'', autonomia:'', regulacion:'', conducta:'' })
  const abrirEncuestaAlumnoPrimario = (estudiante) => {
    alumnoEncuestaPrimarioId.value = estudiante?.id ? String(estudiante.id) : ''
    materiaEncuestaPrimarioId.value = ''
    encuestaFechaPrimario.value = new Date().toISOString().slice(0,10)
    encuestaRespuestasPrimario.value = { atencion:'', comunicacion:'', interaccion:'', autonomia:'', regulacion:'', conducta:'' }
    mostrarModalEncuestaPrimario.value = true
  }
  const guardarEncuestaPrimario = async () => {
    try {
      if (!alumnoEncuestaPrimarioId.value || !materiaEncuestaPrimarioId.value) return
      const token = localStorage.getItem('token')
      const payload = {
        materia_id: materiaEncuestaPrimarioId.value,
        atencion: encuestaRespuestasPrimario.value.atencion,
        comunicacion: encuestaRespuestasPrimario.value.comunicacion,
        interaccion: encuestaRespuestasPrimario.value.interaccion,
        autonomia: encuestaRespuestasPrimario.value.autonomia,
        regulacion: encuestaRespuestasPrimario.value.regulacion,
        conducta: encuestaRespuestasPrimario.value.conducta,
        fecha: encuestaFechaPrimario.value
      }
      await fetch(`/api/alumnos/${alumnoEncuestaPrimarioId.value}/encuestas/psico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload)
      })
      mostrarModalEncuestaPrimario.value = false
      alert('Encuesta guardada')
    } catch (err) {
      alert('No se pudo guardar la encuesta')
    }
  }
  const agregarSugerenciaDAIPrimario = () => {
    const texto = (nuevaSugerenciaDAIPrimario.value || '').trim()
    if (!texto) return
    recomendacionesDAI.value.unshift({ id: Date.now(), titulo: 'Sugerencia', descripcion: texto, prioridad: 'media' })
    nuevaSugerenciaDAIPrimario.value = ''
  }
  const quitarSugerenciaDAIPrimario = (id) => {
    recomendacionesDAI.value = recomendacionesDAI.value.filter(r => r.id !== id)
  }
  const abrirModalActaPrimario = () => {
    mostrarModalActaPrimario.value = true
    actaFormPrimario.value = { titulo: '', fecha: new Date().toISOString().slice(0,10), asistentes: '', temas: '', acuerdos: '', acciones: '', observaciones: '' }
  }
  const cerrarModalActaPrimario = () => { mostrarModalActaPrimario.value = false }
  const guardarActaPrimario = async () => {
    if (!gradoSeleccionado.value?.id || !actaFormPrimario.value.titulo) return
    try {
      const res = await fetch('/api/actas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ curso_id: gradoSeleccionado.value.id, fecha: actaFormPrimario.value.fecha, titulo: actaFormPrimario.value.titulo, asistentes: actaFormPrimario.value.asistentes, temas: actaFormPrimario.value.temas, acuerdos: actaFormPrimario.value.acuerdos, acciones: actaFormPrimario.value.acciones, observaciones: actaFormPrimario.value.observaciones })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const saved = await res.json()
      actasCursoPrimario.value.unshift(saved)
      mostrarModalActaPrimario.value = false
    } catch {}
  }
  const cargarActasCursoPrimario = async () => {
    if (!gradoSeleccionado.value?.id) return
    try {
      const res = await fetch(`/api/actas?curso_id=${gradoSeleccionado.value.id}`, { headers: getAuthHeaders() })
      if (!res.ok) return
      const data = await res.json()
      actasCursoPrimario.value = Array.isArray(data) ? data : []
    } catch {}
  }

  const exportarActaPrimarioPDF = (acta) => {
    try {
      const nombreCurso = gradoSeleccionado.value?.nombre || '-'
      const fecha = acta?.fecha ? new Date(acta.fecha).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR')
      console.log('Exportar PDF (Primario)', { curso: nombreCurso, titulo: acta?.titulo, id: acta?.id })
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
      console.log('PDF listo para imprimir (Primario)', { fecha: new Date().toISOString() })
      setTimeout(() => win.print(), 250)
    } catch {}
  }
  
  const cargarEstudiantesGrado = async (gradoId) => {
    try {
      const res = await fetch(`/api/cursos/${gradoId}/alumnos`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      estudiantesGrado.value = Array.isArray(data) ? data : []
    } catch (error) {
      estudiantesGrado.value = []
    }
  }

  const abrirModalAlumnoPrimario = (editar, est) => {
    modoEdicionAlumnoPrimario.value = !!editar
    alumnoEditandoIdPrimario.value = editar ? est?.id : null
    alumnoFormPrimario.value = editar ? {
      nombre: est?.nombre || '',
      dni: est?.dni || '',
      fecha_nacimiento: est?.fecha_nacimiento || '',
      genero: est?.sexo || est?.genero || '',
      telefono: est?.telefono || ''
    } : { nombre: '', dni: '', fecha_nacimiento: '', genero: '', telefono: '' }
    mostrarModalAlumnoPrimario.value = true
  }
  const cerrarModalAlumnoPrimario = () => { mostrarModalAlumnoPrimario.value = false }
  const guardarAlumnoPrimario = async () => {
    try {
      if (!alumnoFormPrimario.value.nombre || !alumnoFormPrimario.value.nombre.trim()) return
      if (modoEdicionAlumnoPrimario.value && alumnoEditandoIdPrimario.value) {
        const res = await fetch(`/api/alumnos/${alumnoEditandoIdPrimario.value}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ nombre: alumnoFormPrimario.value.nombre, dni: alumnoFormPrimario.value.dni, fecha_nacimiento: alumnoFormPrimario.value.fecha_nacimiento, genero: alumnoFormPrimario.value.genero, telefono: alumnoFormPrimario.value.telefono })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } else {
        const res = await fetch('/api/alumnos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ nombre: alumnoFormPrimario.value.nombre, dni: alumnoFormPrimario.value.dni, fecha_nacimiento: alumnoFormPrimario.value.fecha_nacimiento, genero: alumnoFormPrimario.value.genero, telefono: alumnoFormPrimario.value.telefono, curso_id: gradoSeleccionado.value?.id, nivel: 'Primario' })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const creado = await res.json()
        if (gradoSeleccionado.value?.id) {
          estudiantesGrado.value.unshift({
            id: creado.id,
            nombre: creado.nombre,
            apellido: creado.apellido || '',
            dni: creado.dni || alumnoFormPrimario.value.dni || '',
            fecha_nacimiento: creado.fecha_nacimiento || alumnoFormPrimario.value.fecha_nacimiento || '',
            genero: creado.genero || alumnoFormPrimario.value.genero || '',
            telefono: creado.telefono || alumnoFormPrimario.value.telefono || ''
          })
        }
      }
      mostrarModalAlumnoPrimario.value = false
      if (gradoSeleccionado.value?.id) await cargarEstudiantesGrado(gradoSeleccionado.value.id)
    } catch (e) { alert('No se pudo guardar el alumno') }
  }
  const eliminarAlumnoPrimario = async (est) => {
    try {
      if (!est?.id) return
      const res = await fetch(`/api/alumnos/${est.id}`, { method: 'DELETE', headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (gradoSeleccionado.value?.id) await cargarEstudiantesGrado(gradoSeleccionado.value.id)
    } catch (e) { alert('No se pudo eliminar el alumno') }
  }
  
  const cargarAreasAprendizaje = async (gradoId) => {
    try {
      areasAprendizaje.value = [
        {
          id: 1,
          nombre: 'Matemáticas',
          nombre_profesor: 'Carlos',
          apellido_profesor: 'Rodríguez',
          estado_planificacion: 'Completada',
          horarios: ['Lunes 08:00-09:30', 'Miércoles 08:00-09:30'],
          promedio_grupo: '7.8',
          estudiantes_aprobados: 22,
          ultima_evaluacion: 'Examen de geometría - 15/01/2024'
        },
        {
          id: 2,
          nombre: 'Lengua y Literatura',
          nombre_profesor: 'Ana',
          apellido_profesor: 'Martínez',
          estado_planificacion: 'En progreso',
          horarios: ['Martes 10:00-11:30', 'Jueves 10:00-11:30'],
          promedio_grupo: '8.2',
          estudiantes_aprobados: 24,
          ultima_evaluacion: 'Análisis de cuento - 12/01/2024'
        }
      ]
    } catch (error) {
      console.error('Error cargando áreas de aprendizaje:', error)
    }
  }
  
  const cargarEvaluaciones = async (gradoId) => {
    try {
      evaluaciones.value = [
        {
          id: 1,
          nombre: 'Evaluación de Matemáticas - Unidad 1',
          fecha: '2024-01-15',
          area_nombre: 'Matemáticas',
          tipo: 'Examen escrito',
          puntaje_maximo: 100,
          promedio_grupo: '78.5',
          aprobados: 20,
          area_id: 1,
          periodo: '1'
        },
        {
          id: 2,
          nombre: 'Evaluación de Lengua - Comprensión lectora',
          fecha: '2024-01-12',
          area_nombre: 'Lengua y Literatura',
          tipo: 'Prueba práctica',
          puntaje_maximo: 50,
          promedio_grupo: '42.3',
          aprobados: 22,
          area_id: 2,
          periodo: '1'
        }
      ]
    } catch (error) {
      console.error('Error cargando evaluaciones:', error)
    }
  }
  
  const cargarAdaptacionesCurriculares = async (gradoId) => {
    try {
      adaptacionesCurriculares.value = [
        {
          id: 1,
          titulo: 'Adaptación para TDAH',
          area_nombre: 'Todas las áreas',
          tipo: 'Metodológica',
          objetivo: 'Mejorar la atención y concentración',
          estudiantes_objetivo: [1],
          estado: 'Activa',
          resultados: 'Mejora del 40% en tiempo de atención'
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
  
  const getNombreEstudiante = (estudianteId) => {
    const estudiante = estudiantesGrado.value.find(e => e.id === estudianteId)
    return estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : 'Estudiante no encontrado'
  }
  
  const getClaseAsistencia = (porcentaje) => {
    if (porcentaje >= 90) return 'excelente'
    if (porcentaje >= 80) return 'buena'
    if (porcentaje >= 70) return 'regular'
    return 'baja'
  }
  
  // Métodos de interfaz
  
  const verBoletin = (estudiante) => {
    if (!estudiante || !estudiante.id) return
    router.push({ path: '/menu/boletin', query: { alumnoId: estudiante.id } })
  }
  
  const verAdaptaciones = (estudiante) => {
    console.log('Ver adaptaciones de:', estudiante.nombre)
    // Mostrar modal o navegar a adaptaciones del estudiante
  }
  
  const nuevaPlanificacion = () => {
    const id = gradoSeleccionado.value?.id
    if (!id) return
    cargarAreasAprendizaje(id)
    tabActiva.value = 'areas'
  }
  
  
  
  const verResultadosArea = (area) => {
    if (!area) return
    const c = window.prompt('Comentario de la docente', area.comentario_docente || '')
    if (c !== null) area.comentario_docente = c
  }
  
  const filtrarEvaluaciones = () => {
    // La computed property se actualiza automáticamente
  }
  
  const verDetallesEvaluacion = (evaluacion) => {
    console.log('Ver detalles evaluación:', evaluacion.nombre)
  }
  
  const editarEvaluacion = (evaluacion) => {
    console.log('Editar evaluación:', evaluacion.nombre)
  }
  
  const exportarResultados = (evaluacion) => {
    console.log('Exportar resultados de:', evaluacion.nombre)
  }
  
  const nuevaAdaptacionGrupal = () => {
    console.log('Nueva adaptación grupal')
  }
  
  const aplicarAdaptacion = (adaptacion) => {
    console.log('Aplicar adaptación:', adaptacion.titulo)
  }
  
  const evaluarAdaptacion = (adaptacion) => {
    console.log('Evaluar adaptación:', adaptacion.titulo)
  }
  
  const verDetallesAdaptacion = (adaptacion) => {
    console.log('Ver detalles adaptación:', adaptacion.titulo)
  }
  
  const exportarListaEstudiantes = () => {
    console.log('Exportar lista de estudiantes')
    // Lógica para exportar a PDF o Excel
  }
  
  
  
  // Inicialización
  onMounted(() => {
    cargarGradosPrimario()
  })
  
  // Crear/Editar/Eliminar curso (Primario)
  const mostrarModalCurso = ref(false)
  const modoEdicion = ref(false)
  const cursoEditando = ref(null)
  const nuevoCurso = ref({ nombre: '', grado: 1, turno: 'Mañana', colegio_id: null })

  const abrirModalCurso = () => {
    modoEdicion.value = false
    nuevoCurso.value = { nombre: '', grado: 1, turno: 'Mañana', colegio_id: null }
    mostrarModalCurso.value = true
  }

  const cerrarModalCurso = () => {
    mostrarModalCurso.value = false
    cursoEditando.value = null
  }

  const crearCurso = async () => {
    try {
      const payload = {
        nombre: nuevoCurso.value.nombre,
        descripcion: null,
        nivel: 'Primario',
        grado: nuevoCurso.value.grado,
        turno: nuevoCurso.value.turno,
        capacidad_maxima: 30,
        colegio_id: nuevoCurso.value.colegio_id || null
      }
      const res = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await cargarGradosPrimario()
      cerrarModalCurso()
    } catch (err) {
      console.error('Error creando curso primario:', err)
      gradosPrimario.value.unshift({
        id: Date.now(),
        nombre: nuevoCurso.value.nombre || `Grado ${nuevoCurso.value.grado}`,
        grado: nuevoCurso.value.grado,
        turno: nuevoCurso.value.turno,
        nombre_colegio: '-',
        cantidad_alumnos: Math.floor(Math.random() * 30) + 15
      })
      cerrarModalCurso()
    }
  }

  const editarCurso = (curso) => {
    modoEdicion.value = true
    cursoEditando.value = curso
    nuevoCurso.value = {
      nombre: curso.nombre,
      grado: curso.grado,
      turno: curso.turno,
      colegio_id: curso.colegio_id || null
    }
    mostrarModalCurso.value = true
  }

  const guardarCurso = async () => {
    if (!cursoEditando.value) return
    try {
      const id = cursoEditando.value.id
      const payload = {
        nombre: nuevoCurso.value.nombre,
        descripcion: cursoEditando.value.descripcion || null,
        nivel: 'Primario',
        grado: nuevoCurso.value.grado,
        turno: nuevoCurso.value.turno,
        capacidad_maxima: cursoEditando.value.capacidad_maxima || 30,
        colegio_id: nuevoCurso.value.colegio_id || null
      }
      const res = await fetch(`/api/cursos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await cargarGradosPrimario()
      cerrarModalCurso()
    } catch (err) {
      console.error('Error actualizando curso:', err)
      // Fallback local
      const idx = gradosPrimario.value.findIndex(c => c.id === cursoEditando.value.id)
      if (idx >= 0) {
        gradosPrimario.value[idx] = {
          ...gradosPrimario.value[idx],
          nombre: nuevoCurso.value.nombre,
          grado: nuevoCurso.value.grado,
          turno: nuevoCurso.value.turno,
          colegio_id: nuevoCurso.value.colegio_id || null
        }
      }
      cerrarModalCurso()
    }
  }

  const eliminarCurso = async (curso) => {
    try {
      const res = await fetch(`/api/cursos/${curso.id}`, { method: 'DELETE', headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await cargarGradosPrimario()
    } catch (err) {
      console.error('Error eliminando curso:', err)
      gradosPrimario.value = gradosPrimario.value.filter(c => c.id !== curso.id)
    }
  }
  </script>
  <style scoped>
  /* Estilos específicos para Primario */
  .nivel-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .nivel-header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
  
  .breadcrumb a:hover {
    text-decoration: underline;
  }
  
  /* Selección de curso */
  .seleccion-curso {
    margin-bottom: 30px;
  }
  
  .seleccion-curso h2 {
    color: #fff;
    margin-bottom: 20px;
  }
  
  .cursos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .curso-card {
    border: 2px solid #e0e0e0;
    border-radius: 15px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    background: white;
  }
  
  .curso-card:hover {
    border-color: #4facfe;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .curso-card.active {
    border-color: #4facfe;
    background: #f0f8ff;
  }
  
  .curso-icon {
    font-size: 2.5em;
    margin-right: 15px;
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
    color: #4facfe;
    font-weight: bold;
  }
  
  /* Contenido principal */
  .contenido-principal {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    color: #111827;
  }
  
  .curso-info-panel {
    margin-bottom: 30px;
  }
  
  .info-header h2 {
    color: #333;
    margin-bottom: 10px;
  }
  
  .curso-stats {
    display: flex;
    gap: 20px;
  }
  
  .stat {
    background: #f8f9fa;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 0.9em;
  }
  
  /* Tabs */
  .tabs-header {
    display: flex;
    border-bottom: 2px solid #e0e0e0;
    margin-bottom: 20px;
  }
  
  .tab-button {
    padding: 15px 25px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1em;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
    color: #111827;
  }
  
  .tab-button:hover {
    background: #f8f9fa;
  }
  
  .tab-button.active {
    border-bottom-color: #4facfe;
    color: #4facfe;
    font-weight: bold;
  }
  
  /* Panel header */
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .panel-header h3 {
    margin: 0;
    color: #333;
  }
  
  .panel-actions {
    display: flex;
    gap: 10px;
  }
  
  .evaluacion-filters {
    display: flex;
    gap: 10px;
  }
  
  .evaluacion-filters select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  /* Botones */
  .btn-primary, .btn-secondary, .btn-info, .btn-export, .btn-view, .btn-edit {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.3s ease;
  }
  
  .btn-primary {
    background: #4facfe;
    color: white;
  }
  
  .btn-primary:hover {
    background: #3a9dfc;
  }
  
  .btn-secondary {
    background: #6c757d;
    color: white;
  }
  
  .btn-info {
    background: #17a2b8;
    color: white;
  }
  
  .btn-export {
    background: #28a745;
    color: white;
  }
  
  .btn-view {
    background: #ffc107;
    color: #212529;
  }
  
  .btn-edit {
    background: #fd7e14;
    color: white;
  }
  
  /* Tablas */
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
    border-bottom: 1px solid #e0e0e0;
    color: #111827;
  }
  
  .alumnos-table th {
    background: #f8f9fa;
    font-weight: bold;
    color: #333;
  }
  
  .alumnos-table tr:hover {
    background: #f8f9fa;
  }
  
  /* Indicadores de rendimiento */
  .rendimiento-indicador {
    text-align: center;
  }
  
  .rendimiento-nivel {
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
    display: inline-block;
    margin-bottom: 5px;
  }
  
  .nivel-Avanzado { background: #28a745; color: white; }
  .nivel-Normal { background: #17a2b8; color: white; }
  .nivel-Basico { background: #ffc107; color: #212529; }
  .nivel-EnProceso { background: #fd7e14; color: white; }
  
  .rendimiento-promedio {
    font-size: 11px;
    color: #666;
  }
  .area-comentario { margin-top: 10px; font-size: 0.95em; color: #333; }
  
  /* Asistencia */
  .asistencia-info {
    text-align: center;
  }
  
  .asistencia-porcentaje {
    font-weight: bold;
    font-size: 14px;
    display: block;
  }
  
  .asistencia-porcentaje.excelente { color: #28a745; }
  .asistencia-porcentaje.buena { color: #17a2b8; }
  .asistencia-porcentaje.regular { color: #ffc107; }
  .asistencia-porcentaje.baja { color: #dc3545; }
  
  .asistencia-detalle {
    font-size: 11px;
    color: #666;
  }
  
  /* Adaptaciones */
  .adaptaciones-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .adaptacion-chip {
    background: #17a2b8;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
  }
  
  .mas-adaptaciones {
    background: #6c757d;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 11px;
  }
  
  .sin-adaptaciones {
    color: #6c757d;
    font-style: italic;
  }
  
  /* Áreas de aprendizaje */
  .areas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }
  
  .area-card {
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 20px;
    background: white;
    transition: transform 0.3s ease;
  }
  
  .area-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .area-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .area-header h4 {
    margin: 0;
    color: #333;
  }
  
  .area-status {
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .estado-Completada { background: #28a745; color: white; }
  .estado-EnProgreso { background: #ffc107; color: #212529; }
  .estado-Pendiente { background: #6c757d; color: white; }
  
  .area-content {
    margin-bottom: 15px;
  }
  
  .area-profesor, .area-horarios, .area-evaluacion {
    margin-bottom: 10px;
    font-size: 0.9em;
  }
  
  .horarios-list {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-top: 5px;
  }
  
  .horario-chip {
    background: #e9ecef;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 11px;
  }
  
  .area-estadisticas {
    display: flex;
    gap: 15px;
    margin: 10px 0;
  }
  
  .estadistica {
    text-align: center;
    flex: 1;
  }
  
  .estadistica .valor {
    display: block;
    font-weight: bold;
    font-size: 18px;
    color: #007bff;
  }
  
  .estadistica .label {
    font-size: 11px;
    color: #666;
  }
  
  .area-actions {
    display: flex;
    gap: 10px;
    justify-content: space-between;
  }
  
  .area-actions button {
    flex: 1;
    padding: 8px 12px;
    font-size: 0.8em;
  }
  
  /* Evaluaciones */
  .evaluaciones-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: transform 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
  }
  
  .stat-icon {
    font-size: 24px;
    margin-right: 10px;
  }
  
  .stat-number {
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }
  
  .stat-label {
    font-size: 12px;
    color: #666;
  }
  
  .evaluaciones-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .evaluacion-card {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    background: white;
    transition: transform 0.3s ease;
  }
  
  .evaluacion-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .evaluacion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .evaluacion-header h4 {
    margin: 0;
    color: #333;
  }
  
  .evaluacion-fecha {
    color: #666;
    font-size: 0.9em;
  }
  
  .evaluacion-info {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 15px;
    margin: 10px 0;
  }
  
  .evaluacion-datos {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 14px;
  }
  
  .evaluacion-resultados {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .resultado-item {
    display: flex;
    justify-content: space-between;
  }
  
  .resultado-item .label {
    font-weight: 600;
  }
  
  .resultado-item .valor {
    font-weight: bold;
    color: #007bff;
  }
  
  .evaluacion-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  
  .evaluacion-actions button {
    padding: 6px 12px;
    font-size: 0.8em;
  }
  
  /* Adaptaciones */
  .adaptaciones-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .adaptaciones-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .adaptacion-card {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    background: white;
    transition: transform 0.3s ease;
  }
  
  .adaptacion-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .adaptacion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .adaptacion-header h4 {
    margin: 0;
    color: #333;
  }
  
  .adaptacion-estado {
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .estado-Activa { background: #28a745; color: white; }
  .estado-Inactiva { background: #6c757d; color: white; }
  .estado-EnEvaluacion { background: #ffc107; color: #212529; }
  
  .adaptacion-content {
    margin: 10px 0;
  }
  
  .adaptacion-info p {
    margin: 5px 0;
    font-size: 0.9em;
  }
  
  .adaptacion-estudiantes {
    margin: 10px 0;
  }
  
  .estudiantes-list {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-top: 5px;
  }
  
  .estudiante-chip {
    background: #e9ecef;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 11px;
  }
  
  .adaptacion-resultados {
    margin-top: 10px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .adaptacion-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  
  .adaptacion-actions button {
    padding: 6px 12px;
    font-size: 0.8em;
  }
  
  /* Acciones en tabla */
  .acciones {
    display: flex;
    gap: 5px;
  }
  
  .acciones button {
    padding: 5px 8px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.8em;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .nivel-container {
      padding: 10px;
    }
    
    .tabs-header {
      flex-direction: column;
    }
    
    .panel-header {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }
    
    .evaluacion-info {
      grid-template-columns: 1fr;
    }
    
    .areas-grid {
      grid-template-columns: 1fr;
    }
    
    .curso-stats {
      flex-direction: column;
      gap: 10px;
    }
  }
  /* Cabecera de selección (para botón Crear Curso) */
  .seleccion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  </style>
