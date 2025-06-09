import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'
import AdminHomeView from '../views/AdminHome.vue'


const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/adminHome', name: 'adminHome', component: AdminHomeView },
  { path: '/admin/dashboard', name: 'AdminDashboard', component: () => import('@/views/AdminDashboard.vue'), meta: { requiresAuth: true, requiresAdmin: true } }, 
  
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  if (to.meta.requiresAdmin) {
    if (!user || user.ruolo !== 'admin') {
      console.warn('Accesso negato: non sei admin');
      return next('/');
    }
  }

  next();
});

export default router


