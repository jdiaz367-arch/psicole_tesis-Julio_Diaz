<template>
  <div class="form-container">
    <h2>Crear Usuario</h2>
    <form @submit.prevent="crearUsuario">
      <input v-model="nombre" placeholder="Nombre" required />
      <input v-model="apellido" placeholder="Apellido" required />
      <input v-model="email" type="email" placeholder="Email" required />
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Creando...' : 'Crear Usuario' }}
      </button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
  </div>
</template>

<script>
export default {
  name: 'Usuarios',
  data() {
    return {
      nombre: '',
      apellido: '',
      email: '',
      loading: false,
      error: '',
      success: ''
    };
  },
  methods: {
    async crearUsuario() {
      this.loading = true;
      this.error = '';
      this.success = '';
      try {
        const res = await fetch('http://localhost:3000/api/users', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            nombre: this.nombre,
            apellido: this.apellido,
            email: this.email
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
        this.success = 'Usuario creado con éxito';
        this.nombre = this.apellido = this.email = '';
      } catch (err) {
        console.error(err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.form-container {
  max-width: 480px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  color: #111827;
  font-family: sans-serif;
}
input, select, button {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}
button {
  background: #2563eb;
  color: white;
  cursor: pointer;
}
button:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: #ff6b6b; }
.success { color: #4ade80; }
</style>
