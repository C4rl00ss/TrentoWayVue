<script setup>
import { ref } from 'vue'
import { setLoggedUser } from '@/states/loggedUser'
import { useRouter } from 'vue-router'

const router = useRouter()

const HOST = import.meta.env.VITE_API_BASE_URL
const API_URL = `${HOST}/api/v1/autenticazione/login`

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const emit = defineEmits(['login'])

async function login() {
  errorMessage.value = '';
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      }),
    });

    let data;
    try {
      data = await response.json();
      console.log('Risposta dal backend:', data);
    } catch (jsonErr) {
      throw new Error('Errore nel parsing della risposta del server');
    }

    //Se errore esco prima
    if (!response.ok) {
      throw new Error(data.message || 'Errore login');
    }

    // Salva il login nello stato globale
    setLoggedUser(data);

    const ruoloEffettivo = data.user.role || data.user.ruolo;
    console.log('Ruolo ricevuto:', ruoloEffettivo);

    // Adattiamo il campo "role" a "ruolo" per coerenza con il router
    const utenteCorretto = {
      id: data.user.id,
      email: data.user.email,
      username: data.user.username,
      ruolo: ruoloEffettivo 
    };

    // Salva l'utente nel localStorage
    localStorage.setItem('user', JSON.stringify(utenteCorretto));

    localStorage.setItem('token', data.token);
    console.log('Utente salvato nel localStorage:', utenteCorretto);

    // redirect basato sul ruolo
    if (utenteCorretto.ruolo === 'admin') {
      console.log('Reindirizzamento a /admin/dashboard');
      router.push('/admin/dashboard');
    } else {
      console.log('Reindirizzamento a /');
      router.push('/');
    }

    //const ruolo = data.user?.ruolo || data.user?.role || '';
    //if (ruolo === 'admin') {
    //  router.push('/admin/dashboard');
    //} else {
    //  router.push('/');
    //}
    //console.log('REDIRECT TO:', data.redirectTo);

  } catch (error) {
    errorMessage.value = error.message;
    console.error("Errore durante il login:", error.message);
  }
}


</script>

<template>
  <div class="login-container">
    <h1>Accedi</h1>
    <form @submit.prevent="login" class="login-form">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Accedi</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.login-form {
  display: flex;
  flex-direction: column;
  width: 300px;
}
input {
  margin: 10px 0;
  padding: 10px;
  font-size: 1rem;
}
button {
  padding: 10px;
  background-color: #0077cc;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #005fa3;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
