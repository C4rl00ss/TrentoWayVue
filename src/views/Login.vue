<script setup>
import { ref } from 'vue'
import { setLoggedUser } from '@/states/loggedUser'

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
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Errore login');
    }

    setLoggedUser(data);
    console.log("Login riuscito:", data.user);

    // 👇 Esegui il redirect come specificato dal backend
    window.location.href = data.redirectTo;

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
