<script setup>
import { ref } from 'vue'
import { setLoggedUser } from '@/states/loggedUser'
import { useRouter } from 'vue-router'

const router = useRouter()

const HOST = import.meta.env.VITE_API_HOST || 'http://localhost:3000'
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

    // Se errore, esco subito
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Errore login');
    }

    // Salva l'utente nello stato globale
    setLoggedUser(data);

    // Salva token e utente nel localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('Utente salvato nel localStorage:', data.user);

    // Redirect in base al ruolo
    console.log(`Reindirizzamento a ${data.redirectTo}`);
    router.push(data.redirectTo);


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
