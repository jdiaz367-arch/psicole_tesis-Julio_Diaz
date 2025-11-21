<template>
  <div class="profesor-container">
    <h2>Gestión de Profesores</h2>
    
    <!-- Formulario para crear profesor -->
    <div class="form-section">
      <h3>Registrar Nuevo Profesor</h3>
      <form @submit.prevent="guardarProfesor" class="formulario">
        <div class="form-row">
          <div class="form-group">
            <label for="nombre">Nombre:</label>
            <input v-model="nuevoProfesor.nombre" type="text" id="nombre" placeholder="Nombre del Profesor" required />
          </div>
          <div class="form-group">
            <label for="apellido">Apellido:</label>
            <input v-model="nuevoProfesor.apellido" type="text" id="apellido" placeholder="Apellido del Profesor" required/>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="email">Email:</label>
            <input v-model="nuevoProfesor.email" type="email" id="email" placeholder="Email del Profesor" required />
          </div>         
          <div class="form-group">
            <label for="especialidad">Especialidad:</label>
            <input v-model="nuevoProfesor.especialidad" type="text" id="especialidad" placeholder="Ej: Matemáticas" required />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="titulo">Título:</label>
            <input v-model="nuevoProfesor.titulo" type="text" id="titulo" placeholder="Ej: Licenciado en Educación" required/>
          </div>
          <div class="form-group">
            <label for="fechaContratacion">Fecha de Contratación:</label>
            <input v-model="nuevoProfesor.fechaContratacion" type="date" id="fechaContratacion" required />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="colegio">Colegio:</label>
            <select v-model.number="nuevoProfesor.colegioId" id="colegio" required>
              <option value="">Seleccione colegio</option>
              <option v-for="colegio in colegios" :key="colegio.id" :value="colegio.id">
                {{ colegio.nombre }}
              </option>
            </select>
            <button type="button" class="btn-secondary" @click="goToColegios" style="margin-top: 8px;">
              🏫 Cargar Colegio
            </button>
          </div>
        </div>
        
        <button type="submit" class="btn-primary">Registrar Profesor</button>
      </form>
    </div>

    <!-- Lista de profesores -->
    <div class="list-section">
      <h3>Lista de Profesores</h3>
      <div v-if="loading" class="loading">Cargando profesores...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="profesores.length === 0" class="no-profesores">No hay profesores registrados</div>
      <table v-else class="profesores-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Especialidad</th>
            <th>Título</th>
            <th>Colegio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="profesor in profesores" :key="profesor.id">
            <td>{{ profesor.id }}</td>
            <td>{{ profesor.nombre }}</td>
            <td>{{ profesor.apellido }}</td>
            <td>{{ profesor.email }}</td>
            <td>{{ profesor.especialidad }}</td>
            <td>{{ profesor.titulo }}</td>
            <td>{{ getColegioNombre(profesor.colegio_id) }}</td>
            <td>
              <button @click="editarProfesor(profesor)" class="btn-edit">Editar</button>
              <button @click="eliminarProfesor(profesor.id)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de edición -->
    <div v-if="mostrarModalEdicion" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Editar Profesor</h3>
          <button @click="cerrarModal" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="actualizarProfesor" class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label for="edit-nombre">Nombre:</label>
              <input v-model="profesorEditando.nombre" type="text" id="edit-nombre" required />
            </div>
            <div class="form-group">
              <label for="edit-apellido">Apellido:</label>
              <input v-model="profesorEditando.apellido" type="text" id="edit-apellido" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="edit-email">Email:</label>
              <input v-model="profesorEditando.email" type="email" id="edit-email" required />
            </div>
            <div class="form-group">
              <label for="edit-especialidad">Especialidad:</label>
              <input v-model="profesorEditando.especialidad" type="text" id="edit-especialidad" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="edit-titulo">Título:</label>
              <input v-model="profesorEditando.titulo" type="text" id="edit-titulo" required />
            </div>
            <div class="form-group">
              <label for="edit-colegio">Colegio:</label>
              <select v-model.number="profesorEditando.colegio_id" id="edit-colegio" required>
                <option v-for="colegio in colegios" :key="colegio.id" :value="colegio.id">
                  {{ colegio.nombre }}
                </option>
              </select>
              <button type="button" class="btn-secondary" @click="goToColegios" style="margin-top: 8px;">
                🏫 Cargar Colegio
              </button>
            </div>
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
import { useRouter } from 'vue-router'
import axios from 'axios'

const profesores = ref([])
const colegios = ref([])
const loading = ref(false)
const error = ref('')
const mostrarModalEdicion = ref(false)
const profesorEditando = ref({})
const router = useRouter()

const nuevoProfesor = ref({
  nombre: '',
  apellido: '',
  email: '',
  especialidad: '',
  titulo: '',
  fechaContratacion: '',
  colegioId: ''
})

const obtenerProfesores = async() => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await requestWithAuth('get', '/api/profesores')
    profesores.value = response.data
  } catch (err) {
    console.error('Error al obtener profesores:', err)
    error.value = 'Error al cargar profesores: ' + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

const obtenerColegios = async() => {
  try {
    const response = await requestWithAuth('get', '/api/colegios')
    colegios.value = response.data
  } catch (err) {
    console.error('Error al obtener colegios:', err)
  }
}

const goToColegios = () => {
  router.push('/menu/colegios')
}

const guardarProfesor = async() => {
  const n = (nuevoProfesor.value.nombre || '').trim()
  const a = (nuevoProfesor.value.apellido || '').trim()
  const e = (nuevoProfesor.value.email || '').trim()
  const esp = (nuevoProfesor.value.especialidad || '').trim()
  const tit = (nuevoProfesor.value.titulo || '').trim()
  const f = (nuevoProfesor.value.fechaContratacion || '').trim()
  const col = nuevoProfesor.value.colegioId
  if (!n || !a || !e || !esp || !tit || !f || !col) {
    alert('Completa Nombre, Apellido, Email, Especialidad, Título, Fecha y Colegio')
    return
  }
  try {
    await requestWithAuth('post', '/api/profesores', {
      nombre: n,
      apellido: a,
      email: e,
      password: 'password123', // Contraseña por defecto
      tipo_usuario: 'profesor',
      especialidad: esp,
      titulo: tit,
      fecha_contratacion: f,
      colegio_id: col
    })
    
    // Limpiar formulario
    nuevoProfesor.value = {
      nombre: '',
      apellido: '',
      email: '',
      especialidad: '',
      titulo: '',
      fechaContratacion: '',
      colegioId: ''
    }
    
    // Recargar lista
    await obtenerProfesores()
    
    alert('Profesor registrado exitosamente')
  } catch (err) {
    console.error('Error al crear profesor:', err)
    alert('Error al crear profesor: ' + (err.response?.data?.error || err.message))
  }
}

const editarProfesor = (profesor)=> {
  profesorEditando.value = { ...profesor }
  mostrarModalEdicion.value = true
}

const cerrarModal = () => {
  mostrarModalEdicion.value = false
  profesorEditando.value = {}
}

const actualizarProfesor = async() => {
  try {
    await requestWithAuth('put', `/api/profesores/${profesorEditando.value.id}`, {
      nombre: profesorEditando.value.nombre,
      apellido: profesorEditando.value.apellido,
      email: profesorEditando.value.email,
      especialidad: profesorEditando.value.especialidad,
      titulo: profesorEditando.value.titulo,
      colegio_id: profesorEditando.value.colegio_id
    })
    
    cerrarModal()
    await obtenerProfesores()
    alert('Profesor actualizado exitosamente')
  } catch (err) {
    console.error('Error al actualizar profesor:', err)
    alert('Error al actualizar profesor: ' + (err.response?.data?.error || err.message))
  }
}

const eliminarProfesor = async(id) => {
  if (confirm('¿Seguro que deseas eliminar este profesor? Esta acción también eliminará todas las asignaturas asociadas.')) {
    try {
      await requestWithAuth('delete', `/api/profesores/${id}`)
      await obtenerProfesores()
      alert('Profesor eliminado exitosamente')
    } catch (err) {
      console.error('Error al eliminar profesor:', err)
      alert('Error al eliminar profesor: ' + (err.response?.data?.error || err.message))
    }
  }
}

const getColegioNombre = (colegioId)=> {
  const colegio = colegios.value.find(c => c.id === colegioId)
  return colegio ? colegio.nombre : '-'
}

onMounted(() => {
  obtenerProfesores()
  obtenerColegios()
})

// Helper para llamadas con fallback de base URL y Authorization
const API_BASES = ['', 'http://localhost:3001', 'http://localhost:3002']
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
      // Reintenta con el siguiente base si es error de red
      if (!err.response) continue
      // Si es error del servidor (tiene response), no tiene sentido reintentar
      break
    }
  }
  throw lastError
}
</script>

<style scoped>
.profesor-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.form-section, .list-section {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
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

.profesores-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.profesores-table th,
.profesores-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.profesores-table th {
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

.loading, .error, .no-profesores {
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

.no-profesores {
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
