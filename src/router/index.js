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
  history: createWebHistory(import.meta.env.VITE_BASE_PATH || '/'),
  routes,
})

router.beforeEach((to, from, next) => {
  let user = null;
  
  // Controllo sicuro per localStorage
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.log('localStorage not available or invalid data');
  }
  
  // Se la route richiede l'accesso admin
  if (to.meta.requiresAdmin) {
    if (!user || user.ruolo !== 'admin') {
      return next('/login')
    }
  }
  
  // Se va alla home normale ma è admin, lo mando sulla pagina admin
  if (to.path === '/' && user?.ruolo === 'admin') {
    return next('/admin/home')
  }
  
  next()
})

export default router
