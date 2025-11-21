<template>
    <div class="nivel-container">
      <!-- Header del nivel -->
      <div class="nivel-header">
        <h1>🎨 Nivel Inicial</h1>
        <div class="breadcrumb">
          <router-link to="/menu">Menu</router-link> / Inicial
        </div>
      </div>
  
      <!-- Selección de curso (formato unificado) -->
      <div class="seleccion-curso">
        <div class="seleccion-header">
          <h2>Seleccionar Curso/División</h2>
          <button class="btn-primary" @click="abrirModalCurso">➕ Crear Curso</button>
        </div>
        <div class="cursos-grid">
          <div v-for="sala in salasInicial" :key="sala.id" 
               class="curso-card" 
               :class="{ active: salaSeleccionada?.id === sala.id }"
               @click="seleccionarSala(sala)">
            <div class="curso-icon">📚</div>
            <div class="curso-info">
              <h3>{{ sala.nombre }}</h3>
              <p>Sala de {{ sala.edad }} años - {{ sala.turno }}</p>
              <span class="alumnos-count">{{ sala.cantidad_alumnos }} alumnos</span>
              <div class="curso-actions">
                <button class="btn-edit small" @click.stop="editarSala(sala)" title="Editar">✏️ Editar</button>
                <button class="btn-danger small" @click.stop="eliminarSala(sala)" title="Eliminar">🗑️ Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal Crear/Editar Curso (formato unificado) -->
      <div v-if="mostrarModalCurso" class="modal-overlay" @click="cerrarModalCurso">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ modoEdicion ? '✏️ Editar Curso (Inicial)' : '➕ Crear Curso (Inicial)' }}</h3>
            <button @click="cerrarModalCurso" class="btn-close">&times;</button>
          </div>
          <div class="form-row">
            <label>Nombre</label>
            <input v-model="nuevoCurso.nombre" class="input" placeholder="Ej: Sala de 3 años - Turno Mañana" />
          </div>
          <div class="form-row">
            <label>Edad (años)</label>
            <input type="number" v-model.number="nuevoCurso.edad" class="input" placeholder="Ej: 3" />
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
            <button class="btn-primary" @click="modoEdicion ? guardarSala() : crearSala()">{{ modoEdicion ? 'Guardar' : 'Crear' }}</button>
          </div>
        </div>
      </div>
  
      <!-- Mensaje cuando no hay sala seleccionada -->
      <div v-if="!salaSeleccionada && salasInicial.length > 0" class="no-selection-message">
        <div class="message-content">
          <div class="message-icon">👆</div>
          <h3>Selecciona una sala para comenzar</h3>
          <p>Haz clic en una de las salas de arriba para ver y gestionar los alumnos</p>
        </div>
      </div>

      <!-- Mensaje cuando no hay salas creadas -->
      <div v-if="!salaSeleccionada && salasInicial.length === 0" class="no-selection-message">
        <div class="message-content">
          <div class="message-icon">🏫</div>
          <h3>Aún no hay salas creadas</h3>
          <p>Comienza creando tu primera sala haciendo clic en "Crear Sala"</p>
          <button class="btn-primary btn-large" @click="abrirModalCurso">
            ➕ Crear Primera Sala
          </button>
        </div>
      </div>

      <!-- Contenido principal cuando hay sala seleccionada -->
  <div v-if="salaSeleccionada" class="contenido-principal">
        <!-- Información de la sala -->
        <div class="curso-info-panel">
          <div class="info-header">
            <h2>{{ salaSeleccionada.nombre }} - Sala de {{ salaSeleccionada.edad }} años</h2>
            <div class="curso-stats">
              <span class="stat">👶 {{ niñosSala.length }} niños</span>
              <span class="stat">📖 {{ areasDesarrollo.length }} áreas</span>
            </div>

  <!-- Modales -->
  <div v-if="mostrarModalNino" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <button class="btn-close" @click="cerrarModal">&times;</button>
      <h3>👶 Perfil del Niño</h3>
      <p><strong>Nombre:</strong> {{ ninoSeleccionado?.nombre }}</p>
      <p><strong>Fecha Nacimiento:</strong> {{ formatDate(ninoSeleccionado?.fecha_nacimiento) }}</p>
      <p><strong>Edad (meses):</strong> {{ calcularEdadMeses(ninoSeleccionado?.fecha_nacimiento) }}</p>
    </div>
  </div>

  <div v-if="mostrarModalDesarrollo" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <button class="btn-close" @click="cerrarModal">&times;</button>
      <h3>🧠 Desarrollo</h3>
      <p>Resumen general del desarrollo para {{ ninoSeleccionado?.nombre }}.</p>
      <ul>
        <li v-for="area in areasDesarrollo" :key="area.id">
          {{ area.nombre }}: {{ area.avance }}% ({{ area.observaciones }} observaciones)
        </li>
      </ul>
    </div>
  </div>

  <div v-if="mostrarModalInforme" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <button class="btn-close" @click="cerrarModal">&times;</button>
      <h3>📝 Informe Inicial</h3>
      <p><strong>Niño:</strong> {{ informeSeleccionado?.nombre_nino }}</p>
      <p><strong>Fecha:</strong> {{ formatDate(informeSeleccionado?.fecha) }}</p>
      <p><strong>Resumen:</strong> {{ informeSeleccionado?.desarrollo_general }}</p>
      <div>
        <strong>Recomendaciones</strong>
        <textarea v-model="informeSeleccionado.recomendaciones" rows="3" class="input"></textarea>
      </div>
      <div class="acciones">
        
        <button class="btn-primary" @click="guardarInformeSeleccionado">Guardar</button>
      </div>
    </div>
  </div>

  <div v-if="mostrarModalInformeGrupal" class="modal-overlay" @click="cerrarModalInformeGrupal">
    <div class="modal-content" @click.stop>
      <button class="btn-close" @click="cerrarModalInformeGrupal">&times;</button>
      <h3>Informe grupal</h3>
      <div class="form-row">
        <label>Título</label>
        <input v-model="informeGrupal.titulo" class="input" placeholder="Ej: Informe del grupo" />
      </div>
      <div class="form-row">
        <label>Resumen</label>
        <textarea v-model="informeGrupal.desarrollo_general" rows="6" class="input" placeholder="Escribe el informe..."></textarea>
      </div>
      <div class="form-row">
        <label>Recomendaciones</label>
        <textarea v-model="informeGrupal.recomendaciones" rows="4" class="input" placeholder="Sugerencias y acciones"></textarea>
      </div>
      <div class="acciones">
        <button class="btn-secondary" @click="cerrarModalInformeGrupal">Cancelar</button>
        <button class="btn-primary" @click="guardarInformeGrupal">Guardar informe grupal</button>
      </div>
    </div>
  </div>

  <div v-if="mostrarModalObservacion" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <button class="btn-close" @click="cerrarModal">&times;</button>
      <h3>➕ Nueva Observación</h3>
      <div class="form-row">
        <label>Área</label>
        <select v-model="areaParaObservacionId" class="input">
          <option :value="null">Selecciona un área</option>
          <option v-for="area in areasDesarrollo" :key="area.id" :value="area.id">{{ area.nombre }}</option>
        </select>
      </div>
      <textarea v-model="textoObservacion" rows="4" class="input" placeholder="Escribe la observación..."></textarea>
      <div class="acciones">
        <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
        <button class="btn-primary" @click="guardarObservacion">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal: Cargar Materia (rápido) -->
  <div v-if="mostrarModalMateria" class="modal-overlay" @click="cerrarModalMateria">
    <div class="modal-content" @click.stop>
      <button class="btn-close" @click="cerrarModalMateria">&times;</button>
      <h3>📖 Cargar Materia</h3>
      <p><strong>Alumno:</strong> {{ alumnoParaMateria?.nombre }} {{ alumnoParaMateria?.apellido }}</p>

      <div v-if="alumnoParaMateria?.curso_id" class="info-curso">
        <p>Curso asignado: {{ alumnoParaMateria.curso_id }}</p>
      </div>
      <div v-else class="info-curso warning">
        <p>Este alumno no tiene curso asignado. Se muestran todas las materias disponibles.</p>
      </div>

      <div class="form-row">
        <label>Seleccionar Materia</label>
        <select v-model="materiaSeleccionadaId" class="input">
          <option :value="''">Seleccione una materia</option>
          <option v-for="m in materiasDisponibles" :key="m.id" :value="m.id">
            {{ m.nombre }}
            <span v-if="m.descripcion"> - {{ m.descripcion }}</span>
          </option>
        </select>
      </div>

      <div class="acciones">
        <button class="btn-secondary" @click="cerrarModalMateria">Cancelar</button>
        <button class="btn-primary" :disabled="!materiaSeleccionadaId" @click="asignarMateriaModal">Asignar</button>
      </div>

      <div v-if="alumnoParaMateria?.curso_id" class="crear-materia-rapida">
        <h4>➕ Crear nueva materia en el curso</h4>
        <div class="form-row">
          <label>Nombre</label>
          <input v-model="nuevaMateriaNombre" class="input" placeholder="Ej: Informática" />
        </div>
        <div class="form-row">
          <label>Profesor (opcional)</label>
          <input v-model="nuevaMateriaDescripcion" class="input" placeholder="Ej: Prof. García" />
        </div>
        <div class="acciones">
          <button class="btn-primary" :disabled="!nuevaMateriaNombre" @click="crearYAsignarMateriaModal">Crear y asignar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: Agregar Alumno a la Sala -->
  <div v-if="mostrarModalAgregarAlumno" class="modal-overlay" @click="cerrarModalAgregarAlumno">
    <div class="modal-content" @click.stop>
      <button class="btn-close" @click="cerrarModalAgregarAlumno">&times;</button>
      <h3>➕ Agregar Alumno a {{ salaSeleccionada?.nombre }}</h3>
      <div class="form-row">
        <label>Nombre</label>
        <input v-model="nuevoAlumno.nombre" type="text" class="input" placeholder="Nombre" />
      </div>
      <div class="form-row">
        <label>Apellido</label>
        <input v-model="nuevoAlumno.apellido" type="text" class="input" placeholder="Apellido" />
      </div>
      <div class="form-row">
        <label>Fecha de Nacimiento</label>
        <input v-model="nuevoAlumno.fecha_nacimiento" type="date" class="input" />
      </div>
      <div class="form-row">
        <label>Responsable</label>
        <input v-model="nuevoAlumno.nombre_responsable" type="text" class="input" placeholder="Nombre del responsable" />
      </div>
      <div class="form-row">
        <label>Teléfono del Responsable</label>
        <input v-model="nuevoAlumno.telefono_responsable" type="text" class="input" placeholder="Teléfono" />
      </div>
      <div class="acciones">
        <button class="btn-secondary" @click="cerrarModalAgregarAlumno">Cancelar</button>
        <button class="btn-primary" @click="guardarNuevoAlumno">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal: Detalles del Área de Desarrollo -->
  <div v-if="mostrarModalAreaDetalles" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <button class="btn-close" @click="cerrarModal">&times;</button>
      <h3>📈 Detalles - {{ areaSeleccionada?.nombre }}</h3>
      <p><strong>Avance grupal:</strong> {{ areaSeleccionada?.avance }}%</p>
      <p><strong>Observaciones registradas:</strong> {{ areaSeleccionada?.observaciones }}</p>
      <p><strong>Niños con dificultad:</strong> {{ areaSeleccionada?.niños_con_dificultad }}</p>
      <div v-if="registrosAreas[areaSeleccionada?.id]?.length">
        <h4>Historial de avances</h4>
        <ul>
          <li v-for="(r, i) in registrosAreas[areaSeleccionada.id]" :key="i">
            {{ formatDate(r.fecha) }} — {{ r.porcentaje }}% — {{ r.observacion || 'Sin detalle' }}
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Modal: Registrar Avance del Área -->
  <div v-if="mostrarModalAvance" class="modal-overlay" @click="cerrarModal">
    <div class="modal-content" @click.stop>
      <button class="btn-close" @click="cerrarModal">&times;</button>
      <h3>✏️ Registrar Avance - {{ areaSeleccionada?.nombre }}</h3>
      <div class="form-row">
        <label>Porcentaje de avance</label>
        <input type="number" min="0" max="100" v-model.number="formAvance.porcentaje" class="input" />
      </div>
      <div class="form-row">
        <label>Observación</label>
        <textarea v-model="formAvance.observacion" rows="3" class="input" placeholder="Descripción breve"></textarea>
      </div>
      <div class="form-row">
        <label>Niños con dificultad</label>
        <input type="number" min="0" v-model.number="formAvance.conDificultad" class="input" />
      </div>
      <div class="acciones">
        <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
        <button class="btn-primary" @click="guardarAvanceArea">Guardar</button>
      </div>
    </div>
  </div>
          </div>
        </div>
  
        <!-- Pestañas de funcionalidades específicas de Inicial -->
        <div class="tabs-container">
          <div class="tabs-header">
            <button v-for="tab in tabsInicial" :key="tab.id" class="tab-button" :class="{ active: tabActiva === tab.id }" @click="tabActiva = tab.id">
              {{ tab.icon }} {{ tab.nombre }}
            </button>
          </div>
  
          <!-- Contenido de las pestañas -->
          <div class="tab-content">
            <!-- Pestaña 1: Lista de Niños -->
            <div v-if="tabActiva === 'ninos'" class="tab-panel">
            <div class="panel-header">
              <h3>👶 Lista de Niños</h3>
              <div class="panel-actions">
                <button @click="exportarListaNinos" class="btn-export">📄 Exportar</button>
                <button @click="abrirModalAgregarAlumno" class="btn-success btn-large">
                  ➕ Agregar Nuevo Alumno a {{ salaSeleccionada?.nombre }}
                </button>
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
                    <tr v-for="(nino, index) in niñosSala" :key="nino.id">
                      <td>{{ index + 1 }}</td>
                      <td>
                        <strong>{{ nino.nombre }} {{ nino.apellido }}</strong>
                        <div class="alumno-info">
                          Nac: {{ formatDate(nino.fecha_nacimiento) }}
                        </div>
                      </td>
                      <td>{{ calcularEdadAnios(nino.fecha_nacimiento) }} años</td>
                      <td>
                        <div>{{ nino.nombre_responsable }}</div>
                        <div>{{ nino.telefono_responsable }}</div>
                      </td>
                      <td>
                        <div v-if="diagnosticosPorNino[nino.id] && diagnosticosPorNino[nino.id].length" class="diagnosticos-list">
                          <span v-for="diag in diagnosticosPorNino[nino.id].slice(0,2)" :key="diag.id" class="diagnostico-chip" :title="diag.diagnostico">
                            {{ diag.tipo_evaluacion }}
                            <button class="chip-remove" @click="quitarDiagnostico(nino, diag.id)" title="Quitar">✖</button>
                          </span>
                          <span v-if="diagnosticosPorNino[nino.id].length > 2" class="mas-diagnosticos">+{{ diagnosticosPorNino[nino.id].length - 2 }}</span>
                        </div>
                        <span v-else class="sin-diagnosticos">Sin diagnósticos</span>
                        <div class="diagnosticos-input">
                          <input v-model="nuevoDiagnosticoTexto[nino.id]" class="input small" placeholder="Agregar diagnóstico..." />
                          <button class="btn-secondary xsmall" :disabled="!(nuevoDiagnosticoTexto[nino.id] && nuevoDiagnosticoTexto[nino.id].trim())" @click="agregarDiagnostico(nino)">Agregar</button>
                        </div>
                      </td>
                      <td class="acciones">
                        <button class="btn-add" @click="abrirEncuestaAlumnoInicial(nino)" title="Crear encuesta">🧾</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
        </div>
      </div>

      <div v-if="tabActiva === 'materias'" class="tab-panel">
        <div class="panel-header">
          <h3>MATERIAS</h3>
        </div>
        <div class="form-card">
          <div class="form-grid">
            <div class="form-row">
              <label>Nombre</label>
              <input v-model="nuevaMateriaNombre" class="input" placeholder="Ej: Informática" />
            </div>
            <div class="form-row">
              <label>Profesor (opcional)</label>
              <input v-model="nuevaMateriaDescripcion" class="input" placeholder="Ej: Prof. García" />
            </div>
          </div>
          <div class="acciones">
            <button class="btn-primary" :disabled="!(nuevaMateriaNombre && nuevaMateriaNombre.trim())" title="Completar nombre de la materia" @click="crearMateriaSala">➕ Agregar Materia</button>
          </div>
        </div>
        <div v-if="materiasSala.length === 0" class="no-materias">
          <div class="message-icon">📖</div>
          <div>No hay materias registradas en esta sala.</div>
        </div>
        <div v-else class="materias-grid">
          <div v-for="materia in materiasSala" :key="materia.id" class="materia-card">
            <div class="materia-header">
              <h4>{{ materia.nombre }}</h4>
              <span class="horario-info">📅 {{ materia.horarios?.length || 0 }} horarios</span>
            </div>
            <div class="materia-profesor">
              <strong>Profesor:</strong> {{ materia.nombre_profesor }} {{ materia.apellido_profesor }}
              <div class="especialidad">{{ materia.especialidad_profesor }}</div>
            </div>
            <div class="materia-actions">
              <button @click="verPlanificacionMateriaInicial(materia)" class="btn-primary">📋 Ver Planificación</button>
              <button @click="abrirModalSubirPlanif(materia)" class="btn-secondary">⬆️ Subir Planificación</button>
              <button @click="irANotasMateria(materia)" class="btn-primary">📝 Notas</button>
            </div>
            <div class="encuesta-inline">
              <div class="inline-row">
                <label>Alumno</label>
                <select v-model="getEncuestaInline(materia.id).alumnoId" class="input">
                  <option :value="''">Selecciona un alumno</option>
                  <option v-for="n in niñosSala" :key="n.id" :value="n.id">{{ n.nombre }} {{ n.apellido }}</option>
                </select>
                <label>Fecha</label>
                <input type="date" v-model="getEncuestaInline(materia.id).fecha" class="input" />
              </div>
              <div class="scale-group">
                <div class="scale-row">
                  <div class="scale-label">Atención y concentración</div>
                  <div class="scale-buttons">
                    <button v-for="v in [1,2,3,4,5]" :key="v" :class="['scale-btn', { active: (getEncuestaInline(materia.id).atencion===v) }]" @click="setEncuestaValor(materia.id,'atencion',v)">{{ v }}</button>
                  </div>
                  <div class="scale-ends">
                    <span>Malo</span><span>Excelente</span>
                  </div>
                </div>
                <div class="scale-row">
                  <div class="scale-label">Comunicación y lenguaje</div>
                  <div class="scale-buttons">
                    <button v-for="v in [1,2,3,4,5]" :key="v" :class="['scale-btn', { active: (getEncuestaInline(materia.id).comunicacion===v) }]" @click="setEncuestaValor(materia.id,'comunicacion',v)">{{ v }}</button>
                  </div>
                  <div class="scale-ends">
                    <span>Malo</span><span>Excelente</span>
                  </div>
                </div>
                <div class="scale-row">
                  <div class="scale-label">Interacción social</div>
                  <div class="scale-buttons">
                    <button v-for="v in [1,2,3,4,5]" :key="v" :class="['scale-btn', { active: (getEncuestaInline(materia.id).interaccion===v) }]" @click="setEncuestaValor(materia.id,'interaccion',v)">{{ v }}</button>
                  </div>
                  <div class="scale-ends">
                    <span>Malo</span><span>Excelente</span>
                  </div>
                </div>
                <div class="scale-row">
                  <div class="scale-label">Autonomía en tareas</div>
                  <div class="scale-buttons">
                    <button v-for="v in [1,2,3,4,5]" :key="v" :class="['scale-btn', { active: (getEncuestaInline(materia.id).autonomia===v) }]" @click="setEncuestaValor(materia.id,'autonomia',v)">{{ v }}</button>
                  </div>
                  <div class="scale-ends">
                    <span>Malo</span><span>Excelente</span>
                  </div>
                </div>
                <div class="scale-row">
                  <div class="scale-label">Regulación emocional</div>
                  <div class="scale-buttons">
                    <button v-for="v in [1,2,3,4,5]" :key="v" :class="['scale-btn', { active: (getEncuestaInline(materia.id).regulacion===v) }]" @click="setEncuestaValor(materia.id,'regulacion',v)">{{ v }}</button>
                  </div>
                  <div class="scale-ends">
                    <span>Malo</span><span>Excelente</span>
                  </div>
                </div>
                <div class="scale-row">
                  <div class="scale-label">Conducta adaptativa</div>
                  <div class="scale-buttons">
                    <button v-for="v in [1,2,3,4,5]" :key="v" :class="['scale-btn', { active: (getEncuestaInline(materia.id).conducta===v) }]" @click="setEncuestaValor(materia.id,'conducta',v)">{{ v }}</button>
                  </div>
                  <div class="scale-ends">
                    <span>Malo</span><span>Excelente</span>
                  </div>
                </div>
              </div>
              <div class="acciones">
                <button class="btn-primary" :disabled="!getEncuestaInline(materia.id).alumnoId" @click="guardarEncuestaInline(materia)">Guardar encuesta</button>
                <span class="encuestas-count" v-if="encuestasCountPorMateria[materia.id]">Encuestas guardadas: {{ encuestasCountPorMateria[materia.id] }}</span>
              </div>
            </div>
            <div v-if="materia.planificacion" class="planificacion-info">
              <div class="planificacion-estado" :class="`estado-${materia.planificacion.estado}`">{{ materia.planificacion.estado }}</div>
              <div class="planificacion-fecha">Actualizado: {{ formatDate(materia.planificacion.fecha_actualizacion) }}</div>
            </div>
          </div>
        </div>
        <div class="form-card">
          <div class="form-row">
            <label>Agregar texto</label>
            <input v-model="nuevaObservacionCurso" class="input" placeholder="Escribe una nota rápida..." />
          </div>
          <div class="acciones">
            <button class="btn-secondary" :disabled="!(nuevaObservacionCurso && nuevaObservacionCurso.trim())" title="Escribe una nota para habilitar" @click="agregarObservacionCurso">Agregar</button>
          </div>
        </div>
        <div v-if="observacionesCurso.length" class="observaciones-list">
          <div v-for="(obs, i) in observacionesCurso" :key="i" class="observacion-item">
            <span v-if="editObsIndex !== i">{{ obs }}</span>
            <input v-else v-model="editObsText" class="input" />
            <div class="item-actions">
              <button v-if="editObsIndex !== i" class="btn-edit small" @click="editarObservacionCurso(i, obs)">Modificar</button>
              <button v-else class="btn-primary small" @click="guardarObservacionCurso(i)">Guardar</button>
              <button v-if="editObsIndex === i" class="btn-secondary small" @click="cancelarEdicionObservacionCurso">Cancelar</button>
              <button class="btn-danger small" @click="quitarObservacionCurso(i)">Quitar</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tabActiva === 'dai'" class="tab-panel">
        <div class="panel-header">
          <h3>🧠 Sugerencias DAI</h3>
        </div>
        <div class="form-row">
          <label>Sugerencia</label>
          <input v-model="nuevaSugerenciaDAI" class="input" placeholder="Escribí una sugerencia..." />
        </div>
        <div class="acciones">
          <button class="btn-secondary" :disabled="!(nuevaSugerenciaDAI && nuevaSugerenciaDAI.trim())" @click="agregarSugerenciaDAI">Agregar</button>
          <button class="btn-primary" @click="abrirModalActa">Registrar reunión</button>
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
                <button class="btn-danger xsmall" @click="quitarSugerenciaDAI(rec.id)">Quitar</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="mostrarModalActa" class="modal-backdrop">
          <div class="modal">
            <div class="modal-header">
              <h3>Acta de reunión</h3>
            </div>
            <div class="modal-body">
              <div class="form-row">
                <label>Título</label>
                <input v-model="actaForm.titulo" class="input" placeholder="Ej: Reunión con familia" />
              </div>
              <div class="form-row">
                <label>Fecha</label>
                <input v-model="actaForm.fecha" type="date" class="input" />
              </div>
              <div class="form-row">
                <label>Asistentes</label>
                <input v-model="actaForm.asistentes" class="input" placeholder="Nombres de asistentes" />
              </div>
              <div class="form-row">
                <label>Temas tratados</label>
                <textarea v-model="actaForm.temas" class="input" rows="3"></textarea>
              </div>
              <div class="form-row">
                <label>Acuerdos</label>
                <textarea v-model="actaForm.acuerdos" class="input" rows="3"></textarea>
              </div>
              <div class="form-row">
                <label>Acciones</label>
                <textarea v-model="actaForm.acciones" class="input" rows="2"></textarea>
              </div>
              <div class="form-row">
                <label>Observaciones</label>
                <textarea v-model="actaForm.observaciones" class="input" rows="2"></textarea>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" @click="cerrarModalActa">Cancelar</button>
              <button class="btn-primary" :disabled="!actaForm.titulo" @click="guardarActa">Guardar</button>
            </div>
          </div>
        </div>

        <div v-if="mostrarModalSubirPlanif" class="modal-backdrop">
          <div class="modal">
            <div class="modal-header">
              <h3>Subir planificación PDF</h3>
            </div>
            <div class="modal-body">
              <div class="form-row">
                <label>Alumno</label>
                <select v-model="alumnoParaSubirId" class="input">
                  <option :value="''">Selecciona un alumno</option>
                  <option v-for="n in niñosSala" :key="n.id" :value="n.id">{{ n.nombre }} {{ n.apellido }}</option>
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
        </div>

        <div v-if="mostrarModalEncuestaInicial" class="modal-backdrop">
          <div class="modal">
            <div class="modal-header">
              <h3>Encuesta psicopedagógica</h3>
            </div>
            <div class="modal-body">
              <div class="form-row">
                <label>Alumno</label>
                <select v-model="alumnoEncuestaInicialId" class="input">
                  <option :value="''">Selecciona un alumno</option>
                  <option v-for="n in niñosSala" :key="n.id" :value="n.id">{{ n.nombre }} {{ n.apellido }}</option>
                </select>
              </div>
              <div class="form-row">
                <label>Materia</label>
                <select v-model="materiaEncuestaInicialId" class="input">
                  <option :value="''">Selecciona materia</option>
                  <option v-for="m in materiasSala" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                </select>
              </div>
              <div class="form-row">
                <label>Fecha</label>
                <input type="date" v-model="encuestaFechaInicial" class="input" />
              </div>
              <div class="grid">
                <div class="form-row">
                  <label>Atención y concentración</label>
                  <select v-model="encuestaRespuestasInicial.atencion" class="input">
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
                  <select v-model="encuestaRespuestasInicial.comunicacion" class="input">
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
                  <select v-model="encuestaRespuestasInicial.interaccion" class="input">
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
                  <select v-model="encuestaRespuestasInicial.autonomia" class="input">
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
                  <select v-model="encuestaRespuestasInicial.regulacion" class="input">
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
                  <select v-model="encuestaRespuestasInicial.conducta" class="input">
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
                <button class="btn-secondary" @click="cerrarModalEncuestaInicial">Cancelar</button>
                <button class="btn-primary" :disabled="!alumnoEncuestaInicialId || !(materiaEncuestaInicialId || (materiaParaEncuestaInicial && materiaParaEncuestaInicial.id))" @click="guardarEncuestaInicial">Guardar</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="actasSala.length" class="actas-list">
          <h4>Actas registradas</h4>
          <div v-for="a in actasSala" :key="a.id" class="acta-item">
            <div class="acta-title">{{ a.titulo }} - {{ formatDate(a.fecha) }}</div>
            <div class="acta-summary">{{ a.temas }}</div>
            <div class="item-actions">
              <button class="btn-primary xsmall" @click="exportarActaPDF(a)">Exportar PDF</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tabActiva === 'adaptaciones'" class="tab-panel">
        <div class="panel-header">
          <h3>📋 Adaptaciones Finales</h3>
          <div class="panel-tools">
            <label>Alumno</label>
            <select v-model="adaptAlumnoId" class="input">
              <option :value="''">Selecciona un alumno</option>
              <option v-for="n in niñosSala" :key="n.id" :value="n.id">{{ n.nombre }} {{ n.apellido }}</option>
            </select>
            <label>Materia</label>
            <select v-model="adaptMateriaId" class="input">
              <option :value="''">Selecciona materia</option>
              <option v-for="m in materiasSala" :key="m.id" :value="m.id">{{ m.nombre }}</option>
            </select>
          </div>
        </div>
        <div class="form-card">
          <div class="form-row">
            <label>Adaptación (texto)</label>
            <textarea v-model="adaptTexto" class="input" rows="4" placeholder="Escribe la adaptación final..."></textarea>
          </div>
          <div class="acciones">
            <button class="btn-primary" :disabled="!puedeGuardarAdaptacion" @click="guardarAdaptacionTexto">Guardar texto</button>
          </div>
        </div>
        <div class="form-card">
          <div class="form-row">
            <label>Subir PDF</label>
            <input type="file" accept="application/pdf" class="input" @change="onAdaptPdfChange" />
          </div>
          <div class="acciones">
            <button class="btn-secondary" :disabled="!adaptAlumnoId || !adaptMateriaId || !adaptPdfFile" @click="subirAdaptacionPDF">Subir PDF</button>
          </div>
        </div>
        <div class="list-section">
          <h4>Textos guardados</h4>
          <ul v-if="adaptacionesText.length">
            <li v-for="a in adaptacionesText" :key="a.id">{{ formatDate(a.fecha) }} — {{ (a.texto || '').slice(0,120) }}{{ (a.texto||'').length>120 ? '…' : '' }}</li>
          </ul>
          <div v-else class="no-calificaciones">Sin textos aún</div>
          <h4>Archivos PDF</h4>
          <ul v-if="adaptacionesPDF.length">
            <li v-for="p in adaptacionesPDF" :key="p.filename"><a :href="p.url" target="_blank" rel="noopener">{{ p.filename }}</a> • {{ formatDate(p.modifiedAt) }} <button class="btn-danger xsmall" @click="eliminarAdaptacionPDF(p.filename)">Eliminar</button></li>
          </ul>
          <div v-else class="no-calificaciones">Sin PDFs aún</div>
        </div>
      </div>
            
  
            
  
          </div>
        </div>
      </div>
  </div>

  <!-- Modal completo de materias con CRUD de notas y gestión de PDF -->
  <MateriaModal
    :visible="mostrarModalMateriaCompleto"
    :alumno="alumnoParaMateriaCompleto"
    @close="mostrarModalMateriaCompleto = false"
  />
</template>
  
  <script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import MateriaModal from '../components/MateriaModal.vue'
  
  const router = useRouter()
  
  // Estado reactivo para Inicial
  const salasInicial = ref([])
  const salaSeleccionada = ref(null)
  const niñosSala = ref([])
  const docentesSala = ref([])
  const areasDesarrollo = ref([])
  const informesInicial = ref([])
  const tabActiva = ref('ninos')
  const mostrarModalAgregarAlumno = ref(false)
  const nuevoAlumno = ref({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    nombre_responsable: '',
    telefono_responsable: ''
  })
  
  // Tabs específicas para Inicial
  const tabsInicial = ref([
    { id: 'ninos', nombre: 'Lista de Alumnos', icon: '👶' },
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
  const cargarSalasInicial = async () => {
    try {
      console.log('cargarSalasInicial: inicio')
      const res = await fetch('/api/cursos', getAuthHeaders())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const cursos = Array.isArray(data) ? data : []
      const soloInicial = cursos.filter(c => String(c.nivel || '').toLowerCase() === 'inicial')
      salasInicial.value = soloInicial.map(sala => ({
        id: sala.id,
        nombre: sala.nombre,
        edad: sala.grado || sala.edad || 3,
        turno: sala.turno || 'Mañana',
        nombre_colegio: sala.nombre_colegio || '-',
        cantidad_alumnos: Math.floor(Math.random() * 25) + 10
      }))
      console.log('cargarSalasInicial: conteo', { total: cursos.length, inicial: soloInicial.length })
    } catch (error) {
      console.error('Error cargando salas de inicial:', error)
      salasInicial.value = []
    }
  }
  
  const seleccionarSala = async (sala) => {
    salaSeleccionada.value = sala
    tabActiva.value = 'ninos'
    
    // Cargar datos de la sala seleccionada
    await Promise.all([
      cargarNinosSala(sala.id),
      cargarAreasDesarrollo(sala.id),
      cargarInformesInicial(sala.id),
      cargarMateriasSala(sala.id)
    ])
    await cargarDiagnosticosSala()
    await cargarActasSala()
  }

  const abrirModalAgregarAlumno = () => {
    nuevoAlumno.value = { nombre: '', apellido: '', fecha_nacimiento: '', nombre_responsable: '', telefono_responsable: '' }
    mostrarModalAgregarAlumno.value = true
  }

  const abrirModalAgregarAlumnoDirecto = (sala) => {
    // Seleccionar la sala primero
    seleccionarSala(sala)
    // Luego abrir el modal de agregar alumno
    nuevoAlumno.value = { nombre: '', apellido: '', fecha_nacimiento: '', nombre_responsable: '', telefono_responsable: '' }
    mostrarModalAgregarAlumno.value = true
  }

  const cerrarModalAgregarAlumno = () => {
    mostrarModalAgregarAlumno.value = false
  }

  const guardarNuevoAlumno = async () => {
    try {
      
      // Generar email único basado en nombre y apellido
      const email = `${nuevoAlumno.value.nombre.toLowerCase().replace(/\s+/g, '')}.${nuevoAlumno.value.apellido.toLowerCase().replace(/\s+/g, '')}@inicial.psicole`.replace(/[^a-zA-Z0-9.@]/g, '')
      
      const payload = {
        nombre: nuevoAlumno.value.nombre,
        apellido: nuevoAlumno.value.apellido,
        email: email,
        fecha_nacimiento: nuevoAlumno.value.fecha_nacimiento,
        nivel: 'Inicial',
        curso_id: salaSeleccionada.value?.id,
        nombre_padre: nuevoAlumno.value.nombre_responsable,
        telefono_padre: nuevoAlumno.value.telefono_responsable,
        // Campos adicionales requeridos por el backend
        dni: '',
        genero: '',
        direccion: '',
        telefono: nuevoAlumno.value.telefono_responsable,
        nombre_madre: '',
        telefono_madre: ''
      }
      
      const res = await fetch('/api/alumnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders().headers
        },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const ct = res.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const data = await res.json()
            msg = data?.error || data?.message || msg
          } else {
            msg = await res.text()
          }
        } catch {}
        throw new Error(msg || `HTTP ${res.status}`)
      }
      
      const creado = await res.json()
      
      // Agregar el alumno a la lista local
      niñosSala.value.push({
        id: creado.id,
        nombre: creado.nombre,
        apellido: creado.apellido,
        fecha_nacimiento: creado.fecha_nacimiento,
        nombre_responsable: creado.nombre_padre || nuevoAlumno.value.nombre_responsable,
        telefono_responsable: creado.telefono_padre || nuevoAlumno.value.telefono_responsable,
        nivel_desarrollo: 'En progreso',
        observaciones_desarrollo: ''
      })
      
      alert('Alumno guardado exitosamente')
      cerrarModalAgregarAlumno()
      
    } catch (err) {
      console.error('Error guardando alumno:', err)
      alert('Error al guardar el alumno: ' + err.message)
    }
  }

  const cargarMateria = (nino) => {
    if (!nino || !nino.id) {
      alert('Alumno inválido para abrir Materias')
      return
    }
    alumnoParaMateria.value = nino
    materiaSeleccionadaId.value = ''
    nuevaMateriaNombre.value = ''
    nuevaMateriaDescripcion.value = ''
    mostrarModalMateria.value = true
    cargarMateriasDisponiblesParaAlumno(nino)
  }

  const colocarCalificaciones = (nino) => {
    router.push(`/menu/calificaciones?alumnoId=${nino.id}`)
  }

  const eliminarAlumno = async (nino) => {
    try {
      if (!nino || !nino.id) {
        alert('Alumno inválido')
        return
      }
      const confirmar = window.confirm(`¿Seguro que deseas eliminar al alumno \"${nino.nombre} ${nino.apellido}\"? Esta acción no se puede deshacer.`)
      if (!confirmar) return

      const res = await fetch(`/api/alumnos/${nino.id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders().headers
        }
      })

      if (!res.ok) {
        let msg = `Error HTTP ${res.status}`
        try { const data = await res.json(); if (data?.error) msg = data.error } catch {}
        throw new Error(msg)
      }

      // Remover del listado local
      niñosSala.value = niñosSala.value.filter(a => a.id !== nino.id)
      alert('Alumno eliminado correctamente')
    } catch (err) {
      console.error('Error eliminando alumno:', err)
      alert('No se pudo eliminar el alumno: ' + err.message)
    }
  }

  const agregarPlanificacion = (nino) => {
    router.push(`/menu/alumno/${nino.id}?tab=final`)
  }
  
  const cargarNinosSala = async (salaId) => {
    try {
      const res = await fetch('/api/alumnos', {
        headers: { ...getAuthHeaders().headers }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const alumnos = await res.json()
      // Filtrar por nivel Inicial y sala/curso seleccionado
      const lista = (Array.isArray(alumnos) ? alumnos : []).filter(a => {
        const esInicial = (a.nivel || '').toLowerCase() === 'inicial'
        return esInicial && Number(a.curso_id) === Number(salaId)
      })
      // Mapear a estructura usada en la tabla
      niñosSala.value = lista.map(a => ({
        id: a.id,
        nombre: a.nombre,
        apellido: a.apellido || '',
        fecha_nacimiento: a.fecha_nacimiento,
        curso_id: a.curso_id,
        nombre_responsable: a.nombre_padre || a.nombre_madre || '',
        telefono_responsable: a.telefono_padre || a.telefono_madre || a.telefono || '',
        nivel_desarrollo: '—',
        observaciones_desarrollo: ''
      }))
    } catch (error) {
      console.error('Error cargando niños:', error)
      // Fallback vacío para evitar IDs inexistentes
      niñosSala.value = []
    }
  }
  
  const cargarAreasDesarrollo = async (salaId) => {
    try {
    const token = localStorage.getItem('token')
    const resp = await fetch(`/api/areas-desarrollo?sala_id=${salaId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      // Si no hay datos en backend, mostramos valores por defecto en UI
      areasDesarrollo.value = (Array.isArray(data) && data.length) ? data : [
        { id: undefined, nombre: 'Desarrollo del Lenguaje', observaciones: 0, avance: 0, niños_con_dificultad: 0 },
        { id: undefined, nombre: 'Desarrollo Motor Grueso', observaciones: 0, avance: 0, niños_con_dificultad: 0 },
        { id: undefined, nombre: 'Desarrollo Socio-Afectivo', observaciones: 0, avance: 0, niños_con_dificultad: 0 }
      ]
    } catch (error) {
      console.warn('No se pudo cargar áreas de desarrollo desde backend, usando valores por defecto:', error)
      // Fallback por defecto si la API no existe o devuelve 404
      areasDesarrollo.value = [
        { id: undefined, nombre: 'Desarrollo del Lenguaje', observaciones: 0, avance: 0, niños_con_dificultad: 0 },
        { id: undefined, nombre: 'Desarrollo Motor Grueso', observaciones: 0, avance: 0, niños_con_dificultad: 0 },
        { id: undefined, nombre: 'Desarrollo Socio-Afectivo', observaciones: 0, avance: 0, niños_con_dificultad: 0 }
      ]
    }
  }
  
  const cargarInformesInicial = async (salaId) => {
    try {
      const res = await fetch(`/api/informes-inicial?sala_id=${encodeURIComponent(salaId)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      informesInicial.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.warn('Error cargando informes, continúo con lista vacía:', error)
      informesInicial.value = []
    }
  }
  
  // Sección de actividades lúdicas retirada para Nivel Inicial
  
  // Métodos específicos para Inicial
  const calcularEdadMeses = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0
    const nacimiento = new Date(fechaNacimiento)
    const hoy = new Date()
    let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12
    meses -= nacimiento.getMonth()
    meses += hoy.getMonth()
    return meses <= 0 ? 0 : meses
  }
  
  const calcularEdadAnios = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0
    const nacimiento = new Date(fechaNacimiento)
    const hoy = new Date()
    let anios = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      anios--
    }
    return anios <= 0 ? 0 : anios
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES')
  }
  
  // Estado para modales y selección
  const ninoSeleccionado = ref(null)
  const mostrarModalNino = ref(false)
  const mostrarModalDesarrollo = ref(false)
  const mostrarModalInforme = ref(false)
  const mostrarModalObservacion = ref(false)
  const textoObservacion = ref('')
  const areaParaObservacionId = ref(null)
  const informeSeleccionado = ref(null)
  const mostrarModalInformeGrupal = ref(false)
  const informeGrupal = ref({ titulo: '', desarrollo_general: '', recomendaciones: '' })

  // Estado para Áreas de Desarrollo
  const areaSeleccionada = ref(null)
  const mostrarModalAreaDetalles = ref(false)
  const mostrarModalAvance = ref(false)
  const registrosAreas = ref({})
  const formAvance = ref({ porcentaje: 0, observacion: '', conDificultad: 0 })

  // Métodos de interfaz
  const verNino = (nino) => {
    ninoSeleccionado.value = nino
    mostrarModalNino.value = true
  }
  
  const verDesarrollo = (nino) => {
    ninoSeleccionado.value = nino
    mostrarModalDesarrollo.value = true
  }
  
  const verInformeInicial = (nino) => {
    const encontrado = informesInicial.value.find(i => i.nombre_nino === `${nino.nombre}` || i.nombre_nino?.includes(nino.nombre))
    informeSeleccionado.value = encontrado || {
      nombre_nino: nino.nombre,
      fecha: new Date().toISOString().slice(0,10),
      desarrollo_general: 'Sin informe cargado aún.',
      areas_evaluadas: [],
      recomendaciones: ''
    }
    mostrarModalInforme.value = true
  }

  const abrirInformeGrupal = () => {
    informeGrupal.value = { titulo: salaSeleccionada.value?.nombre || '', desarrollo_general: '', recomendaciones: '' }
    mostrarModalInformeGrupal.value = true
  }

  const cerrarModalInformeGrupal = () => { mostrarModalInformeGrupal.value = false }

  const guardarInformeGrupal = async () => {
    try {
      const payload = {
        sala_id: salaSeleccionada.value?.id || null,
        nombre_nino: null,
        fecha: new Date().toISOString(),
        desarrollo_general: informeGrupal.value.desarrollo_general,
        recomendaciones: informeGrupal.value.recomendaciones,
        tipo: 'grupal'
      }
      const res = await fetch('/api/informes-inicial', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const saved = await res.json()
      informesInicial.value.unshift(saved)
      cerrarModalInformeGrupal()
    } catch (e) {
      console.error('No se pudo guardar informe grupal:', e)
      cerrarModalInformeGrupal()
    }
  }

  // Materias (modal rápido)
  const mostrarModalMateria = ref(false)
  const alumnoParaMateria = ref(null)
  const materiasDisponibles = ref([])
  const materiaSeleccionadaId = ref('')
  const nuevaMateriaNombre = ref('')
  const nuevaMateriaDescripcion = ref('')
  const cerrandoMateria = ref(false)

  // Nuevo modal completo de materias (CRUD notas + PDF)
  const mostrarModalMateriaCompleto = ref(false)
  const alumnoParaMateriaCompleto = ref(null)

  const cerrarModalMateria = () => {
    if (cerrandoMateria.value) return
    cerrandoMateria.value = true
    mostrarModalMateria.value = false
    setTimeout(() => { cerrandoMateria.value = false }, 200)
  }

  const cargarMateriasDisponiblesParaAlumno = async (nino) => {
    try {
      const token = localStorage.getItem('token')
      let url = '/api/materias'
      if (nino?.curso_id) {
        url = `/api/cursos/${nino.curso_id}/materias`
      }
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (!res.ok) throw new Error(await res.text())
      materiasDisponibles.value = await res.json()
    } catch (err) {
      console.error('Error cargando materias:', err)
      materiasDisponibles.value = []
    }
  }

  const asignarMateriaModal = async () => {
    try {
      if (!alumnoParaMateria.value?.id || !materiaSeleccionadaId.value) {
        alert('Seleccione una materia')
        return
      }
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/alumnos/${alumnoParaMateria.value.id}/materias`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ materia_id: materiaSeleccionadaId.value })
      })
      if (!res.ok) throw new Error(await res.text())
      alert('Materia asignada correctamente')
      cerrarModalMateria()
    } catch (err) {
      console.error('Error asignando materia:', err)
      alert('No se pudo asignar la materia: ' + (err?.message || 'Error'))
    }
  }

  const crearYAsignarMateriaModal = async () => {
    try {
      if (!alumnoParaMateria.value?.curso_id) {
        alert('El alumno no tiene curso; defina uno para crear materia')
        return
      }
      if (!nuevaMateriaNombre.value) {
        alert('Ingrese un nombre para la materia')
        return
      }
      const token = localStorage.getItem('token')
      const resCrear = await fetch(`/api/cursos/${alumnoParaMateria.value.curso_id}/materias`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevaMateriaNombre.value, descripcion: nuevaMateriaDescripcion.value })
      })
      if (!resCrear.ok) throw new Error(await resCrear.text())
      const creada = await resCrear.json()
      const resAsignar = await fetch(`/api/alumnos/${alumnoParaMateria.value.id}/materias`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ materia_id: creada.id })
      })
      if (!resAsignar.ok) throw new Error(await resAsignar.text())
      alert('Materia creada y asignada correctamente')
      cerrarModalMateria()
    } catch (err) {
      console.error('Error creando/asignando materia:', err)
      alert('No se pudo crear/asignar la materia: ' + (err?.message || 'Error'))
    }
  }

  const nuevaObservacion = () => {
    textoObservacion.value = ''
    areaParaObservacionId.value = areasDesarrollo.value[0]?.id || null
    mostrarModalObservacion.value = true
  }
  
  const verDetallesArea = (area) => {
    areaSeleccionada.value = area
    // Cargar historial desde backend si hay id
    if (area?.id) cargarHistorialArea(area.id)
    mostrarModalAreaDetalles.value = true
  }
  
  const registrarAvanceArea = (area) => {
    areaSeleccionada.value = area
    formAvance.value = { porcentaje: area.avance || 0, observacion: '', conDificultad: area.niños_con_dificultad || 0 }
    mostrarModalAvance.value = true
  }
  
  const generarInformeGrupal = () => {
    const total = niñosSala.value.length
    const avancePromedio = Math.round(
      areasDesarrollo.value.reduce((acc, a) => acc + (a.avance || 0), 0) / (areasDesarrollo.value.length || 1)
    )
    const contenido = `Informe Grupal - ${salaSeleccionada.value?.nombre || ''}\nNiños: ${total}\nAvance promedio áreas: ${avancePromedio}%`
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `informe_grupal_${salaSeleccionada.value?.id || 'sala'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const verInformeCompleto = (informe) => {
    console.log('Ver informe completo de:', informe.nombre_nino)
  }
  
  const editarInforme = (informe) => {
    informeSeleccionado.value = { ...informe }
    mostrarModalInforme.value = true
  }
  
  const exportarInforme = (informe) => {
    const datos = `Informe Inicial\nNiño: ${informe.nombre_nino}\nFecha: ${formatDate(informe.fecha)}\nResumen: ${informe.desarrollo_general}\nRecomendaciones: ${informe.recomendaciones}`
    const blob = new Blob([datos], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `informe_${(informe.nombre_nino || 'nino').replace(/\s+/g,'_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const guardarInformeSeleccionado = async () => {
    if (!informeSeleccionado.value) return cerrarModal()
    const payload = { ...informeSeleccionado.value }
    payload.sala_id = salaSeleccionada.value?.id || payload.sala_id
    if (!payload.fecha) payload.fecha = new Date().toISOString()
    try {
      const method = payload.id ? 'PUT' : 'POST'
      const res = await fetch('/api/informes-inicial', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const saved = await res.json()
      if (payload.id) {
        const idx = informesInicial.value.findIndex(i => i.id === payload.id)
        if (idx !== -1) informesInicial.value[idx] = saved
      } else {
        informesInicial.value.unshift(saved)
      }
      cerrarModal()
    } catch (err) {
      console.error('No se pudo guardar informe. Fallback local:', err)
      if (!payload.id) {
        payload.id = Date.now()
        informesInicial.value.unshift(payload)
      } else {
        const idx = informesInicial.value.findIndex(i => i.id === payload.id)
        if (idx !== -1) informesInicial.value[idx] = payload
      }
      cerrarModal()
    }
  }
  
  // Módulo de actividades lúdicas removido para simplificar Nivel Inicial
  
  
  
  
  // Crear Sala/Curso
  const mostrarModalCurso = ref(false)
  const modoEdicion = ref(false)
  const cursoEditando = ref(null)
  const nuevoCurso = ref({ nombre: '', edad: 3, turno: 'Mañana', colegio_id: null })

  const abrirModalCurso = () => {
    modoEdicion.value = false
    nuevoCurso.value = { nombre: '', edad: 3, turno: 'Mañana', colegio_id: null }
    mostrarModalCurso.value = true
  }

  const cerrarModalCurso = () => {
    mostrarModalCurso.value = false
    cursoEditando.value = null
  }

  // Función para abrir el modal completo de materias
  const abrirModalMateriaCompleto = (nino) => {
    alumnoParaMateriaCompleto.value = nino
    mostrarModalMateriaCompleto.value = true
  }

  const verPerfilNino = (nino) => {
    if (!nino?.id) return
    router.push(`/menu/alumno/${nino.id}`)
  }

  const verDiagnosticos = (nino) => {
    router.push('/menu/dai')
  }

  const materiasSala = ref([])
  const recomendacionesDAI = ref([])
  const nuevaSugerenciaDAI = ref('')
  const mostrarModalActa = ref(false)
  const actasSala = ref([])
  const actaForm = ref({ titulo: '', fecha: new Date().toISOString().slice(0,10), asistentes: '', temas: '', acuerdos: '', acciones: '', observaciones: '' })
  const adaptacionesCurriculares = ref([])
  const adaptAlumnoId = ref('')
  const adaptMateriaId = ref('')
  const adaptTexto = ref('')
  const adaptPdfFile = ref(null)
  const adaptacionesText = ref([])
  const adaptacionesPDF = ref([])
  const nuevaObservacionCurso = ref('')
  const observacionesCurso = ref([])
  const diagnosticosPorNino = ref({})
  const nuevoDiagnosticoTexto = ref({})
  const editObsIndex = ref(-1)
  const editObsText = ref('')

  const cargarMateriasSala = async (salaId) => {
    try {
      const res = await fetch(`/api/cursos/${salaId}/materias`, { headers: getAuthHeaders().headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      materiasSala.value = Array.isArray(data) ? data : []
    } catch (err) {
      materiasSala.value = []
    }
  }

  const crearMateriaSala = async () => {
    if (!salaSeleccionada.value?.id || !nuevaMateriaNombre.value) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/cursos/${salaSeleccionada.value.id}/materias`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevaMateriaNombre.value, descripcion: nuevaMateriaDescripcion.value })
      })
      if (!res.ok) throw new Error(await res.text())
      const creada = await res.json()
      materiasSala.value.push(creada)
      nuevaMateriaNombre.value = ''
      nuevaMateriaDescripcion.value = ''
    } catch (err) {
      console.error(err)
    }
  }

  const eliminarMateria = async (materia) => {
    try {
      if (!materia || !materia.id) return
      const confirmar = window.confirm(`¿Eliminar la materia "${materia.nombre}"? Se quitará del curso y de los alumnos asociados.`)
      if (!confirmar) return

      const res = await fetch(`/api/materias/${materia.id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders().headers }
      })
      if (!res.ok) {
        let msg = `Error HTTP ${res.status}`
        try { const data = await res.json(); if (data?.error) msg = data.error } catch {}
        throw new Error(msg)
      }

      materiasSala.value = materiasSala.value.filter(m => m.id !== materia.id)
      alert('Materia eliminada correctamente')
    } catch (err) {
      console.error('Error eliminando materia:', err)
      alert('No se pudo eliminar la materia: ' + (err?.message || 'Error'))
    }
  }

  const verPlanificacionMateriaInicial = (materia) => {
    if (!materia?.id) return
    router.push({ path: '/menu/simple-notas', query: { materiaId: materia.id } })
  }

  const puedeGuardarAdaptacion = computed(() => !!adaptAlumnoId.value && !!adaptMateriaId.value && !!(adaptTexto.value && adaptTexto.value.trim()))
  const onAdaptPdfChange = (e) => { const f = e.target.files?.[0]; adaptPdfFile.value = f || null }
  const cargarAdaptaciones = async () => {
    try {
      if (!adaptAlumnoId.value || !adaptMateriaId.value) { adaptacionesText.value = []; adaptacionesPDF.value = []; return }
      const headers = getAuthHeaders().headers
      const tRes = await fetch(`/api/alumnos/${adaptAlumnoId.value}/materias/${adaptMateriaId.value}/adaptaciones`, { headers })
      adaptacionesText.value = tRes.ok ? await tRes.json() : []
      const pRes = await fetch(`/api/alumnos/${adaptAlumnoId.value}/materias/${adaptMateriaId.value}/adaptaciones/pdf`, { headers })
      adaptacionesPDF.value = pRes.ok ? await pRes.json() : []
    } catch { adaptacionesText.value = []; adaptacionesPDF.value = [] }
  }
  const guardarAdaptacionTexto = async () => {
    try {
      if (!puedeGuardarAdaptacion.value) return
      const headers = { ...getAuthHeaders().headers, 'Content-Type': 'application/json' }
      const res = await fetch(`/api/alumnos/${adaptAlumnoId.value}/materias/${adaptMateriaId.value}/adaptaciones`, { method: 'POST', headers, body: JSON.stringify({ texto: adaptTexto.value, estado: 'final' }) })
      if (!res.ok) throw new Error(await res.text())
      adaptTexto.value = ''
      await cargarAdaptaciones()
      alert('Adaptación guardada')
    } catch (e) { alert('No se pudo guardar la adaptación') }
  }
  const subirAdaptacionPDF = async () => {
    try {
      if (!adaptAlumnoId.value || !adaptMateriaId.value || !adaptPdfFile.value) return
      const fd = new FormData(); fd.append('file', adaptPdfFile.value)
      const headers = getAuthHeaders().headers
      const res = await fetch(`/api/alumnos/${adaptAlumnoId.value}/materias/${adaptMateriaId.value}/adaptaciones/pdf`, { method: 'POST', headers, body: fd })
      if (!res.ok) throw new Error(await res.text())
      adaptPdfFile.value = null
      await cargarAdaptaciones()
      alert('PDF subido')
    } catch (e) { alert('No se pudo subir el PDF') }
  }
  const eliminarAdaptacionPDF = async (filename) => {
    try {
      const headers = getAuthHeaders().headers
      const res = await fetch(`/api/alumnos/${adaptAlumnoId.value}/materias/${adaptMateriaId.value}/adaptaciones/pdf/${encodeURIComponent(filename)}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error(await res.text())
      await cargarAdaptaciones()
    } catch (e) { alert('No se pudo eliminar el PDF') }
  }

  watch([adaptAlumnoId, adaptMateriaId], cargarAdaptaciones)
  const irANotasMateria = (materia) => {
    if (!materia?.id) return
    router.push({ path: '/menu/calificaciones', query: { asignaturaId: materia.id } })
  }
  const mostrarModalSubirPlanif = ref(false)
  const materiaParaSubir = ref(null)
  const alumnoParaSubirId = ref('')
  const archivoPlanif = ref(null)
  const abrirModalSubirPlanif = (materia) => {
    materiaParaSubir.value = materia
    alumnoParaSubirId.value = ''
    archivoPlanif.value = null
    mostrarModalSubirPlanif.value = true
  }
  const mostrarModalEncuestaInicial = ref(false)
  const materiaParaEncuestaInicial = ref(null)
  const alumnoEncuestaInicialId = ref('')
  const encuestaFechaInicial = ref(new Date().toISOString().slice(0,10))
  const encuestaRespuestasInicial = ref({ atencion:'', comunicacion:'', interaccion:'', autonomia:'', regulacion:'', conducta:'' })
  const abrirModalEncuestaInicial = (materia) => {
    materiaParaEncuestaInicial.value = materia
    alumnoEncuestaInicialId.value = ''
    encuestaFechaInicial.value = new Date().toISOString().slice(0,10)
    encuestaRespuestasInicial.value = { atencion:'', comunicacion:'', interaccion:'', autonomia:'', regulacion:'', conducta:'' }
    mostrarModalEncuestaInicial.value = true
  }
  const cerrarModalEncuestaInicial = () => {
    mostrarModalEncuestaInicial.value = false
    materiaParaEncuestaInicial.value = null
  }
  const guardarEncuestaInicial = async () => {
    try {
      if (!materiaParaEncuestaInicial.value?.id || !alumnoEncuestaInicialId.value) return
      const token = localStorage.getItem('token')
      const payload = {
        materia_id: materiaParaEncuestaInicial.value.id,
        atencion: encuestaRespuestasInicial.value.atencion,
        comunicacion: encuestaRespuestasInicial.value.comunicacion,
        interaccion: encuestaRespuestasInicial.value.interaccion,
        autonomia: encuestaRespuestasInicial.value.autonomia,
        regulacion: encuestaRespuestasInicial.value.regulacion,
        conducta: encuestaRespuestasInicial.value.conducta,
        fecha: encuestaFechaInicial.value
      }
      await axios.post(`/api/alumnos/${alumnoEncuestaInicialId.value}/encuestas/psico`, payload, { headers: { 'Authorization': `Bearer ${token}` } })
      mostrarModalEncuestaInicial.value = false
      alert('Encuesta guardada')
    } catch (err) {
      alert('No se pudo guardar la encuesta')
    }
  }
  const cerrarModalSubirPlanif = () => {
    mostrarModalSubirPlanif.value = false
    materiaParaSubir.value = null
    alumnoParaSubirId.value = ''
    archivoPlanif.value = null
  }
  const onPlanifFileChange = (e) => {
    const f = e.target.files?.[0]
    archivoPlanif.value = f || null
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
      alert('PDF subido correctamente')
      cerrarModalSubirPlanif()
    } catch (err) {
      alert(err?.response?.data?.error || 'No se pudo subir el PDF')
    }
  }

  const agregarObservacionCurso = () => {
    if (!nuevaObservacionCurso.value) return
    observacionesCurso.value.unshift(nuevaObservacionCurso.value)
    nuevaObservacionCurso.value = ''
  }

  const quitarObservacionCurso = (i) => {
    observacionesCurso.value.splice(i, 1)
  }

  const agregarDiagnostico = (nino) => {
    const texto = (nuevoDiagnosticoTexto.value[nino.id] || '').trim()
    if (!texto) return
    const token = localStorage.getItem('token')
    fetch(`/api/alumnos/${nino.id}/diagnosticos`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo_evaluacion: texto, diagnostico: texto })
    })
    .then(async (resp) => {
      if (!resp.ok) throw new Error(await resp.text())
      const creado = await resp.json()
      if (!diagnosticosPorNino.value[nino.id]) diagnosticosPorNino.value[nino.id] = []
      diagnosticosPorNino.value[nino.id].unshift(creado)
      nuevoDiagnosticoTexto.value[nino.id] = ''
    })
    .catch(() => {})
  }

  const quitarDiagnostico = (nino, diagId) => {
    const token = localStorage.getItem('token')
    fetch(`/api/alumnos/${nino.id}/diagnosticos/${diagId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(async (resp) => {
      if (!resp.ok) throw new Error(await resp.text())
      const list = diagnosticosPorNino.value[nino.id] || []
      diagnosticosPorNino.value[nino.id] = list.filter(d => d.id !== diagId)
    })
    .catch(() => {})
  }

  const cargarDiagnosticosSala = async () => {
    const alumnos = niñosSala.value.map(a => a.id)
    const token = localStorage.getItem('token')
    await Promise.all(alumnos.map(async (id) => {
      try {
        const resp = await fetch(`/api/alumnos/${id}/diagnosticos`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
        if (!resp.ok) return
        const arr = await resp.json()
        diagnosticosPorNino.value[id] = Array.isArray(arr) ? arr : []
      } catch {}
    }))
  }

  const editarObservacionCurso = (i, obs) => {
    editObsIndex.value = i
    editObsText.value = obs
  }

  const guardarObservacionCurso = (i) => {
    if (!(editObsText.value && editObsText.value.trim())) return
    observacionesCurso.value[i] = editObsText.value
    editObsIndex.value = -1
    editObsText.value = ''
  }

  const cancelarEdicionObservacionCurso = () => {
    editObsIndex.value = -1
    editObsText.value = ''
  }

  const irANotasAlumno = (nino) => {
    if (!nino || !nino.id) return
    router.push({ path: '/menu/calificaciones', query: { alumnoId: nino.id } })
  }

  const crearSala = async () => {
    try {
      const payload = {
        nombre: nuevoCurso.value.nombre,
        descripcion: null,
        nivel: 'Inicial',
        grado: nuevoCurso.value.edad, // usar grado para guardar edad
        turno: nuevoCurso.value.turno,
        capacidad_maxima: 25,
        colegio_id: nuevoCurso.value.colegio_id || null
      }
      const res = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders().headers },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await cargarSalasInicial()
      cerrarModalCurso()
    } catch (err) {
      console.error('Error creando sala:', err)
      // Fallback: agregar localmente
      salasInicial.value.unshift({
        id: Date.now(),
        nombre: nuevoCurso.value.nombre || `Sala de ${nuevoCurso.value.edad} años`,
        edad: nuevoCurso.value.edad,
        turno: nuevoCurso.value.turno,
        nombre_colegio: '-',
        cantidad_alumnos: Math.floor(Math.random() * 25) + 10
      })
      cerrarModalCurso()
    }
  }

  const editarSala = (sala) => {
    modoEdicion.value = true
    cursoEditando.value = sala
    nuevoCurso.value = {
      nombre: sala.nombre,
      edad: sala.edad,
      turno: sala.turno,
      colegio_id: sala.colegio_id || null
    }
    mostrarModalCurso.value = true
  }

  const guardarSala = async () => {
    if (!cursoEditando.value) return
    try {
      const id = cursoEditando.value.id
      const payload = {
        nombre: nuevoCurso.value.nombre,
        descripcion: cursoEditando.value.descripcion || null,
        nivel: 'Inicial',
        grado: nuevoCurso.value.edad,
        turno: nuevoCurso.value.turno,
        capacidad_maxima: cursoEditando.value.capacidad_maxima || 25,
        colegio_id: nuevoCurso.value.colegio_id || null
      }
      const res = await fetch(`/api/cursos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders().headers },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await cargarSalasInicial()
      cerrarModalCurso()
    } catch (err) {
      console.error('Error actualizando sala:', err)
      // Fallback local
      const idx = salasInicial.value.findIndex(c => c.id === cursoEditando.value.id)
      if (idx >= 0) {
        salasInicial.value[idx] = {
          ...salasInicial.value[idx],
          nombre: nuevoCurso.value.nombre,
          edad: nuevoCurso.value.edad,
          turno: nuevoCurso.value.turno,
          colegio_id: nuevoCurso.value.colegio_id || null
        }
      }
      cerrarModalCurso()
    }
  }

  const eliminarSala = async (sala) => {
    try {
      const res = await fetch(`/api/cursos/${sala.id}`, { method: 'DELETE', headers: { ...getAuthHeaders().headers } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await cargarSalasInicial()
    } catch (err) {
      console.error('Error eliminando sala:', err)
      salasInicial.value = salasInicial.value.filter(c => c.id !== sala.id)
    }
  }
  
  const exportarListaNinos = () => {
    const headers = ['Nombre','Edad (meses)','Fecha Nacimiento']
    const rows = niñosSala.value.map(n => {
      const meses = calcularEdadMeses(n.fecha_nacimiento)
      return [n.nombre, meses, n.fecha_nacimiento || '']
    })
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lista_ninos_${salaSeleccionada.value?.id || 'sala'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Acciones de cierre/guardar modales
  const cerrarModal = () => {
    mostrarModalNino.value = false
    mostrarModalDesarrollo.value = false
    mostrarModalInforme.value = false
    mostrarModalObservacion.value = false
    mostrarModalAreaDetalles.value = false
    mostrarModalAvance.value = false
    ninoSeleccionado.value = null
    informeSeleccionado.value = null
    areaSeleccionada.value = null
  }

  const guardarObservacion = () => {
    if (!textoObservacion.value.trim()) return cerrarModal()

    // Si hay un área seleccionada, registrar observación en el historial del área
    if (areaParaObservacionId.value) {
      const area = areasDesarrollo.value.find(a => a.id === areaParaObservacionId.value)
      const areaId = area?.id || areaParaObservacionId.value
      const mapa = registrosAreas.value
      if (!mapa[areaId]) mapa[areaId] = []
      mapa[areaId].unshift({
        fecha: new Date().toISOString(),
        porcentaje: Number(area?.avance) || 0,
        observacion: textoObservacion.value.trim(),
        conDificultad: Number(area?.niños_con_dificultad) || 0
      })

      // Incrementar contador de observaciones del área en la vista
      const idx = areasDesarrollo.value.findIndex(a => a.id === areaId)
      if (idx >= 0) {
        const current = areasDesarrollo.value[idx]
        areasDesarrollo.value[idx] = {
          ...current,
          observaciones: (current.observaciones || 0) + 1
        }
      }

      // Reflejar cambio si el modal de detalles está abierto sobre la misma área
      if (areaSeleccionada.value?.id === areaId) {
        areaSeleccionada.value = {
          ...areaSeleccionada.value,
          observaciones: (areaSeleccionada.value.observaciones || 0) + 1
        }
      }

      cerrarModal()
      return
    }

    // Fallback: si hay un niño seleccionado, guardar observación en su perfil
    const target = ninoSeleccionado.value
    if (target) {
      target.observaciones = target.observaciones || []
      target.observaciones.push({
        texto: textoObservacion.value.trim(),
        fecha: new Date().toISOString()
      })
    }
    cerrarModal()
  }

  const guardarAvanceArea = () => {
    if (!areaSeleccionada.value) return cerrarModal()
    const entradaLocal = {
      fecha: new Date().toISOString(),
      porcentaje: Math.max(0, Math.min(100, Number(formAvance.value.porcentaje) || 0)),
      observacion: (formAvance.value.observacion || '').trim(),
      conDificultad: Math.max(0, Number(formAvance.value.conDificultad) || 0)
    }

    const payload = {
      sala_id: salaSeleccionada.value?.id,
      area_id: areaSeleccionada.value?.id,
      nombre: areaSeleccionada.value?.nombre,
      porcentaje: entradaLocal.porcentaje,
      observacion: entradaLocal.observacion,
      conDificultad: entradaLocal.conDificultad
    }

    fetch('/api/areas-desarrollo/avance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (resp) => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = await resp.json()
        const updatedArea = data.area
        const histItem = data.historial

        // Sincroniza lista y selección
        const idx = areasDesarrollo.value.findIndex(a => a.nombre === updatedArea.nombre)
        if (idx >= 0) {
          areasDesarrollo.value[idx] = { ...areasDesarrollo.value[idx], ...updatedArea }
        } else {
          areasDesarrollo.value.push(updatedArea)
        }
        areaSeleccionada.value = { ...areaSeleccionada.value, ...updatedArea }

        // Historial local
        const idHist = updatedArea.id
        const mapa = registrosAreas.value
        if (!mapa[idHist]) mapa[idHist] = []
        mapa[idHist].unshift({
          fecha: new Date().toISOString(),
          porcentaje: histItem.porcentaje,
          observacion: histItem.observacion || '',
          conDificultad: histItem.con_dificultad || 0
        })

        cerrarModal()
      })
      .catch(err => {
        console.error('Error guardando avance:', err)
        // Fallback: actualizar solo localmente si backend falla
        const id = areaSeleccionada.value.id || areaSeleccionada.value.nombre
        const mapa = registrosAreas.value
        if (!mapa[id]) mapa[id] = []
        mapa[id].push(entradaLocal)
        areaSeleccionada.value.avance = entradaLocal.porcentaje
        areaSeleccionada.value.observaciones = (areaSeleccionada.value.observaciones || 0) + (entradaLocal.observacion ? 1 : 0)
        areaSeleccionada.value.niños_con_dificultad = entradaLocal.conDificultad
        cerrarModal()
      })
  }

  const cargarHistorialArea = async (areaId) => {
    try {
      const resp = await fetch(`/api/areas-desarrollo/historial?area_id=${areaId}`)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      registrosAreas.value[areaId] = (Array.isArray(data) ? data.map(h => ({
        fecha: h.fecha,
        porcentaje: h.porcentaje,
        observacion: h.observacion || '',
        conDificultad: h.con_dificultad || 0
      })) : [])
    } catch (err) {
      console.error('Error cargando historial del área:', err)
    }
  }
  
  // Inicialización
  onMounted(() => {
    console.log('Inicial.vue: onMounted start')
    cargarSalasInicial()
    console.log('Inicial.vue: onMounted after cargarSalasInicial')
  })
  const agregarSugerenciaDAI = () => {
    const texto = (nuevaSugerenciaDAI.value || '').trim()
    if (!texto) return
    recomendacionesDAI.value.unshift({ id: Date.now(), titulo: 'Sugerencia', descripcion: texto, prioridad: 'media' })
    nuevaSugerenciaDAI.value = ''
  }
  const quitarSugerenciaDAI = (id) => {
    recomendacionesDAI.value = recomendacionesDAI.value.filter(r => r.id !== id)
  }
  const abrirModalActa = () => {
    mostrarModalActa.value = true
    actaForm.value = { titulo: '', fecha: new Date().toISOString().slice(0,10), asistentes: '', temas: '', acuerdos: '', acciones: '', observaciones: '' }
  }
  const cerrarModalActa = () => { mostrarModalActa.value = false }
  const guardarActa = async () => {
    if (!salaSeleccionada.value?.id || !actaForm.value.titulo) return
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/actas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sala_id: salaSeleccionada.value.id, fecha: actaForm.value.fecha, titulo: actaForm.value.titulo, asistentes: actaForm.value.asistentes, temas: actaForm.value.temas, acuerdos: actaForm.value.acuerdos, acciones: actaForm.value.acciones, observaciones: actaForm.value.observaciones })
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const saved = await res.json()
      actasSala.value.unshift(saved)
      mostrarModalActa.value = false
    } catch (e) {}
  }
  const cargarActasSala = async () => {
    if (!salaSeleccionada.value?.id) return
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/actas?sala_id=${salaSeleccionada.value.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) return
      const data = await res.json()
      actasSala.value = Array.isArray(data) ? data : []
    } catch {}
  }
  const exportarActaPDF = (acta) => {
    try {
      const nombreSala = salaSeleccionada.value?.nombre || '-'
      const fecha = acta?.fecha ? new Date(acta.fecha).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR')
      console.log('Exportar PDF (Inicial)', { sala: nombreSala, titulo: acta?.titulo, id: acta?.id })
      const partes = []
      partes.push('<html>')
      partes.push('<body style="font-family: Arial, sans-serif; margin: 40px;">')
      partes.push('<div style="text-align: center; margin-bottom: 20px;">')
      partes.push('<div style="color:#111827; font-size:22px; font-weight:bold;">Acta de reunión</div>')
      partes.push('<div style="color:#374151; margin-top:6px;">Sala: ' + nombreSala + '</div>')
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
      console.log('PDF listo para imprimir (Inicial)', { fecha: new Date().toISOString() })
      setTimeout(() => win.print(), 250)
    } catch {}
  }
  const encuestaInline = ref({})
  const getEncuestaInline = (materiaId) => {
    if (!encuestaInline.value[materiaId]) {
      encuestaInline.value[materiaId] = { alumnoId: '', fecha: new Date().toISOString().slice(0,10), atencion: null, comunicacion: null, interaccion: null, autonomia: null, regulacion: null, conducta: null }
    }
    return encuestaInline.value[materiaId]
  }
  const setEncuestaValor = (materiaId, campo, valor) => {
    const obj = getEncuestaInline(materiaId)
    obj[campo] = valor
  }
  const puedeGuardarEncuestaInline = (materiaId) => {
    const o = getEncuestaInline(materiaId)
    return !!o.alumnoId
  }
  const encuestasCountPorMateria = ref({})
  const guardarEncuestaInline = async (materia) => {
    try {
      const o = getEncuestaInline(materia.id)
      if (!o.alumnoId) return
      const token = localStorage.getItem('token')
      const payload = {
        materia_id: materia.id,
        atencion: o.atencion,
        comunicacion: o.comunicacion,
        interaccion: o.interaccion,
        autonomia: o.autonomia,
        regulacion: o.regulacion,
        conducta: o.conducta,
        fecha: o.fecha
      }
      await axios.post(`/api/alumnos/${o.alumnoId}/encuestas/psico`, payload, { headers: { 'Authorization': `Bearer ${token}` } })
      encuestasCountPorMateria.value[materia.id] = (encuestasCountPorMateria.value[materia.id] || 0) + 1
      alert('Encuesta guardada')
    } catch (err) {
      alert('No se pudo guardar la encuesta')
    }
  }
  </script>
  
<style scoped>
  /* Estilos específicos para Inicial */
  .inicial-header {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%) !important;
  }
  
  /* Estilos base alineados con Primario/Secundario */
.nivel-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}
.no-materias {
  display: grid;
  place-items: center;
  background: #f9fafb;
  border: 1px dashed #e5e7eb;
  color: #6b7280;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 14px;
}
  
  .nivel-header {
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
  
  /* Selección de curso/sala */
  .seleccion-curso {
    margin-bottom: 30px;
  }
  .seleccion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    color: #333;
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
    color: #333;
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
    color: #333;
  }
  
  .tab-button:hover {
    background: #f8f9fa;
  }
  
  .tab-button.active {
    border-bottom-color: #4facfe;
    color: #4facfe;
    font-weight: bold;
  }
  
  /* Panel header y acciones */
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
  
  /* Botones */
  .btn-primary, .btn-secondary, .btn-info, .btn-export, .btn-view, .btn-edit {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.3s ease;
  }
  
  .btn-primary { background: #4facfe; color: white; }
  .btn-primary:hover { background: #3a9dfc; }
  .btn-secondary { background: #6c757d; color: white; }
  .btn-info { background: #17a2b8; color: white; }
  .btn-export { background: #28a745; color: white; }
  .btn-view { background: #ffc107; color: #212529; }
  .btn-edit { background: #fd7e14; color: white; }
  .btn-success { background: #28a745; color: white; }
  .btn-success:hover { background: #218838; }
  .btn-large { padding: 12px 20px; font-size: 1.1em; }
  .btn-delete { background: #dc3545; color: white; }
  .btn-delete:hover { background: #c82333; }

  /* Mensajes de selección */
  .no-selection-message {
    background: white;
    border-radius: 15px;
    padding: 60px 30px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin: 30px 0;
  }

  .message-content {
    max-width: 500px;
    margin: 0 auto;
  }

  .message-icon {
    font-size: 4em;
    margin-bottom: 20px;
    color: #4facfe;
  }

  .message-content h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.5em;
  }

  .message-content p {
    color: #666;
    margin-bottom: 20px;
    font-size: 1.1em;
  }

  .message-content .btn-primary {
    margin-top: 15px;
  }
  
  /* Tablas */
  .alumnos-table { overflow-x: auto; }
  .alumnos-table table { width: 100%; border-collapse: collapse; }
  .alumnos-table th,
  .alumnos-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; color: #333; }
  .alumnos-table th { background: #f8f9fa; font-weight: bold; color: #333; }
  .alumnos-table tr:hover { background: #f8f9fa; }

  /* Modales */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    color: #333;
  }

  .btn-close {
    position: absolute;
    right: 16px;
    top: 12px;
    border: none;
    background: transparent;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }

  .modal-content .input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 10px 12px;
    margin-top: 8px;
    font-size: 0.95rem;
  }

  .form-row {
    margin: 12px 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  /* Estilos para áreas de desarrollo */
  .areas-desarrollo {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .area-card {
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 20px;
    background: white;
  }
  
  .area-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .area-progress {
    background: #007bff;
    color: white;
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 12px;
  }
  
  .area-stats {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: #007bff;
  }
  
  .stat-label {
    font-size: 12px;
    color: #666;
  }
  
  /* Estilos para informes */
  .informes-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .informe-card {
    border: 1px solid #e9ecef;
    border-radius: 10px;
    padding: 20px;
    background: white;
  }
  
  .informe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .informe-fecha {
    color: #666;
    font-size: 14px;
  }
  
  .informe-areas {
    display: flex;
    gap: 10px;
    margin: 10px 0;
    flex-wrap: wrap;
  }
  
  .area-evaluada {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .area-value {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .nivel-Avanzado { background: #28a745; color: white; }
  .nivel-Normal { background: #ffc107; color: #212529; }
  .nivel-Basico { background: #dc3545; color: white; }
  
  /* Sección de actividades lúdicas retirada en Nivel Inicial */
  
  /* Estilos para desarrollo de niños */
  .desarrollo-chip {
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .nivel-Avanzado { background: #28a745; color: white; }
  .nivel-Normal { background: #17a2b8; color: white; }
  .nivel-EnProceso { background: #ffc107; color: #212529; }
  
  .observaciones-corta {
    font-size: 11px;
    color: #666;
    margin-top: 2px;
  }
  
  /* Mantener los estilos generales del componente anterior */

  /* Estilos para acciones en tarjetas */
  .acciones {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

.acciones button {
  padding: 6px 10px;
  font-size: 0.8em;
  border-radius: 4px;
}

.planificacion-info {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
}
.planificacion-estado {
  background: #f0f2f5;
  color: #333;
  padding: 6px 10px;
  border-radius: 12px;
  font-weight: 600;
}
.planificacion-fecha {
  color: #555;
  font-size: 0.9em;
}

/* Encuesta inline por materia */
.encuesta-inline { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-top: 10px }
.inline-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px }
.scale-group { display: grid; gap: 8px }
.scale-row { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px }
.scale-label { font-weight: 600; margin-bottom: 6px; font-size: 14px }
.scale-buttons { display: flex; gap: 6px }
.scale-btn { padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; font-size: 12px }
.scale-btn.active { border-color: #2563eb; color: #2563eb; font-weight: 600; box-shadow: 0 0 0 1px rgba(37,99,235,0.18) }
.scale-ends { display: flex; justify-content: space-between; margin-top: 4px; color: #6b7280; font-size: 11px }
.encuestas-count { margin-left: 10px; font-size: 12px; color: #6b7280 }
</style>
