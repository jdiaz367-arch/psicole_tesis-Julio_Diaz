<template>
  <div class="crear-usuario"> 
    <h2>Crear Nuevo Usuario</h2>
    <form @submit.prevent="crearUsuario">
      <input v-model="nombre" placeholder="Nombre" required />
      <input v-model="apellido" placeholder="Apellido" required />
      <input v-model="email" type="email" placeholder="Correo electrónico" required />
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Creando...' : 'Crear Usuario' }}
      </button>
    </form>

    <div v-if="mensaje" class="mensaje" :class="{ error: esError, success: !esError }">
      {{ mensaje }}
    </div>

    <h3>Lista de Usuarios</h3>
    
    <!-- MOSTRAR ESTADO DE CARGA -->
    <div v-if="cargandoUsuarios" class="loading">
      Cargando usuarios...
    </div>
    
    <!-- MOSTRAR ERROR SI HAY -->
    <div v-if="errorCarga" class="mensaje error">
      Error al cargar usuarios: {{ errorCarga }}
    </div>

    <div class="table-container">
      <table v-if="usuarios.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td>{{ usuario.id }}</td>
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.apellido }}</td>
            <td>{{ usuario.email }}</td>
            <td>{{ usuario.tipo_usuario }}</td>
            <td>{{ usuario.activo ? 'Activo' : 'Inactivo' }}</td>
            <td>
              <button @click="editarUsuario(usuario)" class="btn-edit">Editar</button>
              <button @click="eliminarUsuario(usuario.id)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else-if="!cargandoUsuarios && !errorCarga" class="no-data">
        No hay usuarios registrados
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="mostrarModalEdicion" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Editar Usuario</h3>
          <button @click="cerrarModal" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="actualizarUsuario">
          <div class="form-group">
            <label>Nombre:</label>
            <input 
              v-model="usuarioEditando.nombre" 
              required
            >
          </div>
          
          <div class="form-group">
            <label>Apellido:</label>
            <input 
              v-model="usuarioEditando.apellido" 
            >
          </div>
          
          <div class="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              v-model="usuarioEditando.email" 
              required
            >
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

// Estado reactivo
const usuarios = ref([])
const nombre = ref('')
const apellido = ref('')
const email = ref('')
// Campos de contraseña y rol eliminados
const loading = ref(false)
const mensaje = ref('')
const esError = ref(false)
const mostrarModalEdicion = ref(false)
const usuarioEditando = ref({})
const cargandoUsuarios = ref(false)
const errorCarga = ref('')

// Configurar axios con el token
const configurarAxios = () => {
  const token = localStorage.getItem('token')
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
}

// Obtener usuarios - VERSIÓN CORREGIDA
const obtenerUsuarios = async () => {
  cargandoUsuarios.value = true
  errorCarga.value = ''
  
  try {
    console.log('🔍 Intentando obtener usuarios...')
    
    // Configurar headers manualmente para esta petición
    const token = localStorage.getItem('token')
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
    
    const response = await axios.get('/api/usuarios', config)
    console.log('✅ Usuarios obtenidos:', response.data)
    usuarios.value = response.data
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error)
    
    if (error.response) {
      // El servidor respondió con un error
      errorCarga.value = error.response.data.error || `Error ${error.response.status}`
      console.error('Detalles del error:', error.response.data)
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      errorCarga.value = 'No se pudo conectar con el servidor'
      console.error('Sin respuesta del servidor')
    } else {
      // Error en la configuración
      errorCarga.value = error.message
      console.error('Error de configuración:', error.message)
    }
  } finally {
    cargandoUsuarios.value = false
  }
}

// Crear usuario
const crearUsuario = async () => {
  if (!nombre.value || !apellido.value || !email.value) {
    mostrarMensaje('Todos los campos obligatorios deben ser llenados', true)
    return
  }

  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
    
    const payload = {
      nombre: nombre.value,
      apellido: apellido.value,
      email: email.value,
    }

    await axios.post('/api/usuarios', payload, config)
    
    mostrarMensaje('Usuario creado exitosamente')
    limpiarFormulario()
    await obtenerUsuarios() // Recargar la lista
  } catch (error) {
    console.error('Error creando usuario:', error)
    if (error.response?.status === 400) {
      mostrarMensaje(error.response.data.error || 'El email ya está registrado', true)
    } else {
      mostrarMensaje('Error al crear usuario', true)
    }
  } finally {
    loading.value = false
  }
}

// Editar usuario
const editarUsuario = (usuario) => {
  usuarioEditando.value = { ...usuario }
  mostrarModalEdicion.value = true
}

// Actualizar usuario
const actualizarUsuario = async () => {
  try {
    const token = localStorage.getItem('token')
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
    
    await axios.put(`/api/usuarios/${usuarioEditando.value.id}`, {
      nombre: usuarioEditando.value.nombre,
      apellido: usuarioEditando.value.apellido,
      email: usuarioEditando.value.email
    }, config)
    
    mostrarMensaje('Usuario actualizado exitosamente')
    cerrarModal()
    await obtenerUsuarios()
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    mostrarMensaje('Error al actualizar usuario', true)
  }
}

// Eliminar usuario
const eliminarUsuario = async (id) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    return
  }

  try {
    const token = localStorage.getItem('token')
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
    
    await axios.delete(`/api/usuarios/${id}`, config)
    mostrarMensaje('Usuario eliminado exitosamente')
    await obtenerUsuarios()
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    mostrarMensaje('Error al eliminar usuario', true)
  }
}

// Utilidades
const mostrarMensaje = (texto, error = false) => {
  mensaje.value = texto
  esError.value = error
  setTimeout(() => {
    mensaje.value = ''
  }, 5000)
}

const limpiarFormulario = () => {
  nombre.value = ''
  apellido.value = ''
  email.value = ''
  
}

const cerrarModal = () => {
  mostrarModalEdicion.value = false
  usuarioEditando.value = {}
}

// Inicialización
onMounted(() => {
  console.log('🚀 Componente CrearUsuarios montado')
  console.log('Token en localStorage:', localStorage.getItem('token'))
  obtenerUsuarios()
})
</script>

<style scoped>
.crear-usuario {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2, h3 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

input, select, button {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

.mensaje {
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  text-align: center;
}

.mensaje.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.mensaje.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #007bff;
  font-style: italic;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  font-size: 12px;
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

.no-data {
  text-align: center;
  padding: 20px;
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
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
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>
