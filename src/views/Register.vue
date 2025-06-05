<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const HOST = import.meta.env.VITE_API_HOST || 'http://localhost:3000'
const API_URL = `${HOST}/api/v1/autenticazione/registrazione`

const email = ref('')
const password = ref('')
const confermaPassword = ref('')
const nome = ref('')
const cognome = ref('')
const username = ref('')
const errorMessage = ref('')
const successMessage = ref('')

async function register() {
  errorMessage.value = ''
  successMessage.value = ''

  const dati = {
    username: username.value,
    email: email.value,
    password: password.value,
    confirmPassword: confermaPassword.value,
    firstName: nome.value,
    lastName: cognome.value
  }

  console.log("Dati inviati al backend:", dati)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dati),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Errore registrazione')
    }

    // Salva il login
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)

    // Redirect alla home
    router.push(data.redirectTo || '/')

    successMessage.value = 'Registrazione completata con successo!'
  } catch (error) {
    errorMessage.value = error.message

  }
}
</script>

<template>
  <div class="register-container">
    <h1>Registrati</h1>
    <form @submit.prevent="register" class="register-form">
      <input v-model="nome" type="text" placeholder="Nome" required />
      <input v-model="cognome" type="text" placeholder="Cognome" required />
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <input v-model="confermaPassword" type="password" placeholder="Conferma Password" required />
      <button type="submit">Registrati</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </form>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.register-form {
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
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #218838;
}
.error {
  color: red;
  margin-top: 10px;
}
.success {
  color: green;
  margin-top: 10px;
}
</style>
