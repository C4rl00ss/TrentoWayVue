import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'
import AdminHomeView from '../views/AdminHome.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/admin/home', name: 'adminHome', component: AdminHomeView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 🔐 Redirect automatico se l'utente è già loggato come admin
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'))

  // Se va alla home normale ma è admin, lo mando sulla pagina admin
  if (to.path === '/' && user?.ruolo === 'admin') {
    return next('/admin/home')
  }

  next()
})

export default router
