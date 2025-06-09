import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'
import AdminView from '../views/AdminDashboard.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/admin/dashboard', name: 'AdminDashboard', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' } // catch-all
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  let user = null;
  const token = localStorage.getItem('token');

  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    console.warn('Errore parsing utente:', e);
  }

  if (to.meta.requiresAuth) {
    if (!token) return next('/login');

    if (to.meta.requiresAdmin && (!user || user.ruolo !== 'admin')) {
      console.warn('Accesso negato: non sei admin');
      return next('/');
    }
  }

  next();
});

export default router;
