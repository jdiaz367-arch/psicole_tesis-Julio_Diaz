<template>
  <div class="menu-container">
    <!-- Fondo con gradiente -->
    <div class="background-gradient"></div>
    
    <!-- Partículas animadas -->
    <div class="particles">
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
    </div>

    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Logo -->
        <div class="logo-section">
          <img src="/logopsicole.png" alt="PSICOLE Logo" class="menu-logo-image">
          <h1 class="logo-text">PSICOLE</h1>
          <p class="logo-subtitle">Sistema Educativo</p>
        </div>

        <!-- Navegación -->
        <nav class="navigation">
          <router-link to="/menu" class="nav-item" active-class="nav-item-active">
            <div class="nav-icon">🏠</div>
            <div class="nav-text">
              <p class="nav-title">Inicio</p>
              <p class="nav-description">Página principal</p>
            </div>
            <div class="nav-indicator"></div>
          </router-link>
          <router-link to="/menu/gestion-usuarios" class="nav-item" active-class="nav-item-active">
            <div class="nav-icon user-icon">👥</div>
            <div class="nav-text">
              <p class="nav-title">Usuarios</p>
              <p class="nav-description">Gestión de usuarios</p>
            </div>
            <div class="nav-indicator"></div>
          </router-link>

          

          <router-link to="/menu/colegios" class="nav-item" active-class="nav-item-active">
            <div class="nav-icon school-icon">🏫</div>
            <div class="nav-text">
              <p class="nav-title">Colegios</p>
              <p class="nav-description">Gestión de instituciones</p>
            </div>
            <div class="nav-indicator"></div>
          </router-link>

          <router-link to="/menu/profesores" class="nav-item" active-class="nav-item-active">
            <div class="nav-icon teacher-icon">👩‍🏫</div>
            <div class="nav-text">
              <p class="nav-title">Profesores</p>
              <p class="nav-description">Personal docente</p>
            </div>
            <div class="nav-indicator"></div>
          </router-link>

          <router-link to="/menu/reportes" class="nav-item" active-class="nav-item-active">
            <div class="nav-icon reports-icon">📊</div>
            <div class="nav-text">
              <p class="nav-title">Reportes</p>
              <p class="nav-description">Estadísticas e informes</p>
            </div>
            <div class="nav-indicator"></div>
          </router-link>
        </nav>

        <!-- Cerrar sesión -->
        <button @click="cerrarSesion" class="logout-btn">
          <div class="logout-icon">🚪</div>
          <span class="logout-text">Cerrar Sesión</span>
        </button>
      </aside>

      <!-- Contenido principal -->
      <main class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-title">
            <h2 class="welcome-text">
              ¡Bienvenido, <span class="highlight-text">{{ userName }}</span>!
            </h2>
            <p class="subtitle">{{ subtitulo }}</p>
          </div>
          <div class="user-info">
            <div class="user-details">
              <p class="username">{{ userEmail }}</p>
              <p class="user-role">{{ userRole }}</p>
            </div>
            <div class="user-avatar">{{ userInitial }}</div>
          </div>
        </header>

        <!-- Contenido dinámico de las rutas -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

        <!-- Dashboard (solo se muestra en la ruta principal del menú) -->
        <div v-if="mostrarDashboard" class="dashboard-content">
          <!-- Tarjetas de niveles educativos -->
          <section class="levels-section">
            <h3 class="section-title">Niveles Educativos</h3>
            <div class="levels-grid">
              <div class="level-card level-inicial" @click="navigateTo('/menu/inicial')">
                <div class="level-icon">🎨</div>
                <h4 class="level-title">Nivel Inicial</h4>
                <p class="level-description">Primeros pasos educativos</p>
              </div>

              <div class="level-card level-primario" @click="navigateTo('/menu/primario')">
                <div class="level-icon">📚</div>
                <h4 class="level-title">Nivel Primario</h4>
                <p class="level-description">Educación fundamental</p>
              </div>

              <div class="level-card level-secundario" @click="navigateTo('/menu/secundario')">
                <div class="level-icon">🎓</div>
                <h4 class="level-title">Nivel Secundario</h4>
                <p class="level-description">Preparación profesional</p>
              </div>

            </div>
          </section>

          <!-- Estadísticas -->
          <section class="stats-section">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                  <p class="stat-label">Total Alumnos</p>
                  <p class="stat-value">{{ stats.students }}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">👩‍🏫</div>
                <div class="stat-info">
                  <p class="stat-label">Profesores</p>
                  <p class="stat-value">{{ stats.teachers }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Modal Crear Usuario -->
        <div v-if="showUserModal" class="user-modal-backdrop">
          <div class="user-modal">
            <h3 class="form-title">Crear Nuevo Usuario</h3>
            <form @submit.prevent="createUser" class="user-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nombre *</label>
                  <input v-model="newUser.nombre" placeholder="Nombre" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Apellido *</label>
                  <input v-model="newUser.apellido" placeholder="Apellido" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <input v-model="newUser.email" placeholder="Email" type="email" class="form-input" required />
                </div>
                
                <!-- Campo adicional para colegio si es alumno -->
                <div class="form-group" v-if="newUser.tipo_usuario === 'alumno'">
                  <label class="form-label">Colegio</label>
                  <select v-model="newUser.colegio_id" class="form-select">
                    <option disabled value="">Seleccione un Colegio</option>
                    <option v-for="colegio in colegiosList" :key="colegio.id" :value="colegio.id">{{ colegio.nombre }}</option>
                  </select>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" @click="closeUserModal" class="btn btn-outline">Cancelar</button>
                <button type="submit" class="btn btn-success" :disabled="creatingUser">{{ creatingUser ? 'Creando...' : 'Crear Usuario' }}</button>
              </div>
            </form>

            <div class="existing-users-section">
              <h4 class="existing-users-title">Usuarios existentes</h4>
              <ul class="users-list">
                <li v-for="u in usersList" :key="u.id">{{ u.id }} — {{ (u.nombre || (u.email && u.email.split('@')[0]) || '-') }} {{ u.apellido || '' }} — {{ u.email }} — {{ u.tipo_usuario }}</li>
              </ul>
              </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "Menu",
  emits: ['logout'],
  data() {
    return {
      userName: 'Administrador',
      userEmail: 'admin@psicole.com',
      userRole: 'Administrador',
      userInitial: 'A',
      stats: {
        students: 0,
        teachers: 0,
        reports: 0,
      },
      // modal / usuarios
      showUserModal: false,
      newUser: {
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        tipo_usuario: 'alumno' // Por defecto 'alumno' que es un rol válido
      },
      creatingUser: false,
      usersList: [],
      colegiosList: [] // Lista para los colegios
    }
  },
  computed: {
    mostrarDashboard() {
      // Mostrar dashboard solo en la ruta principal del menú
      return this.$route.name === 'Menu' || !this.$route.name;
    },
    subtitulo() {
      // Cambiar el subtítulo según la sección activa
      const rutas = {
        'GestionUsuarios': 'Gestión de Usuarios del Sistema',
        'Alumno': 'Gestión de Alumnos',
        'Profesores': 'Gestión de Profesores',
        'Reportes': 'Visualización de Reportes',
        'Inicial': 'Nivel Educativo Inicial',
        'Primario': 'Nivel Educativo Primario',
        'Secundario': 'Nivel Secundario',
        'buscar': 'Búsqueda Avanzada de Alumnos'
      };
      const routeName = this.$route.name || '';
      return rutas[routeName.replace('Menu-', '')] || 'Sistema de Gestión Educativa Integral';
    }
  },
  mounted() {
    this.loadUserData();
    this.loadStats();
  },
  methods: {
    loadUserData() {
      // Cargar datos del usuario desde localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.userName = user.nombre || user.name || 'Usuario';
          this.userEmail = user.email || 'usuario@psicole.com';
          this.userRole = user.rol || user.role || 'Usuario';
          this.userInitial = (user.nombre || user.name || 'U').charAt(0).toUpperCase();
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
        }
      }
    },

    async loadStats() {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        const [studentsRes, teachersRes, daiRes] = await Promise.all([
          fetch('/api/alumnos', { headers }),
          fetch('/api/profesores', { headers }),
          fetch('/api/dai', { headers })
        ]);

        if (studentsRes.ok) {
          this.stats.students = (await studentsRes.json()).length;
        }
        if (teachersRes.ok) {
          this.stats.teachers = (await teachersRes.json()).length;
        }
        if (daiRes.ok) {
          // Asumimos que los reportes de hoy son todos los registros de DAI por simplicidad.
          // Esto se podría refinar en el backend con un endpoint específico.
          this.stats.reports = (await daiRes.json()).length;
        }
      } catch (error) {
        console.error("Error al cargar las estadísticas:", error);
      }
    },

    cerrarSesion() {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.$router.push('/');
      }
    },

    navigateTo(route) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (!token || !user) {
        this.$router.push({ path: '/login', query: { redirect: route } });
        return;
      }
      this.$router.push(route);
    },

    // --- usuarios ---
    async openUserModal() {
      this.newUser = {
        nombre: '',
        apellido: '',
        email: '',
        tipo_usuario: 'alumno',
        colegio_id: ''
      };
      this.showUserModal = true; // Mostrar modal después de resetear
      await this.fetchUsers();
      await this.fetchColegios(); // Cargar colegios al abrir el modal
    },
    closeUserModal() { this.showUserModal = false; },
    goToColegios() { this.$router.push('/menu/colegios'); },
    async fetchUsers() {
      try {
        // CORREGIDO: La ruta correcta es /api/usuarios
        const res = await fetch('/api/usuarios', { // Ruta correcta
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) this.usersList = await res.json();
        else this.usersList = [];
      } catch (err) {
        console.warn('No se pudo obtener lista de usuarios:', err.message);
        this.usersList = [];
      }
    },
    async fetchColegios() {
      try {
        const res = await fetch('/api/colegios', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) this.colegiosList = await res.json();
        else this.colegiosList = [];
      } catch (err) {
        console.warn('No se pudo obtener lista de colegios:', err.message);
        this.colegiosList = [];
      }
    },
    async createUser() {
      if (!this.newUser.nombre || !this.newUser.apellido || !this.newUser.email) {
        alert('Complete nombre, apellido y email.');
        return;
      }
      this.creatingUser = true;
      try {
        // CORREGIDO: La ruta correcta es /api/usuarios
        const res = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            nombre: this.newUser.nombre,
            apellido: this.newUser.apellido,
            email: this.newUser.email,
            password: this.newUser.password || `${String(this.newUser.email).split('@')[0] || 'psicole'}${Math.floor(1000+Math.random()*9000)}`,
            // Enviamos tipo_usuario por defecto sin mostrarlo en UI
            tipo_usuario: 'alumno',
            colegio_id: this.newUser.colegio_id || null
          })
        });
        if (res.ok) {
          alert('Usuario creado correctamente.');
          this.newUser = {
            nombre: '',
            apellido: '',
            email: '',
            password: '',
            tipo_usuario: 'alumno',
            colegio_id: ''
          };
          await this.fetchUsers();
        } else {
          const err = await res.json().catch(() => ({ error: 'Error' }));
          alert('Error creando usuario: ' + (err.error || res.status));
        }
      } catch (err) {
        alert('Error de conexión al crear usuario: ' + err.message);
      } finally {
        this.creatingUser = false;
      }
    }
  }
};
</script>

<style scoped>
/* Estilos base */
.menu-container {
  min-height: 100vh;
  position: relative;
  font-family: system-ui, sans-serif;
}

.background-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a, #1e1b4b, #0f172a);
  z-index: -2;
}

/* Partículas animadas */
.particles {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.particle-1 {
  top: 20%;
  left: 20%;
  width: 8px;
  height: 8px;
  background: #22d3ee;
  animation-delay: 0s;
}

.particle-2 {
  top: 60%;
  right: 25%;
  width: 6px;
  height: 6px;
  background: #a855f7;
  animation-delay: 2s;
}

.particle-3 {
  bottom: 30%;
  left: 30%;
  width: 4px;
  height: 4px;
  background: #06b6d4;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-20px) translateX(10px); }
}

/* Layout principal */
.layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 320px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 3rem;
}

.menu-logo-image {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  object-fit: contain;
  filter: drop-shadow(0 8px 20px rgba(6, 182, 212, 0.3));
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.logo-subtitle {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Navegación */
.navigation {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(6, 182, 212, 0.3);
  transform: scale(1.05);
}

.nav-item-active {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 5px 15px rgba(6, 182, 212, 0.2);
}

.nav-item-active .nav-indicator {
  opacity: 1;
  transform: scale(1.2);
}

.nav-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  transition: transform 0.3s ease;
  color: white;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.user-icon { background: linear-gradient(135deg, #06b6d4, #3b82f6); }
.student-icon { background: linear-gradient(135deg, #10b981, #047857); }
.school-icon { background: linear-gradient(135deg, #f97316, #f59e0b); }
.teacher-icon { background: linear-gradient(135deg, #f59e0b, #dc2626); }
.reports-icon { background: linear-gradient(135deg, #8b5cf6, #ec4899); }

.nav-text {
  flex: 1;
}

.nav-title {
  color: rgb(230, 228, 228);
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
}

.nav-description {
  color: #7e8187;
  font-size: 0.75rem;
  margin: 0;
}

.nav-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
  transform: scale(0.8);
}

.user-icon ~ .nav-indicator { background: #06b6d4; }
.student-icon ~ .nav-indicator { background: #10b981; }
.school-icon ~ .nav-indicator { background: #f97316; }
.teacher-icon ~ .nav-indicator { background: #f59e0b; }
.reports-icon ~ .nav-indicator { background: #8b5cf6; }

/* Botón cerrar sesión */
.logout-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #ef4444, #ec4899);
  border: none;
  color: rgb(27, 25, 25);
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #dc2626, #db2777);
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
}

.logout-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Contenido principal */
.main-content {
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.welcome-text {
  font-size: 2.25rem;
  font-weight: bold;
  color: rgb(32, 40, 192);
  margin: 0 0 0.5rem 0;
}

.highlight-text {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #d1d5db;
  font-size: 1.125rem;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-details {
  text-align: right;
}

.username {
  color: white;
  font-weight: 600;
  margin: 0;
}

.user-role {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 8px 20px rgba(6, 182, 212, 0.3);
}

/* Dashboard Content */
.dashboard-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Sección de niveles */
.levels-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-bottom: 2rem;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.level-card {
  padding: 2rem;
  border-radius: 24px;
  text-align: center;
  color: rgb(35, 35, 35);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.level-card:hover {
  transform: scale(1.05);
}

.level-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
}

.level-card:hover::before {
  background: rgba(0, 0, 0, 0.1);
}

.level-inicial {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  box-shadow: 0 20px 40px rgba(236, 72, 153, 0.3);
}

.level-primario {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
}

.level-secundario {
  background: linear-gradient(135deg, #10b981, #047857);
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
}

.level-buscar {
  background: linear-gradient(135deg, #f59e0b, #dc2626);
  box-shadow: 0 20px 40px rgba(245, 158, 11, 0.3);
}

.level-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.level-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  position: relative;
  z-index: 1;
}

.level-description {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* Estadísticas */
.stats-section {
  margin-top: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card:hover {
  border-color: rgba(6, 182, 212, 0.3);
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  color: #d3d9e0;
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.stat-value {
  color: rgb(241, 238, 238);
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

/* Transiciones para router-view */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scroll personalizado */
.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.main-content::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #06b6d4, #3b82f6);
  border-radius: 10px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #0891b2, #2563eb);
}

/* Modal crear usuario */
.user-modal-backdrop {
  position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.6); z-index: 2000;
}
.user-modal {
  width: 600px; max-width: 95%; background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  color: #111827;
}

/* Estilos del formulario tomados de GestionUsuarios.vue */
.form-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  color: #111827;
  text-align: center;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
.existing-users-section {
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
}
.existing-users-title {
  font-size: 1rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}
.users-list { max-height: 160px; overflow:auto; padding:0; list-style:none; font-size: 0.875rem; color: #d1d5db; }
.users-list li { padding:0.5rem; border-bottom:1px solid rgba(255,255,255,0.1); }
.users-list li:last-child { border-bottom: none; }

/* Responsive */
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .user-info {
    justify-content: center;
  }
  
  .levels-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-text {
    font-size: 1.75rem;
  }
  
  .main-content {
    padding: 1.5rem;
  }

  .user-modal {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    padding: 1rem;
  }
  
  .logo-section {
    margin-bottom: 2rem;
  }
  
  .navigation {
    gap: 0.5rem;
  }
  
  .nav-item {
    padding: 0.75rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .welcome-text {
    font-size: 1.5rem;
  }
}
</style>
