<template>
  <div class="cursos-container">
    <h2>Gestión de Cursos</h2>
    
    <!-- Formulario para crear curso -->
    <div class="form-section" ref="formSectionRef">
      <h3>Crear Nuevo Curso</h3>
      <form @submit.prevent="guardarCurso" class="formulario">
        <div class="form-row">
          <div class="form-group">
            <label for="nombre">Nombre del Curso:</label>
            <input v-model="nuevoCurso.nombre" type="text" id="nombre" placeholder="Ej: Primer Grado" required />
          </div>
          <div class="form-group">
            <label for="colegio">Colegio:</label>
            <select v-model.number="nuevoCurso.colegio_id" id="colegio" required>
              <option value="">Seleccione colegio</option>
              <option v-for="colegio in colegios" :key="colegio.id" :value="colegio.id">
                {{ colegio.nombre }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="nivel">Nivel:</label>
            <select v-model="nuevoCurso.nivel" id="nivel" required>
              <option value="">Seleccione nivel</option>
              <option value="Inicial">Inicial</option>
              <option value="Primario">Primario</option>
              <option value="Secundario">Secundario</option>
            </select>
          </div>
          <div class="form-group">
            <label for="grado">Grado:</label>
            <input v-model="nuevoCurso.grado" type="text" id="grado" placeholder="Ej: 1, 2, 3..." required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="turno">Turno:</label>
            <select v-model="nuevoCurso.turno" id="turno" required>
              <option value="">Seleccione turno</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
            </select>
          </div>
          <div class="form-group">
            <label for="capacidad_maxima">Capacidad Máxima:</label>
            <input v-model="nuevoCurso.capacidad_maxima" type="number" id="capacidad_maxima" placeholder="Ej: 30" min="1" />
          </div>
        </div>
        
        <div class="form-group full-width">
          <label for="descripcion">Descripción:</label>
          <textarea v-model="nuevoCurso.descripcion" id="descripcion" placeholder="Descripción del curso" rows="3"></textarea>
        </div>

        <button type="submit" class="btn-primary">Crear Curso</button>
      </form>
    </div>

    <!-- Lista de cursos -->
    <div class="list-section">
      <div class="list-header">
        <h3>Lista de Cursos</h3>
        <button @click="registrarNuevoCurso" class="btn-primary btn-new">Registrar nuevo</button>
      </div>
      
      <div v-if="loading" class="loading">Cargando cursos...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="cursos.length === 0" class="no-data">No hay cursos registrados</div>
      
      <div v-else class="table-container">
        <table class="cursos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Nivel</th>
              <th>Grado</th>
              <th>Turno</th>
              <th>Colegio</th>
              <th>Capacidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="curso in cursos" :key="curso.id">
              <td>{{ curso.id }}</td>
              <td>{{ curso.nombre }}</td>
              <td>
                <span :class="`badge badge-${curso.nivel?.toLowerCase()}`">
                  {{ curso.nivel || '-' }}
                </span>
              </td>
              <td>{{ curso.grado || '-' }}</td>
              <td>{{ curso.turno || '-' }}</td>
              <td>{{ getColegioNombre(curso.colegio_id) }}</td>
              <td>{{ curso.capacidad_maxima || '-' }}</td>
              <td class="acciones">
                <button @click="editarCurso(curso)" class="btn-edit">Editar</button>
                <button @click="eliminarCurso(curso.id)" class="btn-delete">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="mostrarModalEdicion" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Editar Curso</h3>
          <button @click="cerrarModal" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="actualizarCurso" class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label for="edit-nombre">Nombre del Curso:</label>
              <input v-model="cursoEditando.nombre" type="text" id="edit-nombre" required />
            </div>
            <div class="form-group">
              <label for="edit-colegio">Colegio:</label>
              <select v-model.number="cursoEditando.colegio_id" id="edit-colegio" required>
                <option v-for="colegio in colegios" :key="colegio.id" :value="colegio.id">
                  {{ colegio.nombre }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="edit-nivel">Nivel:</label>
              <select v-model="cursoEditando.nivel" id="edit-nivel" required>
                <option value="Inicial">Inicial</option>
                <option value="Primario">Primario</option>
                <option value="Secundario">Secundario</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-grado">Grado:</label>
              <input v-model="cursoEditando.grado" type="text" id="edit-grado" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-turno">Turno:</label>
              <select v-model="cursoEditando.turno" id="edit-turno" required>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-capacidad">Capacidad Máxima:</label>
              <input v-model="cursoEditando.capacidad_maxima" type="number" id="edit-capacidad" min="1" />
            </div>
          </div>
          
          <div class="form-group full-width">
            <label for="edit-descripcion">Descripción:</label>
            <textarea v-model="cursoEditando.descripcion" id="edit-descripcion" rows="3"></textarea>
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
import { ref, onMounted } from 'vue'
import axios from 'axios'

const cursos = ref([])
const colegios = ref([])
const loading = ref(false)
const error = ref('')
const mostrarModalEdicion = ref(false)
const cursoEditando = ref({})
const formSectionRef = ref(null)

const nuevoCurso = ref({
  nombre: '',
  descripcion: '',
  nivel: '',
  grado: '',
  turno: '',
  capacidad_maxima: 30,
  colegio_id: ''
})

// Helper para llamadas con fallback de base URL y Authorization
const API_BASES = ['http://localhost:3000', 'http://127.0.0.1:3000']
const requestWithAuth = async (method, path, data) => {
  const token = localStorage.getItem('token')
  let lastError
  for (const base of API_BASES) {
    try {
      const config = {
        method,
        url: base + path,
        headers: { 'Authorization': `Bearer ${token}` }
      }
      if (data) config.data = data
      return await axios(config)
    } catch (err) {
      lastError = err
      if (!err.response) continue
      break
    }
  }
  throw lastError
}

const obtenerCursos = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await requestWithAuth('get', '/api/cursos')
    cursos.value = response.data
  } catch (err) {
    console.error('Error al obtener cursos:', err)
    error.value = 'Error al cargar cursos: ' + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

const obtenerColegios = async () => {
  try {
    const response = await requestWithAuth('get', '/api/colegios')
    colegios.value = response.data
  } catch (err) {
    console.error('Error al obtener colegios:', err)
  }
}

const guardarCurso = async () => {
  try {
    await requestWithAuth('post', '/api/cursos', {
      nombre: nuevoCurso.value.nombre,
      descripcion: nuevoCurso.value.descripcion,
      nivel: nuevoCurso.value.nivel,
      grado: nuevoCurso.value.grado,
      turno: nuevoCurso.value.turno,
      capacidad_maxima: nuevoCurso.value.capacidad_maxima,
      colegio_id: nuevoCurso.value.colegio_id
    })
    
    // Limpiar formulario
    nuevoCurso.value = {
      nombre: '',
      descripcion: '',
      nivel: '',
      grado: '',
      turno: '',
      capacidad_maxima: 30,
      colegio_id: ''
    }
    
    // Recargar lista
    await obtenerCursos()
    
    alert('Curso creado exitosamente')
  } catch (err) {
    console.error('Error al crear curso:', err)
    alert('Error al crear curso: ' + (err.response?.data?.error || err.message))
  }
}

const registrarNuevoCurso = () => {
  nuevoCurso.value = { 
    nombre: '', 
    descripcion: '', 
    nivel: '', 
    grado: '', 
    turno: '', 
    capacidad_maxima: 30, 
    colegio_id: '' 
  }
  // Hacer scroll al formulario
  requestAnimationFrame(() => {
    formSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const editarCurso = (curso) => {
  cursoEditando.value = { ...curso }
  mostrarModalEdicion.value = true
}

const cerrarModal = () => {
  mostrarModalEdicion.value = false
  cursoEditando.value = {}
}

const actualizarCurso = async () => {
  try {
    await requestWithAuth('put', `/api/cursos/${cursoEditando.value.id}`, {
      nombre: cursoEditando.value.nombre,
      descripcion: cursoEditando.value.descripcion,
      nivel: cursoEditando.value.nivel,
      grado: cursoEditando.value.grado,
      turno: cursoEditando.value.turno,
      capacidad_maxima: cursoEditando.value.capacidad_maxima,
      colegio_id: cursoEditando.value.colegio_id
    })
    
    cerrarModal()
    await obtenerCursos()
    alert('Curso actualizado exitosamente')
  } catch (err) {
    console.error('Error al actualizar curso:', err)
    alert('Error al actualizar curso: ' + (err.response?.data?.error || err.message))
  }
}

const eliminarCurso = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este curso?')) {
    try {
      await requestWithAuth('delete', `/api/cursos/${id}`)
      await obtenerCursos()
      alert('Curso eliminado exitosamente')
    } catch (err) {
      console.error('Error al eliminar curso:', err)
      alert('Error al eliminar curso: ' + (err.response?.data?.error || err.message))
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const getColegioNombre = (colegioId) => {
  const colegio = colegios.value.find(c => c.id === colegioId)
  return colegio ? colegio.nombre : '-'
}

onMounted(() => {
  obtenerCursos()
  obtenerColegios()
})
</script>

<style scoped>
.cursos-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.form-section, .list-section {
  background: white;
  padding: 25px;
  margin-bottom: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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

.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.btn-new {
  margin-top: 0;
  padding: 10px 20px;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
  margin-top: 20px;
}

.cursos-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cursos-table th,
.cursos-table td {
  padding: 16px 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
  line-height: 1.5;
}

.cursos-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #dee2e6;
}

.cursos-table td {
  font-size: 14px;
  color: #212529;
  background-color: white;
}

.cursos-table tr:hover td {
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.acciones {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.acciones button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  border-radius: 6px;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-edit {
  background-color: #ffc107;
  color: #212529;
  border: none;
  cursor: pointer;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
}

.btn-edit:hover {
  background-color: #e0a800;
  transform: translateY(-1px);
}

.btn-delete:hover {
  background-color: #c82333;
  transform: translateY(-1px);
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
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
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

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 25px;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .cursos-container {
    padding: 10px;
  }
  
  .list-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-row {
    grid-template-columns: 1fr;
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
