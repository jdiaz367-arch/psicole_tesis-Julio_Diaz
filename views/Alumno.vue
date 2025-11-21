<template>
  <div class="alumno-page">
    <div v-if="alumnoId" class="alumno-detalle-container">
      <div class="header-actions">
        <button @click="volverAlListado" class="btn-back">← Volver</button>
      </div>
      <h2>Materias</h2>

      <!-- Selector de curso si el alumno no tiene curso asignado -->
      <div v-if="!alumnoActual.curso_id" class="seleccion-curso">
        <div class="seleccion-curso-row">
          <span>Este alumno no tiene curso asignado.</span>
          <select v-model="cursoSeleccionado">
            <option :value="''">Seleccione curso</option>
            <option v-for="c in cursos" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
          <button class="btn-assign" :disabled="!cursoSeleccionado" @click="asignarCursoAlumno">Asignar curso</button>
        </div>
      </div>

      <!-- Formulario simple para crear materia en el curso del alumno -->
      <div class="crear-materia" v-if="alumnoActual.curso_id">
        <h3>Crear nueva materia</h3>
        <label>
          Nombre
          <input v-model="nuevaMateriaNombre" placeholder="Ej: Informática" />
        </label>
        <label>
          Profesor (opcional)
          <input v-model="nuevaMateriaDescripcion" placeholder="Ej: Prof. García" />
        </label>
        <label class="inline">
          <input type="checkbox" v-model="autoAsignarNuevaMateria" /> Asignar al alumno al crear
        </label>
        <button class="btn-add" :disabled="!nuevaMateriaNombre || !nuevaMateriaNombre.trim()" @click="crearMateriaDelCurso">Crear materia</button>
      </div>

      <!-- Lista de materias asignadas con acciones de planificación PDF -->
      <div class="materias-asignadas" v-if="materiasAsignadas && materiasAsignadas.length">
        <h3>Materias asignadas</h3>
        <ul class="lista-materias">
          <li v-for="m in materiasAsignadas" :key="m.id" class="item-materia">
            <div class="nombre">
              {{ m.nombre }}
              <div v-if="m.descripcion" class="profesor">Profesor: {{ m.descripcion }}</div>
              <div class="resumen-notas">
                <span>Promedio: {{ promedioNotas(m.id) }}</span>
                <span>Cant: {{ cantidadNotas(m.id) }}</span>
              </div>
            </div>
            <div class="acciones">
              <button class="btn" @click="irACalificacionesMateria(m.id)">Notas</button>
              <button class="btn" @click="abrirEncuestaPsico(m.id)">Encuesta</button>
              <button class="btn" @click="subirArchivoPDF(m.id)">Subir planificación PDF</button>
              <button class="btn" v-if="archivosPDF && archivosPDF[m.id]" @click="descargarArchivoPDF(m.id)">Descargar PDF</button>
              <button class="btn-danger" v-if="archivosPDF && archivosPDF[m.id]" @click="eliminarArchivoPDF(m.id)">Eliminar PDF</button>
              <button class="btn-outline" @click="quitarMateria(m.id)">Quitar</button>
            </div>
            <div v-if="panelNotasAbierto[m.id]" class="panel-notas">
              <h4>Notas</h4>
              <div class="carga-estructurada">
                <div class="titulo">Carga institucional</div>
                <div class="grid-campos">
                  <label>
                    N
                    <input type="number" min="0" max="10" step="0.1" v-model.number="notasEstructuradasPorMateria[m.id].N" />
                  </label>
                  <label>
                    R1
                    <input type="number" min="0" max="10" step="0.1" v-model.number="notasEstructuradasPorMateria[m.id].R1" />
                  </label>
                  <label>
                    R2
                    <input type="number" min="0" max="10" step="0.1" v-model.number="notasEstructuradasPorMateria[m.id].R2" />
                  </label>
                  <label>
                    EVAL 1
                    <input type="number" min="0" max="10" step="0.1" v-model.number="notasEstructuradasPorMateria[m.id].EVAL1" />
                  </label>
                </div>
                <div class="acciones-estructurada">
                  <button class="btn-add" @click="guardarNotasEstructuradas(m.id)">Guardar institucional</button>
                </div>
              </div>
              <ul class="lista-notas" v-if="(notasPorMateria[m.id]||[]).length">
                <li v-for="n in notasPorMateria[m.id]" :key="n.id" class="item-nota">
                  <span class="nota-valor">{{ n.nota }}</span>
                  <span class="nota-desc">{{ n.descripcion || '—' }}</span>
                  <button class="btn" @click="editarNotaInline(m.id, n)">Editar</button>
                  <button class="btn-danger" @click="borrarNotaInline(m.id, n.id)">Eliminar</button>
                </li>
              </ul>
              <div v-else class="sin-notas">No hay notas registradas.</div>
              <div class="cargar-notas">
                <div class="filas">
                  <div class="fila" v-for="(fila, idx) in (notasBatchPorMateria[m.id] || [])" :key="idx">
                    <input type="number" min="0" max="10" step="0.1" v-model="fila.nota" placeholder="Nota" />
                    <input type="text" v-model="fila.descripcion" placeholder="Descripción (opcional)" />
                    <button class="btn-danger" @click="quitarFilaNota(m.id, idx)">✖</button>
                  </div>
                </div>
                <div class="acciones-filas">
                  <button class="btn" @click="agregarFilaNota(m.id)">+ Fila</button>
                  <input type="number" min="1" max="50" v-model.number="cantidadFilasPorMateria[m.id]" placeholder="Cantidad" />
                  <button class="btn" @click="agregarVariasFilas(m.id)">+ Varias</button>
                  <button class="btn-add" :disabled="!puedeCargarBatch(m.id)" @click="cargarNotasBatch(m.id)">Guardar notas</button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="materias-asignadas-vacia">
        <p>No hay materias asignadas aún.</p>
      </div>

      
  </div>

  <div v-else class="form-container">
    <p>Seleccione un alumno para gestionar materias.</p>
  </div>

  <div v-if="mostrarModalEncuesta" class="modal-encuesta" @click="cerrarEncuestaPsico">
    <div class="contenido" @click.stop>
      <h3>Encuesta psicopedagógica</h3>
      <div class="grid">
        <div>
          <label>Atención y concentración</label>
          <select v-model="encuestaRespuestas.atencion">
            <option value="">Seleccionar</option>
            <option>Nunca</option>
            <option>A veces</option>
            <option>Frecuentemente</option>
            <option>Siempre</option>
          </select>
        </div>
        <div>
          <label>Comunicación y lenguaje</label>
          <select v-model="encuestaRespuestas.comunicacion">
            <option value="">Seleccionar</option>
            <option>Muy limitada</option>
            <option>Limitada</option>
            <option>Adecuada</option>
            <option>Muy adecuada</option>
          </select>
        </div>
        <div>
          <label>Interacción social</label>
          <select v-model="encuestaRespuestas.interaccion">
            <option value="">Seleccionar</option>
            <option>Dificulta mucho</option>
            <option>Dificulta a veces</option>
            <option>Adecuado</option>
            <option>Muy adecuado</option>
          </select>
        </div>
        <div>
          <label>Autonomía en tareas</label>
          <select v-model="encuestaRespuestas.autonomia">
            <option value="">Seleccionar</option>
            <option>Necesita asistencia total</option>
            <option>Parcial</option>
            <option>Independiente con apoyo mínimo</option>
            <option>Totalmente independiente</option>
          </select>
        </div>
        <div>
          <label>Regulación emocional</label>
          <select v-model="encuestaRespuestas.regulacion">
            <option value="">Seleccionar</option>
            <option>Se desregula fácilmente</option>
            <option>A veces se desregula</option>
            <option>Generalmente se regula</option>
            <option>Se regula muy bien</option>
          </select>
        </div>
        <div>
          <label>Conducta adaptativa</label>
          <select v-model="encuestaRespuestas.conducta">
            <option value="">Seleccionar</option>
            <option>Nunca</option>
            <option>A veces</option>
            <option>Frecuentemente</option>
            <option>Siempre</option>
          </select>
        </div>
      </div>
      <div class="acciones">
        <button class="btn-secondary" @click="cerrarEncuestaPsico">Cancelar</button>
        <button class="btn-primary" :disabled="!encuestaMateriaId" @click="guardarEncuestaPsico">Guardar</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'Alumnos',
  data() {
    return {
      // Datos del formulario de creación
      nombre: '', apellido: '', email: '', dni: '', fecha_nacimiento: '', genero: '',
      direccion: '', telefono: '', nombre_padre: '', telefono_padre: '', nombre_madre: '',
      telefono_madre: '', nivel: '',
      loading: false, error: '', success: '',
      alumnos: [], // Lista para almacenar alumnos existentes
      
      // Datos para vista individual de alumno
      alumnoActual: {},
      tabActiva: 'info',
      materiasCurso: [],
      todasMaterias: [],
      materiasAsignadas: [],
      materiaSeleccionada: '',
      materiaSeleccionadaFallback: '',
      cursos: [],
      cursoSeleccionado: '',
      nuevaMateriaNombre: '',
      nuevaMateriaDescripcion: '',
      autoAsignarNuevaMateria: true,
      nuevaNota: '',
      descripcionNota: '',
      notas: [],
      loadingNotas: false,
      panelNotasAbierto: {},
      notasBatchPorMateria: {},
      notasPorMateria: {},
      notasEstructuradasPorMateria: {},
      // Planificación por materia (persistida en localStorage por ahora)
      planificacionPorMateria: {},
      panelPlanificacionAbierto: {},
      cantidadFilasPorMateria: {},
      archivosPDF: {}, // Archivos PDF subidos por materia
      tabs: [
        { id: 'info', nombre: 'Información General' },
        { id: 'materias', nombre: 'Materias' }
      ]
    };
  },
  mounted() {
    // Si hay un ID en la ruta, cargar el alumno individual
    if (this.alumnoId) {
      this.cargarAlumnoIndividual();
      this.configurarTabsPorNivel();
    } else {
      this.obtenerAlumnos(); // Cargar lista de alumnos al iniciar el componente
    }
  },
  computed: {
    alumnoId() {
      return this.$route.params.id;
    }
  },
    methods: {
    abrirEncuestaPsico(materiaId) {
      this.encuestaMateriaId = materiaId
      this.encuestaRespuestas = {
        atencion: '',
        comunicacion: '',
        interaccion: '',
        autonomia: '',
        regulacion: '',
        conducta: ''
      }
      this.mostrarModalEncuesta = true
    },
    cerrarEncuestaPsico() {
      this.mostrarModalEncuesta = false
      this.encuestaMateriaId = null
    },
    async guardarEncuestaPsico() {
      if (!this.alumnoId || !this.encuestaMateriaId) return
      const token = localStorage.getItem('token')
      const payload = {
        materia_id: this.encuestaMateriaId,
        atencion: this.encuestaRespuestas.atencion,
        comunicacion: this.encuestaRespuestas.comunicacion,
        interaccion: this.encuestaRespuestas.interaccion,
        autonomia: this.encuestaRespuestas.autonomia,
        regulacion: this.encuestaRespuestas.regulacion,
        conducta: this.encuestaRespuestas.conducta
      }
      const res = await fetch(`/api/alumnos/${this.alumnoId}/encuestas/psico`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        alert('No se pudo guardar la encuesta')
        return
      }
      this.mostrarModalEncuesta = false
      await this.cargarEncuestasPsicoMateria(this.encuestaMateriaId)
    },
    async cargarEncuestasPsicoMateria(materiaId) {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/alumnos/${this.alumnoId}/encuestas/psico?materiaId=${materiaId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      if (res.ok) {
        const rows = await res.json()
        this.encuestasPorMateria = this.encuestasPorMateria || {}
        this.encuestasPorMateria[materiaId] = rows
      }
    },
    irACalificacionesMateria(materiaId) {
      if (!materiaId || !this.alumnoId) return
      this.$router.push({ path: '/menu/calificaciones', query: { alumnoId: this.alumnoId, asignaturaId: materiaId } })
    },
    async cargarAlumnoIndividual() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }

        const res = await fetch(`/api/alumnos/${this.alumnoId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error('Error al cargar alumno');
        
        this.alumnoActual = await res.json();

        // Cargar materias del curso y asignadas
        await this.cargarMateriasCurso();
        if (!this.materiasCurso || this.materiasCurso.length === 0) {
          await this.cargarTodasMaterias();
        }
        if (!this.alumnoActual.curso_id) {
          await this.cargarCursos();
        }
        await this.cargarMateriasAsignadas();
        // Cargar notas por materia para mostrar vista previa en cada bloque
        await this.cargarNotasTodasMaterias();
        // Cargar planificaciones por materia para edición/preview
        await this.cargarPlanificacionesTodasMaterias();
        
        // Cargar archivos PDF subidos
        this.cargarArchivosPDF();
        
        // Establecer tab desde la URL si existe
        const tabFromUrl = this.$route.query.tab;
        if (tabFromUrl) {
          this.cambiarTab(tabFromUrl);
        }
        
      } catch (err) {
        console.error('Error cargando alumno:', err);
        alert('Error al cargar los datos del alumno');
        this.$router.push('/menu/alumno');
    }
  },
  data() {
    return {
      mostrarModalEncuesta: false,
      encuestaMateriaId: null,
      encuestaRespuestas: {
        atencion: '',
        comunicacion: '',
        interaccion: '',
        autonomia: '',
        regulacion: '',
        conducta: ''
      },
      encuestasPorMateria: {}
    }
  }
    async cargarNotasTodasMaterias() {
      try {
        const ids = new Set([
          ...(this.materiasCurso || []).map(m => m.id),
          ...(this.materiasAsignadas || []).map(m => m.id)
        ]);
        await Promise.all(Array.from(ids).map(id => this.cargarNotasPorMateria(id)));
      } catch (err) {
        console.error('Error cargando notas para todas las materias:', err);
      }
    },
    async cargarPlanificacionesTodasMaterias() {
      try {
        const ids = new Set([
          ...(this.materiasCurso || []).map(m => m.id),
          ...(this.materiasAsignadas || []).map(m => m.id)
        ]);
        await Promise.all(Array.from(ids).map(id => this.cargarPlanificacionPorMateria(id)));
      } catch (err) {
        console.error('Error cargando planificaciones para todas las materias:', err);
      }
    },
    cargarPlanificacionPorMateria(materiaId) {
      try {
        const key = `planificacion:${this.alumnoId}:${materiaId}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          this.planificacionPorMateria[materiaId] = data;
        } else {
          // Inicializar estructura vacía
          this.planificacionPorMateria[materiaId] = {
            texto: '',
            estado: 'Pendiente',
            fecha_actualizacion: null
          };
        }
      } catch (err) {
        console.error('Error leyendo planificación de localStorage:', err);
      }
    },
    guardarPlanificacion(materiaId) {
      try {
        const current = this.planificacionPorMateria[materiaId] || { texto: '', estado: 'Pendiente' };
        const payload = {
          texto: current.texto || '',
          estado: current.estado || 'Pendiente',
          fecha_actualizacion: new Date().toISOString()
        };
        const key = `planificacion:${this.alumnoId}:${materiaId}`;
        localStorage.setItem(key, JSON.stringify(payload));
        this.planificacionPorMateria[materiaId] = payload;
      } catch (err) {
        console.error('Error guardando planificación:', err);
        alert('No se pudo guardar la planificación');
      }
    },
    borrarPlanificacion(materiaId) {
      try {
        const key = `planificacion:${this.alumnoId}:${materiaId}`;
        localStorage.removeItem(key);
        this.planificacionPorMateria[materiaId] = { texto: '', estado: 'Pendiente', fecha_actualizacion: null };
      } catch (err) {
        console.error('Error borrando planificación:', err);
      }
    },
    
    subirArchivoPDF(materiaId) {
      // Crear input file temporal
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
          alert('Por favor seleccione un archivo PDF');
          return;
        }
        
        // Verificar tamaño del archivo (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert('El archivo no debe superar los 10MB');
          return;
        }
        
        this.procesarArchivoPDF(file, materiaId);
      };
      input.click();
    },
    
    procesarArchivoPDF(file, materiaId) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            // Convertir archivo a base64
            const base64 = e.target.result;
            
            // Guardar en localStorage
            const archivoData = {
              nombre: file.name,
              tipo: file.type,
              tamaño: file.size,
              contenido: base64,
              fecha_subida: new Date().toISOString(),
              materia_id: materiaId,
              alumno_id: this.alumnoId
            };
            
            const key = `archivo_pdf:${this.alumnoId}:${materiaId}`;
            localStorage.setItem(key, JSON.stringify(archivoData));
            
            // Actualizar estado local
            if (!this.archivosPDF) this.archivosPDF = {};
            this.archivosPDF[materiaId] = archivoData;
            
            alert(`Archivo "${file.name}" subido exitosamente`);
            
          } catch (err) {
            console.error('Error procesando archivo:', err);
            alert('Error al procesar el archivo');
          }
        };
        
        reader.onerror = () => {
          alert('Error al leer el archivo');
        };
        
        reader.readAsDataURL(file);
        
      } catch (err) {
        console.error('Error subiendo archivo PDF:', err);
        alert('Error al subir el archivo');
      }
    },
    
    descargarArchivoPDF(materiaId) {
      try {
        const key = `archivo_pdf:${this.alumnoId}:${materiaId}`;
        const archivoData = JSON.parse(localStorage.getItem(key));
        
        if (!archivoData) {
          alert('No hay archivo PDF guardado');
          return;
        }
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = archivoData.contenido;
        link.download = archivoData.nombre;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (err) {
        console.error('Error descargando archivo PDF:', err);
        alert('Error al descargar el archivo');
      }
    },
    
    eliminarArchivoPDF(materiaId) {
      try {
        if (!confirm('¿Eliminar el archivo PDF?')) return;
        
        const key = `archivo_pdf:${this.alumnoId}:${materiaId}`;
        localStorage.removeItem(key);
        
        if (this.archivosPDF) {
          delete this.archivosPDF[materiaId];
        }
        
        alert('Archivo PDF eliminado');
        
      } catch (err) {
        console.error('Error eliminando archivo PDF:', err);
        alert('Error al eliminar el archivo');
      }
    },
    
    cargarArchivosPDF() {
      try {
        this.archivosPDF = {};
        
        // Buscar todos los archivos PDF guardados para este alumno
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`archivo_pdf:${this.alumnoId}:`)) {
            try {
              const archivoData = JSON.parse(localStorage.getItem(key));
              if (archivoData && archivoData.materia_id) {
                this.archivosPDF[archivoData.materia_id] = archivoData;
              }
            } catch (err) {
              console.warn('Error cargando archivo PDF:', key, err);
            }
          }
        }
        
      } catch (err) {
        console.error('Error cargando archivos PDF:', err);
      }
    },
    
    exportarPlanificacionPDF(materiaId) {
      try {
        const materia = this.materiasAsignadas.find(m => m.id === materiaId);
        const planificacion = this.planificacionPorMateria[materiaId];
        
        if (!planificacion) {
          alert('No hay planificación para exportar');
          return;
        }

        const alumnoNombre = `${this.alumnoActual.nombre} ${this.alumnoActual.apellido}`;
        const fecha = new Date().toLocaleDateString('es-AR');
        
        // Crear contenido HTML para el PDF
        const contenido = `
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .titulo { color: #2563eb; font-size: 24px; margin-bottom: 10px; }
              .info { background: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              .campo { margin-bottom: 10px; }
              .etiqueta { font-weight: bold; color: #374151; }
              .valor { margin-left: 10px; }
              .texto-planificacion { background: #ffffff; border: 1px solid #d1d5db; padding: 15px; border-radius: 5px; margin-top: 10px; }
              .fecha-exportacion { text-align: right; color: #6b7280; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="titulo">Planificación Educativa</h1>
              <h2>${materia?.nombre || 'Materia sin nombre'}</h2>
            </div>
            
            <div class="info">
              <div class="campo">
                <span class="etiqueta">Alumno:</span>
                <span class="valor">${alumnoNombre}</span>
              </div>
              <div class="campo">
                <span class="etiqueta">Estado:</span>
                <span class="valor">${planificacion.estado || 'Pendiente'}</span>
              </div>
              <div class="campo">
                <span class="etiqueta">Última actualización:</span>
                <span class="valor">${planificacion.fecha_actualizacion ? new Date(planificacion.fecha_actualizacion).toLocaleDateString('es-AR') : 'Sin actualizar'}</span>
              </div>
            </div>
            
            <div class="campo">
              <span class="etiqueta">Planificación:</span>
              <div class="texto-planificacion">
                ${planificacion.texto || '<p style="color: #9ca3af; font-style: italic;">Sin planificación registrada</p>'}
              </div>
            </div>
            
            <div class="fecha-exportacion">
              Documento generado el ${fecha}
            </div>
          </body>
          </html>
        `;

        // Abrir en nueva ventana para imprimir
        const ventana = window.open('', '_blank', 'width=800,height=600');
        ventana.document.write(contenido);
        ventana.document.close();
        
        // Esperar a que cargue y mostrar diálogo de impresión
        setTimeout(() => {
          ventana.print();
        }, 250);
        
      } catch (err) {
        console.error('Error exportando a PDF:', err);
        alert('Error al generar el PDF');
      }
    },
    
    exportarPlanificacionWord(materiaId) {
      try {
        const materia = this.materiasAsignadas.find(m => m.id === materiaId);
        const planificacion = this.planificacionPorMateria[materiaId];
        
        if (!planificacion) {
          alert('No hay planificación para exportar');
          return;
        }

        const alumnoNombre = `${this.alumnoActual.nombre} ${this.alumnoActual.apellido}`;
        const fecha = new Date().toLocaleDateString('es-AR');
        
        // Crear contenido HTML estilizado para Word
        const contenido = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset="UTF-8">
            <title>Planificación - ${materia?.nombre || 'Materia'}</title>
            <!--[if gte mso 9]>
            <xml>
              <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>90</w:Zoom>
              </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
              @page { margin: 1in; }
              body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
              .titulo { color: #1f2937; font-size: 18pt; font-weight: bold; margin-bottom: 12pt; text-align: center; }
              .subtitulo { color: #374151; font-size: 14pt; font-weight: bold; margin-bottom: 8pt; text-align: center; }
              .info { background: #f9fafb; padding: 12pt; border: 1pt solid #d1d5db; margin-bottom: 16pt; }
              .campo { margin-bottom: 8pt; }
              .etiqueta { font-weight: bold; color: #1f2937; }
              .texto-planificacion { background: #ffffff; border: 1pt solid #e5e7eb; padding: 12pt; margin-top: 8pt; }
              .fecha-exportacion { text-align: right; color: #6b7280; font-size: 10pt; margin-top: 24pt; }
            </style>
          </head>
          <body>
            <div class="titulo">Planificación Educativa</div>
            <div class="subtitulo">${materia?.nombre || 'Materia sin nombre'}</div>
            
            <div class="info">
              <div class="campo">
                <span class="etiqueta">Alumno:</span> ${alumnoNombre}
              </div>
              <div class="campo">
                <span class="etiqueta">Estado:</span> ${planificacion.estado || 'Pendiente'}
              </div>
              <div class="campo">
                <span class="etiqueta">Última actualización:</span> ${planificacion.fecha_actualizacion ? new Date(planificacion.fecha_actualizacion).toLocaleDateString('es-AR') : 'Sin actualizar'}
              </div>
            </div>
            
            <div class="campo">
              <span class="etiqueta">Planificación:</span>
              <div class="texto-planificacion">
                ${planificacion.texto || '<p style="color: #9ca3af; font-style: italic;">Sin planificación registrada</p>'}
              </div>
            </div>
            
            <div class="fecha-exportacion">
              Documento generado el ${fecha}
            </div>
          </body>
          </html>
        `;

        // Crear blob y descargar
        const blob = new Blob([contenido], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Planificacion_${alumnoNombre.replace(/\s+/g, '_')}_${materia?.nombre?.replace(/\s+/g, '_') || 'Materia'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
      } catch (err) {
        console.error('Error exportando a Word:', err);
        alert('Error al generar el documento de Word');
      }
    },
    
    configurarTabsPorNivel() {
      // Unificar pestañas: sólo Información y Materias
      this.tabs = [
        { id: 'info', nombre: 'Información General' },
        { id: 'materias', nombre: 'Materias' }
      ];
    },
    
    async cargarMateriasCurso() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alumnos/${this.alumnoId}/materias`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) this.materiasCurso = await res.json();
      } catch (err) {
        console.error('Error cargando materias del curso:', err);
        this.materiasCurso = [];
      }
    },
    async cargarCursos() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/cursos', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) this.cursos = await res.json();
      } catch (err) {
        console.error('Error cargando cursos:', err);
        this.cursos = [];
      }
    },
    async asignarCursoAlumno() {
      try {
        if (!this.cursoSeleccionado) {
          alert('Seleccione un curso');
          return;
        }
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alumnos/${this.alumnoId}/curso`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ curso_id: this.cursoSeleccionado })
        });
        if (!res.ok) throw new Error(await res.text());
        const actualizado = await res.json();
        this.alumnoActual.curso_id = actualizado.curso_id;
        await this.cargarMateriasCurso();
        this.cursoSeleccionado = '';
      } catch (err) {
        console.error('Error asignando curso:', err);
        alert('No se pudo asignar el curso');
      }
    },
    async crearMateriaDelCurso() {
      try {
        if (!this.alumnoActual || !this.alumnoActual.curso_id) {
          alert('Este alumno no tiene curso asignado. Asigne un curso primero.');
          return;
        }
        if (!this.nuevaMateriaNombre) {
          alert('Ingrese un nombre para la materia');
          return;
        }
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/cursos/${this.alumnoActual.curso_id}/materias`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: this.nuevaMateriaNombre, descripcion: this.nuevaMateriaDescripcion })
        });
        if (!res.ok) throw new Error(await res.text());
        const creada = await res.json();
        this.nuevaMateriaNombre = '';
        this.nuevaMateriaDescripcion = '';
        await this.cargarMateriasCurso();
        if (this.autoAsignarNuevaMateria && creada && creada.id) {
          await this.asignarMateria(creada.id);
        }
      } catch (err) {
        console.error('Error creando materia:', err);
        alert('No se pudo crear la materia');
      }
    },
    async editarMateria(materia) {
      try {
        const nuevoNombre = prompt('Nuevo nombre de la materia', materia.nombre);
        if (nuevoNombre === null) return;
        const nuevaDescripcion = prompt('Nueva descripción', materia.descripcion || '');
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/materias/${materia.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nuevoNombre, descripcion: nuevaDescripcion })
        });
        if (!res.ok) throw new Error(await res.text());
        await this.cargarMateriasCurso();
      } catch (err) {
        console.error('Error editando materia:', err);
        alert('No se pudo editar la materia');
      }
    },
    async eliminarMateria(materiaId) {
      try {
        if (!confirm('¿Eliminar esta materia? Se quitará de todos los alumnos.')) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/materias/${materiaId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        await this.cargarMateriasCurso();
        await this.cargarMateriasAsignadas();
      } catch (err) {
        console.error('Error eliminando materia:', err);
        alert('No se pudo eliminar la materia');
      }
    },
    async cargarTodasMaterias() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/materias', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) this.todasMaterias = await res.json();
      } catch (err) {
        console.error('Error cargando todas las materias:', err);
        this.todasMaterias = [];
      }
    },
    async cargarMateriasAsignadas() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alumnos/${this.alumnoId}/materias/asignadas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) this.materiasAsignadas = await res.json();
      } catch (err) {
        console.error('Error cargando materias asignadas:', err);
        this.materiasAsignadas = [];
      }
    },
    async asignarMateria(materiaId) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alumnos/${this.alumnoId}/materias`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ materia_id: materiaId })
        });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Error desconocido');
        }
        await this.cargarMateriasAsignadas();
      } catch (err) {
        console.error('Error asignando materia:', err);
        const texto = (err && err.message) ? err.message : 'No se pudo asignar la materia';
        alert(texto);
      }
    },
    async quitarMateria(materiaId) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alumnos/${this.alumnoId}/materias/${materiaId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        await this.cargarMateriasAsignadas();
      } catch (err) {
        console.error('Error quitando materia:', err);
        alert('No se pudo quitar la materia');
      }
    },
    async cargarNotas() {
      try {
        this.loadingNotas = true;
        const token = localStorage.getItem('token');
        const url = this.materiaSeleccionada
          ? `/api/alumnos/${this.alumnoId}/notas?materiaId=${this.materiaSeleccionada}`
          : `/api/alumnos/${this.alumnoId}/notas`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) this.notas = await res.json();
      } catch (err) {
        console.error('Error cargando notas:', err);
        this.notas = [];
      } finally {
        this.loadingNotas = false;
      }
    },
    async agregarNota() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alumnos/${this.alumnoId}/notas`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ materia_id: this.materiaSeleccionada, nota: this.nuevaNota, descripcion: this.descripcionNota })
        });
        if (!res.ok) throw new Error(await res.text());
        this.nuevaNota = '';
        this.descripcionNota = '';
        await this.cargarNotas();
      } catch (err) {
        console.error('Error agregando nota:', err);
        alert('No se pudo agregar la nota');
      }
    },
    async borrarNota(notaId) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alumnos/${this.alumnoId}/notas/${notaId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        await this.cargarNotas();
      } catch (err) {
        console.error('Error borrando nota:', err);
        alert('No se pudo borrar la nota');
      }
    }
    ,
    async cargarNotasPorMateria(materiaId) {
      try {
        const token = localStorage.getItem('token');
        const url = `/api/alumnos/${this.alumnoId}/notas?materiaId=${materiaId}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          this.notasPorMateria[materiaId] = await res.json();
          this.cargarNotasEstructuradas(materiaId);
        } else {
          this.notasPorMateria[materiaId] = [];
          this.cargarNotasEstructuradas(materiaId);
        }
      } catch (err) {
        console.error('Error cargando notas por materia:', err);
        this.notasPorMateria[materiaId] = [];
        this.cargarNotasEstructuradas(materiaId);
      }
    },
    cargarNotasEstructuradas(materiaId) {
      const existentes = this.notasPorMateria[materiaId] || [];
      const map = { N: null, R1: null, R2: null, EVAL1: null };
      for (const n of existentes) {
        const etiqueta = (n.descripcion || '').trim().toUpperCase();
        if (etiqueta === 'N') map.N = Number(n.nota);
        else if (etiqueta === 'R1') map.R1 = Number(n.nota);
        else if (etiqueta === 'R2') map.R2 = Number(n.nota);
        else if (etiqueta === 'EVAL 1' || etiqueta === 'EVAL1') map.EVAL1 = Number(n.nota);
      }
      this.$set(this.notasEstructuradasPorMateria, materiaId, map);
    },
    async guardarNotasEstructuradas(materiaId) {
      try {
        const token = localStorage.getItem('token');
        const actuales = this.notasPorMateria[materiaId] || [];
        const etiquetas = [
          { key: 'N', desc: 'N' },
          { key: 'R1', desc: 'R1' },
          { key: 'R2', desc: 'R2' },
          { key: 'EVAL1', desc: 'EVAL 1' }
        ];
        for (const et of etiquetas) {
          const valor = this.notasEstructuradasPorMateria[materiaId][et.key];
          const existente = actuales.find(n => (n.descripcion || '').trim().toUpperCase() === et.desc.toUpperCase());
          // Si el campo está vacío y existe, ofrecer eliminar
          if ((valor == null || valor === '') && existente) {
            const confirmar = confirm(`El campo ${et.desc} está vacío. ¿Desea eliminar la nota institucional existente?`);
            if (confirmar) {
              const resDel = await fetch(`/api/alumnos/${this.alumnoId}/notas/${existente.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!resDel.ok) throw new Error(await resDel.text());
            }
            continue; // pasar al siguiente campo
          }
          // Validación de rango si hay valor
          if (valor !== null && valor !== '' && (Number.isNaN(Number(valor)) || Number(valor) < 0 || Number(valor) > 10)) {
            alert(`Valor inválido para ${et.desc}. Debe ser un número entre 0 y 10.`);
            continue;
          }
          if (existente) {
            const res = await fetch(`/api/alumnos/${this.alumnoId}/notas/${existente.id}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ nota: Number(valor), descripcion: et.desc })
            });
            if (!res.ok) throw new Error(await res.text());
          } else {
            const res = await fetch(`/api/alumnos/${this.alumnoId}/notas`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ materia_id: materiaId, nota: Number(valor), descripcion: et.desc })
            });
            if (!res.ok) throw new Error(await res.text());
          }
        }
        await this.cargarNotasPorMateria(materiaId);
        alert('Notas institucionales guardadas');
      } catch (err) {
        console.error('Error guardando notas institucionales:', err);
        alert('No se pudo guardar una o más notas institucionales');
      }
    },
    async borrarNotaInline(materiaId, notaId) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alumnos/${this.alumnoId}/notas/${notaId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        await this.cargarNotasPorMateria(materiaId);
      } catch (err) {
        console.error('Error borrando nota:', err);
        alert('No se pudo borrar la nota');
      }
    },
    async editarNotaInline(materiaId, nota) {
      try {
        const nuevoValor = prompt('Nueva nota', String(nota.nota ?? ''));
        if (nuevoValor === null) return;
        const nuevaDesc = prompt('Nueva descripción (opcional)', nota.descripcion || '');
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/alumnos/${this.alumnoId}/notas/${nota.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ nota: Number(nuevoValor), descripcion: nuevaDesc })
        });
        if (!res.ok) throw new Error(await res.text());
        await this.cargarNotasPorMateria(materiaId);
      } catch (err) {
        console.error('Error editando nota:', err);
        alert('No se pudo editar la nota');
      }
    },
    promedioNotas(materiaId) {
      const arr = this.notasPorMateria[materiaId] || [];
      if (!arr.length) return '—';
      const sum = arr.reduce((acc, n) => acc + Number(n.nota || 0), 0);
      return (sum / arr.length).toFixed(2);
    },
    cantidadNotas(materiaId) {
      return (this.notasPorMateria[materiaId] || []).length;
    },
    toggleNotas(materiaId) {
      this.panelNotasAbierto[materiaId] = !this.panelNotasAbierto[materiaId];
      if (this.panelNotasAbierto[materiaId] && !this.notasEstructuradasPorMateria[materiaId]) {
        this.$set(this.notasEstructuradasPorMateria, materiaId, { N: null, R1: null, R2: null, EVAL1: null });
      }
      if (this.panelNotasAbierto[materiaId] && !this.notasBatchPorMateria[materiaId]) {
        this.notasBatchPorMateria[materiaId] = [{ nota: '', descripcion: '' }];
      }
      if (this.panelNotasAbierto[materiaId]) {
        this.cargarNotasPorMateria(materiaId);
      }
    },
    agregarFilaNota(materiaId) {
      if (!this.notasBatchPorMateria[materiaId]) {
        this.notasBatchPorMateria[materiaId] = [];
      }
      this.notasBatchPorMateria[materiaId].push({ nota: '', descripcion: '' });
    },
    agregarVariasFilas(materiaId) {
      const n = Number(this.cantidadFilasPorMateria[materiaId] || 1);
      const cantidad = Math.max(1, Math.min(n, 50));
      if (!this.notasBatchPorMateria[materiaId]) {
        this.notasBatchPorMateria[materiaId] = [];
      }
      for (let i = 0; i < cantidad; i++) {
        this.notasBatchPorMateria[materiaId].push({ nota: '', descripcion: '' });
      }
    },
    quitarFilaNota(materiaId, index) {
      if (!this.notasBatchPorMateria[materiaId]) return;
      this.notasBatchPorMateria[materiaId].splice(index, 1);
    },
    puedeCargarBatch(materiaId) {
      const filas = this.notasBatchPorMateria[materiaId] || [];
      return filas.some(f => f.nota !== '' && f.nota != null);
    },
    async cargarNotasBatch(materiaId) {
      try {
        const filas = (this.notasBatchPorMateria[materiaId] || []).filter(f => f.nota !== '' && f.nota != null);
        if (filas.length === 0) {
          alert('Agregue al menos una nota.');
          return;
        }
        const token = localStorage.getItem('token');
        for (const fila of filas) {
          const res = await fetch(`/api/alumnos/${this.alumnoId}/notas`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ materia_id: materiaId, nota: Number(fila.nota), descripcion: fila.descripcion })
          });
          if (!res.ok) throw new Error(await res.text());
        }
        this.notasBatchPorMateria[materiaId] = [{ nota: '', descripcion: '' }];
        alert('Notas cargadas correctamente');
        // Si el usuario está en pestaña calificaciones, refrescar lista
        if (this.tabActiva === 'calificaciones') {
          this.materiaSeleccionada = materiaId;
          await this.cargarNotas();
        }
        // Refrescar notas mostradas en el panel inline
        await this.cargarNotasPorMateria(materiaId);
      } catch (err) {
        console.error('Error cargando notas batch:', err);
        alert('No se pudo cargar una o más notas');
      }
    },
    estaAsignada(materiaId) {
      return this.materiasAsignadas && this.materiasAsignadas.some(m => m.id === materiaId);
    }
    ,
    cambiarTab(tabId) {
      this.tabActiva = tabId;
      // Actualizar URL sin recargar
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, tab: tabId }
      });
    },
    
    volverAlListado() {
      this.$router.push('/menu/alumno');
    },
    
    calcularEdad(fechaNacimiento) {
      if (!fechaNacimiento) return 0;
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'No especificada';
      return new Date(dateString).toLocaleDateString('es-ES');
    },
    
    async obtenerAlumnos() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch('/api/alumnos', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error('Error al obtener alumnos');
        this.alumnos = await res.json();
      } catch (err) {
        console.error('Error obteniendo alumnos:', err);
      }
    },
    async crearAlumno() {
      this.loading = true;
      this.error = '';
      this.success = '';
      
      const token = localStorage.getItem('token');
      if (!token) {
        this.error = 'No estás autenticado. Por favor, inicia sesión primero.';
        this.loading = false;
        return;
      }
      
      try {
        const res = await fetch('/api/alumnos', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            nombre: this.nombre,
            apellido: this.apellido,
            email: this.email,
            dni: this.dni,
            fecha_nacimiento: this.fecha_nacimiento,
            genero: this.genero,
            direccion: this.direccion,
            telefono: this.telefono,
            nombre_padre: this.nombre_padre,
            telefono_padre: this.telefono_padre,
            nombre_madre: this.nombre_madre,
            telefono_madre: this.telefono_madre,
            nivel: this.nivel
          })
        });
        if (res.status === 401 || res.status === 403) {
          this.error = 'Sesión expirada o inválida. Por favor, inicia sesión nuevamente.';
          this.$router.push('/login');
          return;
        }
        if (!res.ok) throw new Error(await res.text());
        const creado = await res.json();
        this.success = 'Alumno creado correctamente';
        // Limpiar formulario
        this.nombre = '';
        this.apellido = '';
        this.email = '';
        this.dni = '';
        this.fecha_nacimiento = '';
        this.genero = '';
        this.direccion = '';
        this.telefono = '';
        this.nombre_padre = '';
        this.telefono_padre = '';
        this.nombre_madre = '';
        this.telefono_madre = '';
        this.nivel = '';
        // Actualizar lista
        await this.obtenerAlumnos();
      } catch (err) {
        console.error('Error creando alumno:', err);
        this.error = err?.message || 'No se pudo crear el alumno';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
<style scoped>
.alumno-page {
  padding: 20px;
}
.alumno-detalle-container {
  max-width: 900px;
  margin: 0 auto;
}
.header-actions {
  margin-bottom: 10px;
}
.btn-back {
  background: #e5e7eb;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

/* Formulario crear materia */
.crear-materia {
  margin-top: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: center;
}
.crear-materia h3 {
  grid-column: 1 / -1;
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: #111827;
}
.crear-materia label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #374151;
}
.crear-materia input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}
.crear-materia .inline {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-add, .btn-assign, .btn, .btn-danger, .btn-outline {
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.btn-add { background: #22c55e; color: #fff; }
.btn-assign { background: #3b82f6; color: #fff; }
.btn { background: #6366f1; color: #fff; }
.btn-outline { background: #f3f4f6; color: #111827; }
.btn-danger { background: #ef4444; color: #fff; }

/* Lista de materias asignadas */
.materias-asignadas { margin-top: 20px; }
.lista-materias {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item-materia {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
}
.item-materia .nombre { font-weight: 600; color: #111827; }
.item-materia .nombre .profesor { font-weight: 400; color: #374151; font-size: 0.9rem; }
.item-materia .nombre .resumen-notas { margin-top: 4px; color: #6b7280; font-size: 0.85rem; display: flex; gap: 10px; }
.item-materia .acciones { display: flex; gap: 8px; }

.panel-notas {
  margin-top: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
}
.carga-estructurada {
  margin-bottom: 10px;
  padding: 8px;
  background: #ffffff;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}
.carga-estructurada .titulo {
  font-weight: 600;
  margin-bottom: 6px;
  color: #111827;
}
.grid-campos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.grid-campos label {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #374151;
}
.acciones-estructurada {
  margin-top: 8px;
}
.lista-notas { list-style: none; padding: 0; margin: 0 0 8px 0; }
.item-nota { display: grid; grid-template-columns: 60px 1fr auto auto; align-items: center; gap: 8px; padding: 6px 0; }
.item-nota .nota-valor { font-weight: 600; }
.item-nota .nota-desc { color: #374151; }
.cargar-notas .filas { display: grid; gap: 8px; }
.cargar-notas .fila { display: grid; grid-template-columns: 120px 1fr auto; gap: 8px; align-items: center; }
.acciones-filas { display: flex; gap: 8px; align-items: center; margin-top: 8px; }

.materias-asignadas-vacia {
  margin-top: 16px;
  color: #6b7280;
}

/* Selector de curso */
.seleccion-curso {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  margin-top: 12px;
}
.seleccion-curso-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.seleccion-curso-row select {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}
.modal-encuesta {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-encuesta .contenido {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  max-width: 640px;
  width: 90%;
}
.modal-encuesta .grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.modal-encuesta .acciones {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
