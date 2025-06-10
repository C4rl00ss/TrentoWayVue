import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'
import AdminHomeView from '../views/AdminHome.vue'
import AdminGestioneSegnapostoView from '../views/AdminGestioneSegnaposto.vue'


const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  {
    path: '/admin/home',
    name: 'adminHome',
    component: AdminHomeView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/gestione-segnaposto',
    name: 'adminGestioneSegnaposto',
    component: AdminGestioneSegnapostoView,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'))

  // Se la route richiede l'accesso admin
  if (to.meta.requiresAdmin) {
    if (!user || user.ruolo !== 'admin') {
      // Utente non loggato o non admin -> redireziona alla login o alla home
      return next('/login') // oppure '/' se preferisci
    }
  }

  // Se va alla home normale ma è admin, lo mando sulla pagina admin
  if (to.path === '/' && user?.ruolo === 'admin') {
    return next('/admin/home')
  }

  next()
})

export default router
