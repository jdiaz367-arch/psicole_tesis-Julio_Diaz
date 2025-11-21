<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <img src="/logopsicole.png" alt="PSICOLE SOFT Logo" class="logo-image" />
        <h1>PSICOLE</h1>
        <p>SOFT</p>
      </div>

      <h2>Inicio de Sesión</h2>

      <form @submit.prevent="iniciarSesion">
        <div class="input-group">
          <input v-model="email" placeholder="Email" type="email" required />
        </div>
        <div class="input-group">
          <input type="password" v-model="clave" placeholder="Contraseña" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="test-credentials">
        <p><strong>Credenciales de prueba:</strong></p>
        <p>Email: admin@psicole.com</p>
        <p>Contraseña: admin123</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      clave: '',
      error: '',
      loading: false
    };
  },
  methods: {
    async iniciarSesion() {
      const TEST_EMAIL = 'admin@psicole.com';
      const TEST_PASS = 'admin123';

      this.loading = true;
      this.error = '';

      // Intentar primero con localhost y luego con 127.0.0.1 (fallback IPv4)
      const loginUrls = [
        '/api/login'
      ];

      let autenticado = false;
      let ultimoError = '';

      for (const url of loginUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: this.email, password: this.clave })
          });

          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            this.$router.push('/menu');
            autenticado = true;
            break;
          } else {
            const errData = await res.json().catch(() => null);
            ultimoError = errData?.error || `Error en el login (${res.status})`;
          }
        } catch (err) {
          console.error(`Error de conexión con backend (${url}):`, err);
          ultimoError = 'Error de conexión con el servidor.';
        }
      }

      if (!autenticado) {
        this.error = ultimoError || 'Error de conexión con el servidor. Verifica que el backend esté corriendo.';
      }

      this.loading = false;
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a, #1e1b4b);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 2rem;
}

.login-box {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  text-align: center;
  width: 400px;
  max-width: 100%;
  color: white;
}

.logo { margin-bottom: 1rem; }
.logo-image { width: 72px; height: 72px; object-fit: contain; margin-bottom: 0.25rem; }
h2 { margin: 1rem 0; }
.input-group { margin-bottom: 1rem; }
input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  outline: none;
}
button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
button:disabled { opacity: 0.6; cursor: not-allowed; }

.error { color: #ff6b6b; margin-top: 0.75rem; }
.test-credentials { margin-top: 1rem; font-size: 0.9rem; opacity: 0.9; }
</style>
