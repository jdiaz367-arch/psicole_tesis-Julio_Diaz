import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { 
    path: '/', 
    redirect: '/login' 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: () => import('@/views/login.vue') 
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('@/views/Menu.vue'),
    children: [
      {
        path: 'gestion-usuarios', // <-- CORREGIDO
        name: 'GestionUsuarios',
        component: () => import('@/views/GestionUsuarios.vue'), // Corregido para usar el componente correcto
        meta: { 
          title: 'Gestión de Usuarios',
          requiresAuth: true,
          rol: null // Mostrar todos los roles
        }
      },
      {
        path: 'colegios',
        name: 'Colegios',
        component: () => import('@/views/Colegio.vue'),
        meta: { 
          title: 'Gestión de Colegios',
          requiresAuth: true
        }
      },
      {
        path: 'alumno',
        name: 'Alumno',
        component: () => import('@/views/Alumno.vue'),
        meta: { 
          title: 'Gestión de Alumnos',
          requiresAuth: true
        }
      },
      {
        path: 'alumno/:id',
        name: 'AlumnoDetalle',
        component: () => import('@/views/Alumno.vue'),
        meta: {
          title: 'Detalle de Alumno',
          requiresAuth: true
        }
      },
      {
        path: 'profesores', // <-- CORREGIDO
        name: 'Profesores',
        component: () => import('@/views/GestionUsuarios.vue'), // TODO: Cambiar a GestionProfesores.vue cuando esté listo
        meta: {
          title: 'Gestión de Profesores',
          requiresAuth: true,
          rol: 'profesor' // Mostrar solo profesores
        }
      },
      {
        path: 'reportes',
        name: 'Reportes',
        component: () => import('@/views/Reportes.vue'),
        meta: { 
          title: 'Reportes y Estadísticas',
          requiresAuth: true
        }
      },
      {
        path: 'calificaciones',
        name: 'Calificaciones',
        component: () => import('@/views/Calificaciones.vue'),
        meta: {
          title: 'Gestión de Calificaciones',
          requiresAuth: true
        }
      },
      {
        path: 'simple-notas',
        name: 'SimpleNotas',
        component: () => import('@/views/SimpleNotasPlanificaciones.vue'),
        meta: {
          title: 'Materias, Notas y Planificaciones (Simple)',
          requiresAuth: true
        }
      },
      {
        path: 'asignaturas',
        name: 'Asignaturas',
        component: () => import('@/views/Asignaturas.vue'),
        meta: {
          title: 'Gestión de Asignaturas',
          requiresAuth: true
        }
      },
      {
        path: 'inicial',
        name: 'Inicial',
        component: () => import('@/views/Inicial.vue'),
        meta: { 
          title: 'Nivel Inicial',
          requiresAuth: true
        }
      },
      {
        path: 'boletin',
        name: 'Boletin',
        component: () => import('@/views/Boletin.vue'),
        meta: {
          title: 'Boletín Académico',
          requiresAuth: true
        }
      },
      {
        path: 'primario',
        name: 'Primario',
        component: () => import('@/views/Primario.vue'),
        meta: { 
          title: 'Nivel Primario',
          requiresAuth: true
        }
      },
      {
        path: 'secundario',
        name: 'Secundario',
        component: () => import('@/views/Secundario.vue'),
        meta: { 
          title: 'Nivel Secundario',
          requiresAuth: true
        }
      }
    ]
  },
  // Ruta de fallback para 404
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/menu' 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación para autenticación
router.beforeEach((to, from, next) => {
  // Verificar si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      // Redirigir al login si no está autenticado
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // Verificar rol si es necesario (para futuras implementaciones)
      if (to.meta.requiresAdmin) {
        try {
          const userData = JSON.parse(user)
          if (userData.rol !== 'admin') {
            alert('No tienes permisos para acceder a esta sección')
            next('/menu')
            return
          }
        } catch (error) {
          console.error('Error al verificar permisos:', error)
        }
      }
      
      next()
    }
  } else {
    next() // Continuar si no requiere autenticación
  }
})

// Actualizar el título de la página dinámicamente
router.afterEach((to) => {
  const title = to.meta?.title || 'PSICOLE - Sistema Educativo'
  document.title = title
})

export default router
