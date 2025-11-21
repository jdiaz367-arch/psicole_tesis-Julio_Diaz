
<template>
  <div class="gestion-usuarios-view">
    <!-- Header -->
    <div class="view-header">
      <h1 class="view-title">
        <span class="title-icon">{{ tituloIcono }}</span>
        {{ tituloVista }}
      </h1>
      <p class="view-subtitle">Administra los usuarios del sistema educativo</p>
    </div>

    <!-- Contenido principal -->
    <div class="view-content">
      <!-- Botón para crear nuevo usuario -->
      <div class="action-bar">
        <button
          @click="toggleFormulario()"
          class="btn btn-primary btn-lg"
          :class="{ 'btn-secondary': mostrarFormulario }"
        >
          <span class="btn-icon">{{ mostrarFormulario ? '✕' : '➕' }}</span>
          {{ textoBotonPrincipal }}
        </button>
      </div>

      <!-- Formulario para crear usuario -->
      <div v-if="mostrarFormulario" class="form-section">
        <div class="form-card">
          <h3 class="form-title">{{ esEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h3>
          <form @submit.prevent="guardarUsuario" class="user-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input
                  type="text" 
                  v-model="nuevoUsuario.nombre" 
                  class="form-input" 
                  placeholder="Ej: María" 
                  required
                >
              </div>
              <div class="form-group">
                <label class="form-label">Apellido</label>
                <input
                  type="text" v-model="nuevoUsuario.apellido" class="form-input" placeholder="Ej: González"
                  required
                >
              </div>

              <div class="form-group">
                <label class="form-label">Email *</label>
                <input
                  type="email" 
                  v-model="nuevoUsuario.email" 
                  class="form-input" 
                  placeholder="maria@ejemplo.com" 
                  required
                >
              </div>

              <div class="form-group" v-if="!esEdicion">
                <!-- Campo de contraseña eliminado -->
              </div>

              <!-- Campo de rol eliminado -->

              

              <div class="form-group">
                <label class="form-label">Nivel Educativo</label>
                <select
                  v-model="nuevoUsuario.nivel_educativo" 
                  class="form-select" 
                  :required="nivelObligatorio"
                >
                  <option disabled value="">Seleccionar nivel</option>
                  <option value="inicial">Inicial</option>
                  <option value="primario">Primario</option>
                  <option value="secundario">Secundario</option>
                </select>
                <div class="form-hint" v-if="nivelObligatorio">
                  ⚠️ Campo obligatorio para este rol
                </div>
              </div>

              
            </div>

            <div class="form-actions">
              <button
                type="submit" 
                class="btn btn-success" 
                :disabled="cargando"
              >
                <span class="btn-icon">💾</span>
                {{ cargando ? 'Guardando...' : (esEdicion ? 'Actualizar Usuario' : 'Crear Usuario') }}
              </button>
              <button
                type="button" 
                class="btn btn-outline"
                @click="cancelarCreacion"
              >
                <span class="btn-icon">✕</span>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Lista de usuarios -->
      <div class="list-section">
        <div class="list-header">
          <h3 class="list-title">
            Usuarios Registrados
            <span class="badge">{{ usuarios.length }}</span>
          </h3>
          <div class="search-box">
            <input
              type="text" 
              v-model="filtroBusqueda" 
              class="search-input" 
              placeholder="Buscar usuarios..."
            >
            <span class="search-icon">🔍</span>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="cargandoUsuarios" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>

        <!-- Lista vacía -->
        <div v-else-if="usuariosFiltrados.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h4>No se encontraron usuarios</h4>
          <p v-if="filtroBusqueda">Intenta con otro término de búsqueda.</p>
          <p v-else>Comienza creando el primer usuario del sistema.</p>
        </div>

        <!-- Tabla de usuarios -->
        <div v-else class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Nivel</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                <td class="user-id">#{{ usuario.id }}</td>
                <td class="user-name">
                  <div class="user-avatar">
                    {{ getIniciales(usuario.nombre) }}
                  </div>
                  {{ usuario.nombre }} {{ usuario.apellido }}
                </td>
                <td class="user-email">{{ usuario.email }}</td>
                <td>
                  <span class="role-badge" :class="`role-${usuario.rol}`">
                    {{ getTextoRol(usuario.rol) }}
                  </span>
                </td>
                <td>
                  <span v-if="usuario.nivel_educativo || usuario.nivel" class="level-badge">
                    {{ getTextoNivel(usuario.nivel_educativo || usuario.nivel) }}
                  </span>
                  <span v-else class="no-level">-</span>
                </td>
                <td class="user-date">{{ formatFecha(usuario.fecha_creacion) }}</td>
                <td class="user-actions">
                  <button @click="editarUsuario(usuario)" class="btn-action edit" title="Editar usuario">
                    ✏️
                  </button>
                  <button
                    v-if="usuario.rol === 'profesor'"
                    class="btn-action edit"
                    title="Asignar materia al profesor"
                    @click="abrirModalAsignacion(usuario)"
                  >
                    📚
                  </button>
                  <button
                    class="btn-action delete" 
                    title="Eliminar usuario"
                    @click="confirmarEliminacion(usuario)"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div v-if="mostrarModalAsignacion" class="modal-overlay">
    <div class="modal-card">
      <h3 class="modal-title">Asignar materia a {{ profesorSeleccionado?.nombre }} {{ profesorSeleccionado?.apellido }}</h3>
      <div class="modal-grid">
        <label class="form-label">Nivel</label>
        <select class="form-select" v-model="nivelSeleccionado" @change="cargarCursosPorNivel">
          <option disabled value="">Seleccionar nivel</option>
          <option value="inicial">Inicial</option>
          <option value="primario">Primario</option>
          <option value="secundario">Secundario</option>
        </select>
        <label class="form-label">Curso</label>
        <select class="form-select" v-model="cursoSeleccionado" @change="cargarMateriasDelCurso">
          <option disabled value="">Seleccionar curso</option>
          <option v-for="c in cursosNivel" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
        <label class="form-label">Materia</label>
        <select class="form-select" v-model="materiaSeleccionadaId">
          <option value="">Seleccionar materia existente</option>
          <option v-for="m in materiasCurso" :key="m.id" :value="m.id">{{ m.nombre }}</option>
        </select>
        <input class="form-input" v-model="materiaNuevaNombre" placeholder="o escribir nombre de nueva materia" />
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" @click="cerrarModalAsignacion">Cancelar</button>
        <button class="btn btn-primary" :disabled="!cursoSeleccionado || (!materiaSeleccionadaId && !materiaNuevaNombre)" @click="materiaSeleccionadaId ? asignarProfesorAMateria() : crearYAsignarProfesorAMateria()">Guardar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GestionUsuarios',
  data() {
    return {
      usuarios: [],
      colegios: [],
      nuevoUsuario: {
        nombre: '',
        apellido: '',
        email: '',
        nivel_educativo: '',
        fecha_contratacion: new Date().toISOString().slice(0,10),
        colegio_id: null
      },
      mostrarModalAsignacion: false,
      profesorSeleccionado: null,
      nivelSeleccionado: '',
      cursosNivel: [],
      cursoSeleccionado: '',
      materiasCurso: [],
      materiaSeleccionadaId: '',
      materiaNuevaNombre: '',
      mostrarFormulario: false,
      cargando: false,
      cargandoUsuarios: false,
      nivelObligatorio: false,
      filtroBusqueda: '',
      esEdicion: false,
      usuarioEditId: null,
    }
  },
  computed: {
    textoBotonPrincipal() {
      if (this.mostrarFormulario) {
        return this.esEdicion ? 'Cancelar Edición' : 'Cancelar Creación';
      }
      return 'Nuevo Usuario';
    },
    usuariosFiltrados() {
      // Filtrar por rol si está definido en la ruta
      const rolFiltro = this.$route.meta.rol;
      let usuariosPorRol = this.usuarios;
      if (rolFiltro) {
        usuariosPorRol = this.usuarios.filter(usuario => usuario.rol === rolFiltro);
      }

      if (!this.filtroBusqueda) return usuariosPorRol;
      
      const busqueda = this.filtroBusqueda.toLowerCase();
      return usuariosPorRol.filter(usuario => 
        usuario.nombre.toLowerCase().includes(busqueda) ||
        usuario.email.toLowerCase().includes(busqueda) ||
        (usuario.apellido && usuario.apellido.toLowerCase().includes(busqueda)) ||
        this.getTextoRol(usuario.rol).toLowerCase().includes(busqueda)
      );
    },
    tituloVista() {
      const rol = this.$route.meta.rol;
      if (rol === 'profesor') return 'Gestión de Profesores';
      // Puedes añadir más casos para otros roles si es necesario
      return 'Gestión de Usuarios';
    },
    tituloIcono() {
      const rol = this.$route.meta.rol;
      if (rol === 'profesor') return '👨‍🏫';
      // Puedes añadir más casos
      return '👥';
    }
  },
  mounted() {
    this.cargarUsuarios();
  },
    methods: {
      abrirModalAsignacion(usuario) {
        this.profesorSeleccionado = usuario
        this.mostrarModalAsignacion = true
        this.nivelSeleccionado = ''
        this.cursosNivel = []
        this.cursoSeleccionado = ''
        this.materiasCurso = []
        this.materiaSeleccionadaId = ''
        this.materiaNuevaNombre = ''
      },
      cerrarModalAsignacion() {
        this.mostrarModalAsignacion = false
        this.profesorSeleccionado = null
      },
      async cargarCursosPorNivel() {
        try {
          const token = localStorage.getItem('token')
          const res = await fetch('/api/cursos', { headers: { 'Authorization': `Bearer ${token}` } })
          if (!res.ok) return
          const data = await res.json()
          const nivel = this.nivelSeleccionado
          this.cursosNivel = (Array.isArray(data) ? data : []).filter(c => String(c.nivel || '').toLowerCase() === String(nivel || '').toLowerCase())
        } catch {}
      },
      async cargarMateriasDelCurso() {
        if (!this.cursoSeleccionado) { this.materiasCurso = []; return }
        try {
          const token = localStorage.getItem('token')
          const res = await fetch(`/api/cursos/${this.cursoSeleccionado}/materias`, { headers: { 'Authorization': `Bearer ${token}` } })
          if (!res.ok) { this.materiasCurso = []; return }
          const data = await res.json()
          this.materiasCurso = Array.isArray(data) ? data : []
        } catch { this.materiasCurso = [] }
      },
      async asignarProfesorAMateria() {
        if (!this.materiaSeleccionadaId || !this.profesorSeleccionado) return
        try {
          const token = localStorage.getItem('token')
          const nombreProf = `${this.profesorSeleccionado.nombre} ${this.profesorSeleccionado.apellido || ''}`.trim()
          const body = JSON.stringify({ descripcion: nombreProf })
          const res = await fetch(`/api/materias/${this.materiaSeleccionadaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body })
          if (!res.ok) {
            const d = await res.json().catch(() => ({}))
            alert(d.error || 'Error asignando profesor a materia')
            return
          }
          this.cerrarModalAsignacion()
          alert('Asignación realizada')
        } catch (err) { alert('Error de conexión') }
      },
      async crearYAsignarProfesorAMateria() {
        if (!this.cursoSeleccionado || !this.materiaNuevaNombre || !this.profesorSeleccionado) return
        try {
          const token = localStorage.getItem('token')
          const nombreProf = `${this.profesorSeleccionado.nombre} ${this.profesorSeleccionado.apellido || ''}`.trim()
          const body = JSON.stringify({ nombre: this.materiaNuevaNombre, descripcion: nombreProf })
          const res = await fetch(`/api/cursos/${this.cursoSeleccionado}/materias`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body })
          if (!res.ok) {
            const d = await res.json().catch(() => ({}))
            alert(d.error || 'Error creando materia')
            return
          }
          this.cerrarModalAsignacion()
          alert('Materia creada y asignada')
        } catch { alert('Error de conexión') }
      },
    toggleFormulario() {
      this.mostrarFormulario = !this.mostrarFormulario;
      // Si se cierra el formulario, asegurarse de que no esté en modo edición
      if (!this.mostrarFormulario) {
        this.cancelarCreacion();
      } else {
        // Si se abre el formulario, cargar los colegios si no están cargados
        if (this.colegios.length === 0)
          this.cargarColegios();
      }
    },

    actualizarNivelObligatorio() {
      this.nivelObligatorio = ['alumno', 'docente', 'dai'].includes(this.nuevoUsuario.rol);
      if (!this.nivelObligatorio) {
        this.nuevoUsuario.nivel_educativo = '';
      }
      // Si no es docente, limpiar campos de docente
      if (this.nuevoUsuario.rol !== 'docente') {
        this.nuevoUsuario.especialidad = '';
        this.nuevoUsuario.titulo = '';
        this.nuevoUsuario.colegio_id = null;
      }
    },
    
    async cargarUsuarios() {
      this.cargandoUsuarios = true;
      try {
        const token = localStorage.getItem('token');
        // Usamos una ruta que nos traiga los datos completos de los profesores
        const response = await fetch('/api/usuarios', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Mapear tipo_usuario -> rol para que el filtro por rol funcione
          this.usuarios = (Array.isArray(data) ? data : []).map(u => ({
            ...u,
            rol: u.rol || u.tipo_usuario || null
          }));
        } else if (response.status === 403) {
          alert('No tienes permisos de administrador para gestionar usuarios');
          this.$router.push('/menu');
        } else {
          const data = await response.json();
          alert('Error al cargar usuarios: ' + (data.error || response.statusText));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
      } finally {
        this.cargandoUsuarios = false;
      }
    },
    
    async cargarColegios() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/colegios', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          this.colegios = await response.json();
        } else {
          console.error('Error al cargar colegios');
        }
      } catch (error) {
        console.error('Error de conexión al cargar colegios:', error);
      }
    },

    async guardarUsuario() {
      if (this.esEdicion) {
        this.actualizarUsuario();
      } else {
        this.crearUsuario();
      }
    },

    async crearUsuario() {
      this.cargando = true;
      const tipoUsuario = (this.$route?.meta?.rol) || 'profesor'
      const payload = {
        ...this.nuevoUsuario,
        nombre: this.nuevoUsuario.nombre.trim(),
        apellido: (this.nuevoUsuario.apellido || '').trim(),
        // Campos requeridos por el backend pero no visibles en el formulario
        password: 'password123',
        tipo_usuario: tipoUsuario
      };
      if (!payload.nombre || !payload.apellido || !payload.email) {
        this.cargando = false;
        alert('Completa Nombre, Apellido y Email');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.cancelarCreacion();
          await this.cargarUsuarios(); // Usamos await para asegurar que la lista se recargue
          alert('✅ Usuario creado correctamente');
        } else {
          alert('❌ ' + (data.error || 'Error al crear usuario'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión con el servidor');
      } finally {
        this.cargando = false;
      }
    },

    editarUsuario(usuario) {
      this.esEdicion = true;
      this.usuarioEditId = usuario.id;
      this.mostrarFormulario = true;

      this.nuevoUsuario = {
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        email: usuario.email,
        nivel_educativo: usuario.nivel_educativo || '',
        fecha_contratacion: usuario.fecha_contratacion ? new Date(usuario.fecha_contratacion).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
        colegio_id: usuario.colegio_id || null
      };
      this.actualizarNivelObligatorio();
    },

    async actualizarUsuario() {
      this.cargando = true;

      const payload = {
        ...this.nuevoUsuario,
        nombre: this.nuevoUsuario.nombre.trim(),
        apellido: (this.nuevoUsuario.apellido || '').trim(),
        tipo_usuario: (this.$route?.meta?.rol) || 'profesor'
      };
      if (!payload.nombre || !payload.apellido || !payload.email) {
        this.cargando = false;
        alert('Completa Nombre, Apellido y Email');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/usuarios/${this.usuarioEditId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
          this.cancelarCreacion();
          await this.cargarUsuarios();
          alert('✅ Usuario actualizado correctamente');
        } else {
          alert('❌ ' + (data.error || 'Error al actualizar usuario'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión con el servidor');
      } finally {
        this.cargando = false;
      }
    },
    
    cancelarCreacion() {
      this.nuevoUsuario = { 
        nombre: '', 
        apellido: '',
        email: '', 
        nivel_educativo: '',
        fecha_contratacion: new Date().toISOString().slice(0,10),
        colegio_id: null
      };
      this.mostrarFormulario = false;
      this.esEdicion = false;
      this.usuarioEditId = null;
      this.nivelObligatorio = false;
    },
    
    confirmarEliminacion(usuario) {
      if (confirm(`¿Estás seguro de eliminar al usuario "${usuario.nombre}"?\nEsta acción no se puede deshacer.`)) {
        this.eliminarUsuario(usuario.id);
      }
    },
    
    async eliminarUsuario(id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/usuarios/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          await this.cargarUsuarios(); // Usamos await para asegurar la recarga
          alert('✅ Usuario eliminado exitosamente');
        } else {
          const data = await response.json();
          alert('❌ Error al eliminar usuario: ' + (data.error || response.statusText));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
      }
    },
    
    getIniciales(nombre) {
      if (!nombre) return '';
      return nombre.trim().split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);
    },
    
    getTextoRol(rol) {
      const textos = {
        'admin': 'Administrador',
        'docente': 'Docente',
        'dai': 'DAI',
        'alumno': 'Alumno',
        'profesor': 'Docente' // Para mostrar 'Docente' aunque el backend diga 'profesor'
      };
      return textos[rol] || rol;
    },
    
    getTextoNivel(nivel) {
      if (!nivel) return '';
      const textos = {
        'inicial': 'Inicial',
        'primario': 'Primario',
        'secundario': 'Secundario'
      };
      return textos[nivel] || nivel;
    },
    
    formatFecha(fecha) {
      if (!fecha) return '-';
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
.gestion-usuarios-view {
  color: white;
}

.view-header {
  margin-bottom: 2rem;
}

.view-title {
  font-size: 2.25rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  font-size: 2rem;
}

.view-subtitle {
  color: #d1d5db;
  font-size: 1.125rem;
  margin: 0;
}

.view-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.action-bar {
  display: flex;
  justify-content: flex-start;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-primary {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: white;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid #4b5563;
  color: #d1d5db;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Formulario */
.form-section {
  animation: fadeIn 0.5s ease;
}

.form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.form-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  color: #111827;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-select option {
  background: #ffffff;
  color: #111827;
}

.form-hint {
  font-size: 0.875rem;
  color: #f59e0b;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

/* Lista de usuarios */
.list-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  width: 520px;
}
.modal-title {
  margin: 0 0 1rem 0;
  color: #111827;
  font-weight: 700;
}
.modal-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.list-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: white;
}

.badge {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  width: 250px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #06b6d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  color: white;
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
}

/* Tabla */
.table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.users-table th {
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.users-table tr:last-child td {
  border-bottom: none;
}

.users-table tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-id {
  font-weight: 600;
  color: #06b6d4;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
  flex-shrink: 0;
}

.user-email {
  color: #d1d5db;
  font-size: 0.875rem;
}
.user-specialty {
  color: #d1d5db;
  font-size: 0.875rem;
  font-style: italic;
}

.role-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.role-admin {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
}

.role-docente {
  background: linear-gradient(135deg, #f59e0b, #b45309);
  color: white;
}

.role-dai {
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
}

.role-alumno {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
}

.level-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(6, 182, 212, 0.2);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.3);
  display: inline-block;
}

.no-level {
  color: #6b7280;
  font-style: italic;
}

.user-date {
  color: #9ca3af;
  font-size: 0.875rem;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.3s ease;
  font-size: 1.125rem;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-action.edit:hover {
  color: #3b82f6;
}

.btn-action.delete:hover {
  color: #ef4444;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .gestion-usuarios-view {
    padding: 1rem;
  }
  
  .view-title {
    font-size: 2rem;
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-input {
    width: 100%;
  }
  
  .search-input:focus {
    width: 100%;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .users-table {
    font-size: 0.875rem;
  }
}
</style>
