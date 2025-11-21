<template>
  <div class="form-container">
    <h2>Crear Colegio</h2>
    <form @submit.prevent="crearColegio">
      <input v-model="nombre" placeholder="Nombre del colegio" required />
      <input v-model="direccion" placeholder="Dirección" />
      <input v-model="telefono" placeholder="Teléfono" />
      <input v-model="email" type="email" placeholder="Email" />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Creando...' : 'Crear Colegio' }}
      </button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>

    <!-- Lista de colegios -->
    <div class="colegios-list">
      <h3>Colegios registrados</h3>
      <div v-if="colegios.length === 0" class="empty">No hay colegios registrados.</div>
      <div v-else>
        <div v-for="colegio in colegios" :key="colegio.id" class="colegio-card">
          <div class="colegio-info">
            <strong>{{ colegio.nombre }}</strong>
            <span v-if="colegio.telefono"> - Tel: {{ colegio.telefono }}</span>
            <span v-if="colegio.email"> - {{ colegio.email }}</span>
          </div>
          <div class="colegio-details">
            <small v-if="colegio.direccion">Dirección: {{ colegio.direccion }}</small>
            <small v-if="colegio.created_at">Creado: {{ new Date(colegio.created_at).toLocaleDateString() }}</small>
          </div>
          <div class="colegio-actions">
            <button class="btn-delete" @click="eliminarColegio(colegio.id)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Colegios',
  data() {
    return {
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      loading: false,
      error: '',
      success: '',
      colegios: []
    };
  },
  mounted() {
    this.obtenerColegios();
  },
  methods: {
    async obtenerColegios() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/colegios', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Error al obtener colegios');
        this.colegios = await res.json();
      } catch (err) {
        console.error('Error obteniendo colegios:', err);
      }
    },
    async crearColegio() {
      this.loading = true;
      this.error = '';
      this.success = '';
      try {
        const res = await fetch('/api/colegios', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            nombre: this.nombre,
            direccion: this.direccion,
            telefono: this.telefono,
            email: this.email
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear colegio');
        this.success = 'Colegio creado con éxito';
        this.nombre = this.direccion = this.telefono = this.email = '';
        await this.obtenerColegios();
      } catch (err) {
        console.error(err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async eliminarColegio(id) {
      try {
        const res = await fetch(`/api/colegios/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'No se pudo eliminar el colegio')
        }
        this.success = 'Colegio eliminado'
        await this.obtenerColegios()
      } catch (err) {
        this.error = err.message
      }
    }
  }
};
</script>

<style scoped>
.form-container {
  max-width: 400px;
  margin: 2rem auto;
  background: rgba(255,255,255,0.05);
  padding: 2rem;
  border-radius: 12px;
  color: white;
  font-family: sans-serif;
}
input, button {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
}
button {
  background: #2563eb;
  color: white;
  cursor: pointer;
}
button:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: #ff6b6b; }
.success { color: #4ade80; }

/* Estilos lista de colegios */
.colegios-list {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.2);
}
.colegios-list h3 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}
.empty { color: #bbb; }
.colegio-card {
  background: rgba(255,255,255,0.1);
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  border-left: 4px solid #2563eb;
}
.colegio-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.colegio-info strong { color: white; }
.colegio-info span { color: #ccc; }
.colegio-details { display: flex; gap: 1rem; }
.colegio-details small { color: #aaa; }
.colegio-actions { margin-top: 8px; }
.btn-delete { background: #dc3545; color: white; }
</style>
